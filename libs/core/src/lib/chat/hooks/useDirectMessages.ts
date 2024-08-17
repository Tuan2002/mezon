import { directActions, messagesActions, selectDirectById, selectNewMesssageUpdateImage, useAppDispatch } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { IMessageSendPayload } from '@mezon/utils';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useChatMessages } from './useChatMessages';
import { useChatSending } from './useChatSending';
import { useProcessLink } from './useProcessLink';

export type UseDirectMessagesOptions = {
	channelId: string;
	mode: number;
};

export function useDirectMessages({ channelId, mode }: UseDirectMessagesOptions) {
	const { clientRef, sessionRef, socketRef } = useMezon();
	const newMessageIdUpdateImage = useSelector(selectNewMesssageUpdateImage);

	const client = clientRef.current;
	const dispatch = useAppDispatch();
	const { lastMessage } = useChatMessages({ channelId });
	const channel = useSelector(selectDirectById(channelId));

	const [contentPayload, setContentPayload] = useState<IMessageSendPayload>();
	const [mentionPayload, setMentionPayload] = useState<ApiMessageMention[]>();
	const [attachmentPayload, setAttachmentPayload] = useState<ApiMessageAttachment[]>();

	const sendDirectMessage = React.useCallback(
		async (
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
		) => {
			setContentPayload(content);
			setMentionPayload(mentions);
			setAttachmentPayload(attachments);
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || !channel) {
				console.log(client, session, socket, channel);
				throw new Error('Client is not initialized');
			}
			await socket.writeChatMessage('0', channel.id, mode, content, mentions, attachments, references, false, false);
			const timestamp = Date.now() / 1000;
			dispatch(directActions.setDirectLastSeenTimestamp({ channelId: channel.id, timestamp }));
			if (lastMessage) {
				dispatch(directActions.updateLastSeenTime(lastMessage));
			}
		},
		[sessionRef, clientRef, socketRef, channel, mode, dispatch, lastMessage],
	);

	const loadMoreMessage = React.useCallback(async () => {
		dispatch(messagesActions.loadMoreMessage({ channelId }));
	}, [dispatch, channelId]);

	const sendMessageTyping = React.useCallback(async () => {
		dispatch(messagesActions.sendTypingUser({ clanId: '0', channelId: channelId, mode: mode }));
	}, [channelId, dispatch, mode]);

	const { updateImageLinkMessage } = useChatSending({ channelId, mode });

	const { processLink } = useProcessLink({ updateImageLinkMessage });

	useEffect(() => {
		if (newMessageIdUpdateImage.clan_id === '0' || !newMessageIdUpdateImage.clan_id) {
			processLink(
				newMessageIdUpdateImage.clan_id ?? '',
				newMessageIdUpdateImage.channel_id ?? '',
				mode,
				contentPayload,
				mentionPayload,
				attachmentPayload,
				newMessageIdUpdateImage.id,
			);
		}
	}, [newMessageIdUpdateImage.id]);
	return useMemo(
		() => ({
			client,
			sendDirectMessage,
			loadMoreMessage,
			sendMessageTyping,
		}),
		[client, sendMessageTyping, sendDirectMessage, loadMoreMessage],
	);
}
