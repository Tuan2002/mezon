import { channelMembersActions, inviteActions, selectAllChannels, selectMembersByChannelId } from '@mezon/store';
import React, { useEffect, useMemo } from 'react';
import { useDirect } from './useDirect';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@mezon/store';
import { ApiLinkInviteUser } from 'vendors/mezon-js/packages/mezon-js/api.gen';
import { useClans } from './useClans';
import { ChannelType } from '@mezon/mezon-js';

export function useDMInvite(channelID?:string) {
	const dispatch = useAppDispatch();
	const { listDM: dmGroupChatList } = useDirect({autoFetch:true});
		const rawMembers = useSelector(selectMembersByChannelId(channelID));
		const { usersClan } = useClans();
		const allChannels = useSelector(selectAllChannels);
		const isChannelPrivate = allChannels.find(channel => channel.channel_id === channelID)?.channel_private === 1;
		const listDMInvite = useMemo(() => {
			const userIdInClanArray = usersClan.map(user => user.id);
			const memberIds = rawMembers.map(member => member.user?.id);
			const filteredListUserClan = dmGroupChatList.filter(item => {
			if ((item.user_id && item.user_id.length > 1) || 
			(item.user_id && item.user_id.length === 1 && !userIdInClanArray.includes(item.user_id[0]))) {
				return true;
			}
			return false;
		});
			if (!channelID) {
				return filteredListUserClan;
			}
			const filteredListUserChannel = dmGroupChatList.filter(item => {
				if ((item.user_id && item.user_id.length > 1) || 
				(item.user_id && item.user_id.length === 1 && !memberIds.includes(item.user_id[0]))) {
					return true;
				}
				return false;
			});
			if (!isChannelPrivate) {
				return filteredListUserChannel;
			}
	}, [channelID, dmGroupChatList, usersClan, rawMembers, isChannelPrivate]);


	const createLinkInviteUser = React.useCallback(
		async (clan_id: string, channel_id: string, expiry_time: number) => {
			const action = await dispatch(
				inviteActions.createLinkInviteUser({
					clan_id: clan_id,
					channel_id: channel_id,
					expiry_time: expiry_time,
				}),
			);
			const payload = action.payload as ApiLinkInviteUser;
			return payload;
		},
		[dispatch],
	);

    const listUserInvite = useMemo(() => {
		const memberIds = rawMembers.map(member => member.user?.id);
		const usersClanFiltered = usersClan.filter(user => !memberIds.some(userId => userId === user.id));
		if (isChannelPrivate) {
			return usersClanFiltered;
		}
	}, [usersClan, rawMembers, isChannelPrivate]);    

	useEffect(() => {
		if (channelID) {
			dispatch(channelMembersActions.fetchChannelMembers({clanId: '', channelId:channelID || '', channelType: ChannelType.CHANNEL_TYPE_TEXT }));
		}
	}, [channelID]);

	return useMemo(
		() => ({
			listDMInvite,
			listUserInvite,
			createLinkInviteUser
		}),
		[listDMInvite, createLinkInviteUser, listUserInvite],
	);
}
