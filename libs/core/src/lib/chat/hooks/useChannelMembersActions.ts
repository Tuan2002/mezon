import { channelMembersActions, clansActions, directActions, useAppDispatch } from '@mezon/store';
import { RemoveChannelUsers, RemoveClanUsers } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { useCallback, useMemo } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';

export type UseChannelMembersActionsOptions = {
	channelId?: string | null;
};

export function useChannelMembersActions() {
	const dispatch = useAppDispatch();
	const { userId } = useAuth();
	const removeMemberChannel = useCallback(
		async ({ channelId, userIds }: RemoveChannelUsers) => {
			await dispatch(channelMembersActions.removeMemberChannel({ channelId, userIds }));
			dispatch(directActions.fetchDirectMessage({ noCache: true }));
		},
		[dispatch]
	);

	const removeMemberClan = useCallback(
		async ({ clanId, channelId, userIds }: RemoveClanUsers) => {
			await dispatch(clansActions.removeClanUsers({ clanId, userIds }));
			userIds.forEach((userid) => {
				if (userid !== userId) {
					dispatch(
						channelMembersActions.fetchChannelMembers({
							clanId: clanId,
							channelId: channelId,
							noCache: true,
							channelType: ChannelType.CHANNEL_TYPE_CHANNEL
						})
					);
				}
			});
		},
		[dispatch]
	);

	return useMemo(
		() => ({
			removeMemberChannel,
			removeMemberClan
		}),
		[removeMemberChannel, removeMemberClan]
	);
}
