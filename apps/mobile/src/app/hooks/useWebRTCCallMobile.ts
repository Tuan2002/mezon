import { ActionEmitEvent, sessionConstraints } from '@mezon/mobile-components';
import { DMCallActions, useAppDispatch } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { useNavigation } from '@react-navigation/native';
import { WebrtcSignalingType } from 'mezon-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { deflate, inflate } from 'react-native-gzip';
import InCallManager from 'react-native-incall-manager';
import Sound from 'react-native-sound';
import Toast from 'react-native-toast-message';
import { MediaStream, RTCIceCandidate, RTCPeerConnection, RTCSessionDescription, mediaDevices } from 'react-native-webrtc';
import { usePermission } from './useRequestPermission';

// Configuration constants
const STUN_SERVERS = [
	{ urls: 'stun:stun.l.google.com:19302' },
	{ urls: 'stun:stun1.l.google.com:19302' },
	{ urls: 'stun:stun2.l.google.com:19302' },
	{ urls: 'stun:stun1.3.google.com:19302' }
];
// const STUN_SERVERS = [{ urls: 'stun:stun.l.google.com:19305' }];

const RTCConfig = {
	iceServers: STUN_SERVERS,
	iceCandidatePoolSize: 10
};

interface CallState {
	localStream: MediaStream | null;
	remoteStream: MediaStream | null;
	peerConnection: RTCPeerConnection | null;
	storedIceCandidates?: RTCIceCandidate[] | null;
}

const compress = async (str: string) => {
	return await deflate(str);
};

const decompress = async (compressedStr: string) => {
	return await inflate(compressedStr);
};

type MediaControl = {
	mic: boolean;
	camera: boolean;
	speaker?: boolean;
};

