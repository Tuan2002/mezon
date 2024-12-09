import { MentionReactInput, UserMentionList } from '@mezon/components';
import { useTopics } from '@mezon/core';
import { RootState, selectCurrentChannel, selectCurrentChannelId, selectCurrentClanId, topicsActions, useAppDispatch } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { IMessageSendPayload } from '@mezon/utils';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { ApiSdTopic, ApiSdTopicRequest } from 'mezon-js/dist/api.gen';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useThrottledCallback } from 'use-debounce';

const TopicDiscussionBox = () => {
	const dispatch = useAppDispatch();
	const currentChannelId = useSelector(selectCurrentChannelId);
	const currentChannel = useSelector(selectCurrentChannel);
	const currentClanId = useSelector(selectCurrentClanId);
	const { valueTopic } = useTopics();
	const sessionUser = useSelector((state: RootState) => state.auth.session);
	const { clientRef, sessionRef, socketRef } = useMezon();
	const createTopic = useCallback(async () => {
		const body: ApiSdTopicRequest = {
			clan_id: currentClanId?.toString(),
			channel_id: currentChannelId as string,
			message_id: valueTopic?.id
		};

		const topic = await dispatch(topicsActions.createTopic(body));
		return topic.payload;
	}, [currentChannel, currentChannelId, currentClanId, dispatch]);

	const sendMessageTopic = React.useCallback(
		async (
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
			topicId?: string
		) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || !currentClanId) {
				throw new Error('Client is not initialized');
			}

			await socket.writeChatMessage(
				currentClanId,
				currentChannel?.channel_id as string,
				ChannelStreamMode.STREAM_MODE_CHANNEL,
				currentChannel?.channel_private === 0,
				content,
				mentions,
				attachments,
				references,
				false,
				false,
				'',
				0,
				topicId
			);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[sessionRef, clientRef, socketRef, currentClanId, dispatch]
	);

	const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

	const handleSend = useCallback(
		async (
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>
		) => {
			if (sessionUser) {
				// 	if (value?.nameValueThread) {
				const topic = (await createTopic()) as ApiSdTopic;

				if (topic) {
					await sleep(10);
					await sendMessageTopic(content, mentions, attachments, references, topic.id || '');
				}
			} else {
				console.error('Session is not available');
			}
		},
		[]
	);

	const handleTyping = useCallback(() => {
		// sendMessageTyping();
	}, []);

	const handleTypingDebounced = useThrottledCallback(handleTyping, 1000);
	const mode =
		currentChannel?.type === ChannelType.CHANNEL_TYPE_THREAD ? ChannelStreamMode.STREAM_MODE_THREAD : ChannelStreamMode.STREAM_MODE_CHANNEL;
	return (
		<div className="flex flex-col flex-1 justify-end">
			<div className="flex-shrink-0 flex flex-col pb-4 px-4 dark:bg-bgPrimary bg-bgLightPrimary h-auto relative">
				<MentionReactInput
					onSend={handleSend}
					onTyping={handleTypingDebounced}
					listMentions={UserMentionList({
						channelID: currentChannel?.channel_id as string,
						channelMode: ChannelStreamMode.STREAM_MODE_CHANNEL
					})}
					isThread
					isTopic
				/>
			</div>
		</div>
	);
};

export default TopicDiscussionBox;
