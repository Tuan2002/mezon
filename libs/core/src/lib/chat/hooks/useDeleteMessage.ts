import { messagesActions, selectClanView, selectCurrentChannel, selectCurrentClanId, useAppDispatch } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { isPublicChannel, transformPayloadWriteSocket } from '@mezon/utils';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

export type UseDeleteMessageOptions = {
	channelId: string;
	mode: number;
	hasAttachment?: boolean;
};

export function useDeleteMessage({ channelId, mode, hasAttachment }: UseDeleteMessageOptions) {
	const dispatch = useAppDispatch();
	const currentClanId = useSelector(selectCurrentClanId);
	const isClanView = useSelector(selectClanView);
	const { socketRef } = useMezon();
	const channel = useSelector(selectCurrentChannel);
	const deleteSendMessage = React.useCallback(
		async (messageId: string) => {
			const socket = socketRef.current;
			if (!socket) return;

			dispatch(
				messagesActions.remove({
					channelId,
					messageId
				})
			);

			const payload = transformPayloadWriteSocket({
				clanId: currentClanId as string,
				isPublicChannel: isPublicChannel(channel),
				isClanView: isClanView as boolean
			});

			await socket.removeChatMessage(payload.clan_id, channelId, mode, payload.is_public, messageId, hasAttachment);
		},
		[socketRef, channel, channelId, dispatch, currentClanId, mode, isClanView, hasAttachment]
	);

	return useMemo(
		() => ({
			deleteSendMessage
		}),
		[deleteSendMessage]
	);
}
