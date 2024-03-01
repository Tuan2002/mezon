import {
	messagesActions,
	selectHasMoreMessageByChannelId,
	selectLastMessageIdByChannelId,
	selectMessageByChannelId,
	selectUnreadMessageIdByChannelId,
	useAppDispatch,
} from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { IMessageSendPayload } from '@mezon/utils';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ApiMessageMention, ApiMessageAttachment, ApiMessageRef } from 'vendors/mezon-js/packages/mezon-js/dist/api.gen';

export type UseDirectMessagesOptions = {
	channelId: string;
};

export function useDirectMessages({ channelId }: UseDirectMessagesOptions) {
	const { clientRef, sessionRef, socketRef, channelRef } = useMezon();

	const client = clientRef.current;
	const dispatch = useAppDispatch();

	const messages = useSelector(selectMessageByChannelId(channelId));
	const hasMoreMessage = useSelector(selectHasMoreMessageByChannelId(channelId));
	const lastMessageId = useSelector(selectLastMessageIdByChannelId(channelId));
	const unreadMessageId = useSelector(selectUnreadMessageIdByChannelId(channelId));

	const sendDirectMessage = React.useCallback(
		async (content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>, 
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;
			const channel = channelRef.current;

			if (!client || !session || !socket || !channel) {
				console.log(client, session, socket, channel);
				throw new Error('Client is not initialized');
			}

			await socket.writeChatMessage('', channel.id, content, mentions, attachments, references);
		},
		[sessionRef, clientRef, socketRef, channelRef],
	);

	const loadMoreMessage = React.useCallback(async () => {
		dispatch(messagesActions.loadMoreMessage({ channelId }));
	}, [dispatch, channelId]);

	return useMemo(
		() => ({
			client,
			messages,
			unreadMessageId,
			lastMessageId,
			hasMoreMessage,
			sendDirectMessage,
			loadMoreMessage,
		}),
		[client, messages, unreadMessageId, lastMessageId, hasMoreMessage, sendDirectMessage, loadMoreMessage],
	);
}
