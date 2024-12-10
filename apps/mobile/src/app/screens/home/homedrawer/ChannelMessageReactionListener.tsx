import { ChatContext, useChatReaction } from '@mezon/core';
import { ActionEmitEvent } from '@mezon/mobile-components';
import { selectCurrentChannel } from '@mezon/store-mobile';
import { useMezon } from '@mezon/transport';
import { isPublicChannel } from '@mezon/utils';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { DeviceEventEmitter, View } from 'react-native';
import { useSelector } from 'react-redux';
import { IReactionMessageProps } from './components';

const maxRetries = 10;
const ChannelMessageReactionListener = React.memo(() => {
	const { reactionMessageDispatch } = useChatReaction({ isMobile: true });
	const currentChannel = useSelector(selectCurrentChannel);
	const { socketRef } = useMezon();
	const { handleReconnect } = useContext(ChatContext);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const counterRef = useRef(0);

	const onReactionMessage = useCallback(
		async (data: IReactionMessageProps) => {
			if (!socketRef?.current?.isOpen()) {
				handleReconnect('');
				intervalRef.current = setInterval(() => {
					if (counterRef.current >= maxRetries) {
						clearInterval(intervalRef.current);
						return;
					}
					DeviceEventEmitter.emit(ActionEmitEvent.ON_RETRY_REACTION_MESSAGE_ITEM, data);
					counterRef.current++;
				}, 700); // Check and retry every 700ms
			} else {
				await reactionMessageDispatch(
					data?.id ?? '',
					data?.messageId ?? '',
					data?.emojiId ?? '',
					data?.emoji?.trim() ?? '',
					data?.countToRemove ?? 0,
					data?.senderId ?? '',
					data?.actionDelete ?? false,
					isPublicChannel(currentChannel)
				);
			}
		},
		[socketRef, handleReconnect, reactionMessageDispatch, currentChannel]
	);

	const onReactionMessageRetry = useCallback(
		async (data: IReactionMessageProps) => {
			if (socketRef?.current?.isOpen()) {
				counterRef.current = 0;
				intervalRef?.current && clearInterval(intervalRef.current);
				await reactionMessageDispatch(
					data?.id ?? '',
					data?.messageId ?? '',
					data?.emojiId ?? '',
					data?.emoji?.trim() ?? '',
					data?.countToRemove ?? 0,
					data?.senderId ?? '',
					data?.actionDelete ?? false,
					isPublicChannel(currentChannel)
				);
			}
		},
		[currentChannel, reactionMessageDispatch, socketRef]
	);

	useEffect(() => {
		const eventOnReaction = DeviceEventEmitter.addListener(ActionEmitEvent.ON_REACTION_MESSAGE_ITEM, onReactionMessage);
		const eventOnRetryReaction = DeviceEventEmitter.addListener(ActionEmitEvent.ON_RETRY_REACTION_MESSAGE_ITEM, onReactionMessageRetry);

		return () => {
			eventOnReaction.remove();
			eventOnRetryReaction.remove();
			intervalRef?.current && clearInterval(intervalRef.current);
		};
	}, [onReactionMessage, onReactionMessageRetry]);

	return <View />;
});

export default ChannelMessageReactionListener;
