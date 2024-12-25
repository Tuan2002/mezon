import {
	appActions,
	selectAllAccount,
	selectCurrentChannel,
	selectCurrentClan,
	selectStatusStream,
	useAppDispatch,
	videoStreamActions
} from '@mezon/store-mobile';
import messaging from '@react-native-firebase/messaging';
import { ChannelType } from 'mezon-js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, PanResponder } from 'react-native';
import { useSelector } from 'react-redux';
import { useWebRTCStream } from '../../../../../components/StreamContext/StreamContext';
import StreamingRoom from '../StreamingRoom';

const StreamingPopup = () => {
	const pan = useRef(new Animated.ValueXY()).current;
	const isDragging = useRef(false);
	const isFullScreen = useRef(false);
	const [isAnimationComplete, setIsAnimationComplete] = useState(true);
	const streamPlay = useSelector(selectStatusStream);
	const currentClan = useSelector(selectCurrentClan);
	const currentChannel = useSelector(selectCurrentChannel);
	const { handleChannelClick, disconnect } = useWebRTCStream();
	const userProfile = useSelector(selectAllAccount);
	const dispatch = useAppDispatch();

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onPanResponderGrant: () => {
				isDragging.current = false;
				if (!isFullScreen.current) {
					pan.setOffset({
						x: (pan?.x as any)?._value,
						y: (pan?.y as any)?._value
					});
					pan.setValue({ x: 0, y: 0 });
				}
			},
			onPanResponderMove: (e, gestureState) => {
				if (!isFullScreen.current) {
					if (Math.abs(gestureState?.dx) > 10 || Math.abs(gestureState?.dy) > 10) {
						isDragging.current = true;
					}
					Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(e, gestureState);
				}
			},
			onPanResponderRelease: (e, gestureState) => {
				const totalDistance = Math.sqrt(gestureState?.dx ** 2 + gestureState?.dy ** 2);
				if (totalDistance > 10) {
					isDragging.current = true;
				}

				if (!isDragging.current) {
					isFullScreen.current = !isFullScreen.current;
					handleResizeStreamRoom();
				}

				if (!isFullScreen.current) {
					pan.flattenOffset();
				}
			}
		})
	).current;

	useEffect(() => {
		handleJoinStreamingRoom();
	}, []);

	const handleJoinStreamingRoom = useCallback(async () => {
		if (currentClan && currentChannel?.type === ChannelType.CHANNEL_TYPE_STREAMING && streamPlay) {
			const token = await messaging().getToken();
			disconnect();
			handleChannelClick(
				currentClan?.id as string,
				currentChannel.channel_id as string,
				userProfile?.user?.id as string,
				currentChannel.channel_id as string,
				userProfile?.user?.username as string,
				token as string
			);
			dispatch(
				videoStreamActions.startStream({
					clanId: currentClan.id || '',
					clanName: currentClan.clan_name || '',
					streamId: currentChannel.channel_id || '',
					streamName: currentChannel.channel_label || '',
					parentId: currentChannel.parrent_id || ''
				})
			);
			dispatch(appActions.setIsShowChatStream(false));
		}
	}, []);

	const handleResizeStreamRoom = () => {
		if (isFullScreen.current) {
			pan.flattenOffset();
			Animated.timing(pan, {
				toValue: { x: 0, y: 0 },
				duration: 300,
				useNativeDriver: false
			}).start(() => {
				setIsAnimationComplete(true);
			});
		} else {
			pan.flattenOffset();
			Animated.timing(pan, {
				toValue: { x: 0, y: 0 },
				duration: 300,
				useNativeDriver: false
			}).start(() => {
				setIsAnimationComplete(false);
			});
		}
	};

	const handlePressMinimizeRoom = useCallback(() => {
		isFullScreen.current = false;
		handleResizeStreamRoom();
	}, []);

	if (!streamPlay) return null;
	return (
		<Animated.View
			{...panResponder.panHandlers}
			style={[
				pan.getLayout(),
				{
					zIndex: 999999,
					position: 'absolute'
				}
			]}
		>
			<StreamingRoom isAnimationComplete={isAnimationComplete} onPressMinimizeRoom={handlePressMinimizeRoom} />
		</Animated.View>
	);
};

export default StreamingPopup;
