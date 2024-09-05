import {
	IMentionOnMessage,
	IMessageSendPayload,
	IMessageWithUser,
	addMention,
	convertDateString,
	convertTimeHour,
	convertTimeString
} from '@mezon/utils';
import { useMemo } from 'react';

export function useMessageParser(message: IMessageWithUser) {
	const mentions = useMemo(() => {
		return message?.mentions as IMentionOnMessage;
	}, [message?.mentions]);

	const content = useMemo(() => {
		return message?.content as IMessageSendPayload;
	}, [message]);

	const contentUpdatedMention = addMention(content, mentions as any);

	const lines = useMemo(() => {
		const values = message.content?.t;
		return values;
	}, [message.content?.t]);

	const messageTime = useMemo(() => {
		return convertTimeString(message?.create_time as string);
	}, [message?.create_time]);

	const messageDate = useMemo(() => {
		return convertDateString(message?.create_time as string);
	}, [message?.create_time]);

	const messageHour = useMemo(() => {
		return convertTimeHour(message?.create_time || ('' as string));
	}, [message?.create_time]);

	const userClanNickname = useMemo(() => {
		return message?.clan_nick;
	}, [message?.clan_nick]);
	const userClanAvatar = useMemo(() => {
		return message?.clan_avatar;
	}, [message?.clan_avatar]);
	const userDisplayName = useMemo(() => {
		return message?.display_name;
	}, [message?.display_name]);
	const username = useMemo(() => {
		return message?.username;
	}, [message?.username]);

	const senderId = useMemo(() => {
		return message?.sender_id;
	}, [message?.sender_id]);

	const avatarSender = useMemo(() => {
		return message?.avatar;
	}, [message?.avatar]);

	/// References message
	const senderIdMessageRef = useMemo(() => {
		if (message.references) {
			return message?.references[0]?.message_sender_id;
		}
	}, [message.references]);

	const messageIdRef = useMemo(() => {
		if (message.references) {
			return message?.references[0]?.message_ref_id;
		}
	}, [message.references]);

	const hasAttachmentInMessageRef = useMemo(() => {
		if (message.references) {
			return message.references[0]?.has_attachment;
		}
	}, [message.references]);

	const messageContentRef = useMemo(() => {
		if (message.references) {
			return JSON.parse(message?.references[0]?.content ?? '{}');
		}
	}, [message.references]);

	const messageUsernameSenderRef = useMemo(() => {
		if (message.references) {
			return message?.references[0]?.message_sender_username ?? '';
		}
	}, [message.references]);

	const messageAvatarSenderRef = useMemo(() => {
		if (message.references) {
			return message?.references[0]?.mesages_sender_avatar ?? '';
		}
	}, [message.references]);

	const messageClanNicknameSenderRef = useMemo(() => {
		if (message.references) {
			return message?.references[0]?.message_sender_clan_nick ?? '';
		}
	}, [message.references]);

	const messageDisplayNameSenderRef = useMemo(() => {
		if (message.references) {
			return message?.references[0]?.message_sender_display_name ?? '';
		}
	}, [message.references]);

	return {
		content,
		messageTime,
		messageHour,
		mentions,
		lines,
		messageDate,
		userClanNickname,
		userClanAvatar,
		userDisplayName,
		username,
		senderId,
		avatarSender,
		senderIdMessageRef,
		messageIdRef,
		hasAttachmentInMessageRef,
		messageContentRef,
		messageUsernameSenderRef,
		messageAvatarSenderRef,
		messageClanNicknameSenderRef,
		messageDisplayNameSenderRef,
		contentUpdatedMention
	};
}
