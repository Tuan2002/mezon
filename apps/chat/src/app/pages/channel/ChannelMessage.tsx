import { MessageWithUser, UnreadMessageBreak } from '@mezon/components';
import { useChatMessage } from '@mezon/core';
import { IMessageWithUser } from '@mezon/utils';
import { useEffect, useMemo } from 'react';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'vendors/mezon-js/packages/mezon-js/dist/api.gen';

type MessageProps = {
	message: IMessageWithUser;
	preMessage?: IMessageWithUser;
	lastSeen?: boolean;
};

export function ChannelMessage(props: MessageProps) {
	const { message, lastSeen, preMessage } = props;
	const { markMessageAsSeen } = useChatMessage(message.id);

	useEffect(() => {
		markMessageAsSeen(message);
	}, [markMessageAsSeen, message]);

	// TODO: recheck this
	const mess = useMemo(() => {
		return message;
	}, [message]);

	const messPre = useMemo(() => {
		return preMessage;
	}, [preMessage]);

	const mentions = useMemo(() => {
		return message.mentions as any;
	}, [message.mentions]);

	const attachments = useMemo(() => {
		return message.attachments as any;
	}, [message.attachments]);

	const references = useMemo(() => {
		return message.references as any;
	}, [message.references]);

	return (
		<div>
			<MessageWithUser message={mess as IMessageWithUser} 
				preMessage={messPre as IMessageWithUser}
				mentions={mentions as ApiMessageMention[]}
				attachments={attachments as ApiMessageAttachment[]}
				references={references as ApiMessageRef[]}
			/>
			{lastSeen && <UnreadMessageBreak />}
		</div>
	);
}

ChannelMessage.Skeleton = () => {
	return (
		<div>
			<MessageWithUser.Skeleton />
		</div>
	);
};