export function useWebRTCCallMobile(dmUserId: string, channelId: string, userId: string, isVideoCall: boolean) {
	const [callState, setCallState] = useState<CallState>({
		localStream: null,
		remoteStream: null,
		peerConnection: null,
		storedIceCandidates: null
	});
	const { cameraPermissionGranted, microphonePermissionGranted, requestMicrophonePermission, requestCameraPermission } =
		usePermission();
	const mezon = useMezon();
	const dispatch = useAppDispatch();
	const navigation = useNavigation<any>();
	const [localMediaControl, setLocalMediaControl] = useState<MediaControl>({
		mic: true,
		camera: !!isVideoCall,
		speaker: false
	});
	const dialToneRef = useRef<Sound | null>(null);

	// Initialize peer connection with proper configuration
	const initializePeerConnection = useCallback(() => {
		const pc = new RTCPeerConnection(RTCConfig);
		pc.addEventListener('icecandidate', async (event) => {
			if (event?.candidate) {
				await mezon.socketRef.current?.forwardWebrtcSignaling(
					dmUserId,
					WebrtcSignalingType.WEBRTC_ICE_CANDIDATE,
					JSON.stringify(event.candidate),
					'',
					userId
				);
			}
		});
		pc.addEventListener('track', (event) => {
			if (event.streams[0]) {
				setCallState((prev) => ({
					...prev,
					remoteStream: event.streams[0] as MediaStream
				}));
			}
		});
		pc.addEventListener('iceconnectionstatechange', (event) => {
			if (pc.iceConnectionState === 'connected') {
				Toast.show({
					type: 'info',
					text1: 'Connection connected'
				});
				stopDialTone();
			}
			if (pc.iceConnectionState === 'disconnected') {
				Toast.show({
					type: 'error',
					text1: 'Connection disconnected'
				});
				handleEndCall();
			}
		});

		return pc;
	}, [mezon.socketRef, dmUserId, userId]);

	useEffect(() => {
		if (callState.localStream) {
			callState.localStream?.getVideoTracks().forEach((track) => {
				if (!localMediaControl?.camera) {
					track.enabled = false;
				}
			});
		}
	}, [callState.localStream, localMediaControl?.camera]);

	const startCall = async (isVideoCall: boolean) => {
		try {
			InCallManager.start({ media: 'audio' });
			playDialTone();
			if (!microphonePermissionGranted) {
				setLocalMediaControl((prev) => ({
					...prev,
					mic: false
				}));
				requestMicrophonePermission();
			}
			if (!cameraPermissionGranted && isVideoCall) {
				requestCameraPermission();
				setLocalMediaControl((prev) => ({
					...prev,
					camera: false
				}));
			}
			const stream = await mediaDevices.getUserMedia({
				audio: true,
				video: isVideoCall && cameraPermissionGranted
			});

			const pc = initializePeerConnection();

			// Add tracks to peer connection
			stream.getTracks().forEach((track) => {
				pc.addTrack(track, stream);
			});
			// Create and set local description
			const offer = await pc.createOffer(sessionConstraints);
			await pc.setLocalDescription(offer);

			// Update state
			setCallState({
				localStream: stream,
				remoteStream: null,
				peerConnection: pc
			});
			// Send offer through signaling server
			const compressedOffer = await compress(JSON.stringify(offer));
			await mezon.socketRef.current?.forwardWebrtcSignaling(dmUserId, WebrtcSignalingType.WEBRTC_SDP_OFFER, compressedOffer, channelId, userId);
		} catch (error) {
			console.error('Error starting call:', error);
			handleEndCall();
		}
	};

	// Handle incoming signaling messages
	const handleSignalingMessage = async (signalingData: any) => {
		if (!callState.peerConnection) return;

		try {
			switch (signalingData.data_type) {
				case WebrtcSignalingType.WEBRTC_SDP_OFFER: {
					const decompressedData = await decompress(signalingData.json_data);
					const offer = JSON.parse(decompressedData || '{}');

					await callState.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
					const answer = await callState.peerConnection.createAnswer();
					await callState.peerConnection.setLocalDescription(answer);

					const compressedAnswer = await compress(JSON.stringify(answer));
					await mezon.socketRef.current?.forwardWebrtcSignaling(
						dmUserId,
						WebrtcSignalingType.WEBRTC_SDP_ANSWER,
						compressedAnswer,
						channelId,
						userId
					);

					// Add stored ICE candidates
					if (callState.storedIceCandidates) {
						for (const candidate of callState.storedIceCandidates) {
							await callState.peerConnection.addIceCandidate(candidate);
						}
						callState.storedIceCandidates = [];
					}
					break;
				}

				case WebrtcSignalingType.WEBRTC_SDP_ANSWER: {
					const decompressedData = await decompress(signalingData.json_data);
					const answer = JSON.parse(decompressedData || '{}');
					await callState.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
					// Add stored ICE candidates
					if (callState.storedIceCandidates) {
						for (const candidate of callState.storedIceCandidates) {
							await callState.peerConnection.addIceCandidate(candidate);
						}
						callState.storedIceCandidates = [];
					}
					break;
				}

				case WebrtcSignalingType.WEBRTC_ICE_CANDIDATE: {
					const candidate = JSON.parse(signalingData?.json_data || '{}');
					if (candidate) {
						if (callState.peerConnection.remoteDescription) {
							await callState.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
						} else {
							console.warn('Remote description not set yet, storing candidate');
							if (!callState.storedIceCandidates) {
								callState.storedIceCandidates = [];
							}
							callState.storedIceCandidates.push(new RTCIceCandidate(candidate));
							// Store the candidate to be added later
							// You can implement a mechanism to store and add candidates later
						}
					}
					break;
				}
			}
		} catch (error) {
			console.error('Error handling signaling message:', error);
		}
	};

	// End call and cleanup
	const handleEndCall = async () => {
		try {
			if (callState.localStream) {
				callState.localStream?.getVideoTracks().forEach((track) => {
					track.enabled = false;
				});
				callState.localStream?.getAudioTracks().forEach((track) => {
					track.enabled = false;
				});
				callState.localStream.getTracks().forEach((track) => track.stop());
			}
			if (callState.remoteStream) {
				callState.remoteStream?.getVideoTracks().forEach((track) => {
					track.enabled = false;
				});
				callState.remoteStream?.getAudioTracks().forEach((track) => {
					track.enabled = false;
				});
				callState.remoteStream.getTracks().forEach((track) => track.stop());
			}

			if (callState.peerConnection) {
				callState.peerConnection.close();
			}
			stopDialTone();

			await mezon.socketRef.current?.forwardWebrtcSignaling(dmUserId, 4, '', channelId, userId);
			dispatch(DMCallActions.removeAll());
			DeviceEventEmitter.emit(ActionEmitEvent.ON_SET_STATUS_IN_CALL, { status: false });
			setCallState({
				localStream: null,
				remoteStream: null,
				peerConnection: null
			});
			navigation.goBack();
		} catch (error) {
			console.error('Error ending call:', error);
		}
	};
	// Toggle audio/video
	const toggleAudio = async () => {
		if (callState.localStream) {
			// check if permission is granted, if not call request permission
			if (microphonePermissionGranted) {
				const audioTracks = callState.localStream.getAudioTracks();
				if (audioTracks.length === 0) {
					try {
						const audioStream = await mediaDevices.getUserMedia({ audio: true });
						const audioTrack = audioStream.getAudioTracks()[0];
						audioTrack.enabled = true;
						callState.localStream.addTrack(audioTrack);
						const senders = callState.peerConnection?.getSenders() || [];
						const audioSender = senders.find((sender) => sender.track?.kind === 'audio');
						if (audioSender) {
							await audioSender.replaceTrack(audioTrack);
						} else {
							callState.peerConnection?.addTrack(audioTrack, callState.localStream);
						}
					} catch (error) {
						console.error('Error adding video track:', error);
					}
				} else {
					const senders = callState.peerConnection?.getSenders() || [];
					const audioSender = senders.find((sender) => sender.track?.kind === 'audio');
					audioTracks.forEach((track) => {
						track.enabled = !track.enabled;
					});
					if (audioSender && audioTracks[0]) {
						await audioSender.replaceTrack(audioTracks[0]);
					} else if (audioTracks[0]) {
						callState.peerConnection?.addTrack(audioTracks[0], callState.localStream);
					} else {
						/* empty */
					}
				}
				setLocalMediaControl((prev) => ({
					...prev,
					mic: !prev.mic
				}));
			} else {
				Toast.show({
					type: 'error',
					text1: 'Micro is not available'
				});
				requestMicrophonePermission();
			}
		}
	};

	const toggleVideo = async () => {
		if (callState.localStream) {
			if (!cameraPermissionGranted && !localMediaControl.camera) {
				requestCameraPermission();
				Toast.show({
					type: 'error',
					text1: 'Camera is not available'
				});
				return;
			}
			const videoTracks = callState.localStream.getVideoTracks();
			if (videoTracks.length === 0) {
				try {
					const videoStream = await mediaDevices.getUserMedia({ video: true });
					const videoTrack = videoStream.getVideoTracks()[0];
					videoTrack.enabled = true;
					callState.localStream.addTrack(videoTrack);
					const senders = callState.peerConnection?.getSenders() || [];
					const videoSender = senders.find((sender) => sender.track?.kind === 'video');
					if (videoSender) {
						await videoSender.replaceTrack(videoTrack);
					} else {
						callState.peerConnection?.addTrack(videoTrack, callState.localStream);
					}
				} catch (error) {
					console.error('Error adding video track:', error);
				}
			} else {
				const senders = callState.peerConnection?.getSenders() || [];
				const videoSender = senders.find((sender) => sender.track?.kind === 'video');
				videoTracks.forEach((track) => {
					track.enabled = !track.enabled;
				});
				if (videoSender && videoTracks[0]) {
					await videoSender.replaceTrack(videoTracks[0]);
				} else if (videoTracks[0]) {
					callState.peerConnection?.addTrack(videoTracks[0], callState.localStream);
				} else {
					/* empty */
				}
			}
			setLocalMediaControl((prev) => ({
				...prev,
				camera: !prev.camera
			}));
		}
	};

	const playDialTone = () => {
		Sound.setCategory('Playback');
		const sound = new Sound('dialtone.mp3', Sound.MAIN_BUNDLE, (error) => {
			if (error) {
				console.error('failed to load the sound', error);
				return;
			}
			sound.play((success) => {
				if (!success) {
					console.error('Sound playback failed');
				}
			});
			sound.setNumberOfLoops(-1);
			dialToneRef.current = sound;
		});
	};

	const stopDialTone = () => {
		if (dialToneRef.current) {
			dialToneRef.current.pause();
			dialToneRef.current.stop();
			dialToneRef.current.release();
			dialToneRef.current = null;
		}
	};

	const toggleSpeaker = () => {
		try {
			InCallManager.setSpeakerphoneOn(!localMediaControl.speaker);
			setLocalMediaControl((prev) => ({
				...prev,
				speaker: !prev.speaker
			}));
		} catch (error) {
			console.error('Failed to toggle speaker', error);
		}
	};

	return {
		callState,
		localMediaControl,
		startCall,
		handleEndCall,
		toggleAudio,
		toggleVideo,
		toggleSpeaker,
		handleSignalingMessage
	};
}
