import { AppDispatch, RootState, audioCallActions, groupCallActions, selectIsGroupCallActive, selectIsInCall, selectVoiceInfo } from '@mezon/store';
import { Socket, WebrtcSignalingFwd, safeJSONParse } from 'mezon-js';

export interface GroupCallSocketHandlerOptions {
	dispatch: AppDispatch;
	socketRef: React.RefObject<Socket>;
	userId: string | undefined;
}

export interface ParsedCallData {
	is_video?: boolean;
	group_name?: string;
	channel_label?: string;
	caller_name?: string;
	caller_display_name?: string;
	participants?: string[];
	caller_id?: string;
	participant_id?: string;
	action?: string;
	micEnabled?: boolean;
	cameraEnabled?: boolean;
	[key: string]: any;
}

export const handleGroupCallSocketEvent = async (
	event: WebrtcSignalingFwd,
	state: RootState,
	options: GroupCallSocketHandlerOptions
): Promise<boolean> => {
	if (!event || typeof event.data_type !== 'number') {
		console.warn('Invalid WebRTC signaling event received');
		return false;
	}

	if (event.data_type < 9) {
		return false;
	}

	try {
		const { dispatch, socketRef, userId } = options;
		const isInCall = selectIsInCall(state);
		const isGroupCallActive = selectIsGroupCallActive(state);
		const isInAnyCall = isInCall || isGroupCallActive;
		const currentVoiceInfo = selectVoiceInfo(state);

		const parseCallData = (jsonData: string, eventType: string): ParsedCallData => {
			try {
				return safeJSONParse(jsonData || '{}');
			} catch (error) {
				console.error(`Failed to parse call data for event type ${eventType}:`, error);
				return {};
			}
		};

		const sendBusySignal = (callData: ParsedCallData, isVideoCall: boolean) => {
			try {
				if (!socketRef.current || !event.caller_id || !event.channel_id) {
					console.warn('Cannot send busy signal: missing socket or event data');
					return;
				}

				socketRef.current.forwardWebrtcSignaling(
					event.caller_id,
					13, // GROUP_CALL_JOINED_OTHER_CALL
					JSON.stringify({
						is_video: isVideoCall,
						group_id: event.channel_id,
						caller_id: userId,
						busy_user_id: userId,
						timestamp: Date.now(),
						reason: 'busy'
					}),
					event.channel_id,
					userId || ''
				);
			} catch (error) {
				console.error('Failed to send busy signal:', error);
			}
		};

		switch (event.data_type) {
			case 9: {
				// GROUP_CALL_OFFER - Incoming call
				if (!event?.channel_id) {
					console.error('Missing channel_id in group call offer');
					return true;
				}

				dispatch(audioCallActions.setGroupCallId(event.channel_id));
				const callData = parseCallData(event?.json_data as string, 'GROUP_CALL_OFFER');
				const isVideoCall = callData?.is_video === true;

				const isInSameGroup = currentVoiceInfo?.channelId === event.channel_id && currentVoiceInfo?.clanId === '0' && isGroupCallActive;

				if (isInSameGroup) {
					dispatch(audioCallActions.setIsRingTone(false));
					dispatch(audioCallActions.setIsBusyTone(false));
					dispatch(audioCallActions.setIsEndTone(false));
					dispatch(audioCallActions.setIsDialTone(false));
					dispatch(groupCallActions.startGroupCall());

					if (socketRef.current && event.caller_id) {
						const answerData = {
							is_video: isVideoCall,
							group_id: event.channel_id,
							caller_id: userId,
							caller_name: currentVoiceInfo?.channelLabel || 'User',
							action: 'auto_join',
							timestamp: Date.now()
						};

						socketRef.current.forwardWebrtcSignaling(
							event.caller_id,
							10, // GROUP_CALL_ANSWER
							JSON.stringify(answerData),
							event.channel_id,
							userId || ''
						);
					}

					return true;
				}

				if (!isInAnyCall) {
					// User is free - show incoming call UI
					dispatch(audioCallActions.setIsRingTone(true));
					dispatch(audioCallActions.setIsBusyTone(false));
					dispatch(audioCallActions.setIsEndTone(false));
					dispatch(audioCallActions.setIsDialTone(false));

					dispatch(
						groupCallActions.showIncomingGroupCall({
							groupId: event.channel_id,
							callData: {
								...event,
								groupName: callData?.group_name || callData?.channel_label || 'Group Call',
								callerName: callData?.caller_name || callData?.caller_display_name || 'Unknown',
								participants: callData?.participants || [],
								timestamp: Date.now()
							},
							isVideo: isVideoCall
						})
					);
				} else {
					// User is busy in different call - send busy signal
					sendBusySignal(callData, isVideoCall);
				}
				break;
			}

			case 10: {
				// GROUP_CALL_ANSWER - Call accepted
				dispatch(audioCallActions.setIsRingTone(false));
				dispatch(audioCallActions.setIsDialTone(false));
				dispatch(audioCallActions.setIsJoinedCall(true));

				const answerData = parseCallData(event?.json_data as string, 'GROUP_CALL_ANSWER');
				if (answerData?.caller_id) {
					dispatch(groupCallActions.addParticipant(answerData.caller_id));
				}
				break;
			}

			case 11: {
				// GROUP_CALL_QUIT - Call ended/declined/left
				const quitData = parseCallData(event?.json_data as string, 'GROUP_CALL_QUIT');
				const isCurrentUser = quitData?.caller_id === userId;

				switch (quitData?.action) {
					case 'decline':
						dispatch(groupCallActions.hideIncomingGroupCall());
						dispatch(audioCallActions.setIsRingTone(false));
						break;

					case 'leave':
						if (isCurrentUser) {
							dispatch(audioCallActions.setIsRingTone(false));
							dispatch(audioCallActions.setIsDialTone(false));
						} else if (quitData?.caller_id) {
							dispatch(groupCallActions.removeParticipant(quitData.caller_id));
						}
						break;

					default:
						// Cancel or other quit actions
						if (isCurrentUser) {
							dispatch(groupCallActions.endGroupCall());
							dispatch(audioCallActions.setIsEndTone(true));
						} else {
							if (quitData?.caller_id) {
								dispatch(groupCallActions.removeParticipant(quitData.caller_id));
							}
							if (!isGroupCallActive) {
								dispatch(groupCallActions.hideIncomingGroupCall());
							}
						}
						break;
				}

				// Always ensure ring/dial tones are stopped
				dispatch(audioCallActions.setIsRingTone(false));
				dispatch(audioCallActions.setIsDialTone(false));
				break;
			}

			case 13:
				// GROUP_CALL_JOINED_OTHER_CALL - Busy signal received
				dispatch(audioCallActions.setIsBusyTone(true));
				dispatch(audioCallActions.setIsRingTone(false));
				break;

			case 14: {
				// GROUP_CALL_STATUS_REMOTE_MEDIA - Remote media status update
				const mediaData = parseCallData(event?.json_data as string, 'GROUP_CALL_STATUS_REMOTE_MEDIA');
				if (mediaData?.micEnabled !== undefined) {
					dispatch(audioCallActions.setIsRemoteAudio(mediaData.micEnabled));
				}
				if (mediaData?.cameraEnabled !== undefined) {
					dispatch(audioCallActions.setIsRemoteVideo(mediaData.cameraEnabled));
				}
				break;
			}

			case 15:
				// GROUP_CALL_CANCEL - Call cancelled by initiator
				dispatch(groupCallActions.endGroupCall());
				dispatch(groupCallActions.hideIncomingGroupCall());
				dispatch(audioCallActions.setIsRingTone(false));
				dispatch(audioCallActions.setIsDialTone(false));
				break;

			case 16:
				// GROUP_CALL_TIMEOUT - Call timed out
				dispatch(groupCallActions.endGroupCall());
				dispatch(groupCallActions.hideIncomingGroupCall());
				dispatch(audioCallActions.setIsRingTone(false));
				dispatch(audioCallActions.setIsDialTone(false));
				dispatch(audioCallActions.setIsEndTone(true));
				break;

			case 17: {
				// GROUP_CALL_PARTICIPANT_JOINED - New participant joined
				const joinData = parseCallData(event?.json_data as string, 'GROUP_CALL_PARTICIPANT_JOINED');
				if (joinData?.participant_id) {
					dispatch(groupCallActions.addParticipant(joinData.participant_id));
				}
				break;
			}

			case 18: {
				// GROUP_CALL_PARTICIPANT_LEFT - Participant left
				const leftData = parseCallData(event?.json_data as string, 'GROUP_CALL_PARTICIPANT_LEFT');
				if (leftData?.participant_id) {
					dispatch(groupCallActions.removeParticipant(leftData.participant_id));
				}
				break;
			}

			default:
				console.warn('Unhandled group call event type:', event.data_type, event);
				break;
		}

		return true;
	} catch (error) {
		console.error('Error handling group call event:', error, event);
		return false;
	}
};

export const validateGroupCallEvent = (event: WebrtcSignalingFwd): boolean => {
	if (!event) {
		console.warn('Group call event is null or undefined');
		return false;
	}

	if (typeof event.data_type !== 'number') {
		console.warn('Group call event data_type is not a number:', event.data_type);
		return false;
	}

	if (event.data_type < 9) {
		return false;
	}

	return true;
};

export const extractCallData = (event: WebrtcSignalingFwd): ParsedCallData => {
	try {
		const jsonData = event?.json_data as string;
		const parsed = safeJSONParse(jsonData || '{}');

		return {
			...parsed,
			is_video: Boolean(parsed?.is_video),
			group_name: parsed?.group_name || parsed?.channel_label || 'Group Call',
			caller_name: parsed?.caller_name || parsed?.caller_display_name || 'Unknown',
			participants: Array.isArray(parsed?.participants) ? parsed.participants : [],
			timestamp: parsed?.timestamp || Date.now()
		};
	} catch (error) {
		console.error('Failed to extract call data:', error);
		return {
			is_video: false,
			group_name: 'Group Call',
			caller_name: 'Unknown',
			participants: [],
			timestamp: Date.now()
		};
	}
};
