import { AvatarImage, Icons } from '@mezon/components';
import { useCheckOwnerForUser } from '@mezon/core';
import { channelUsersActions, selectAllAccount, selectMembersByChannelId, useAppDispatch } from '@mezon/store';
import { IChannel } from '@mezon/utils';
import { useCallback, useLayoutEffect, useState } from 'react';
import { useSelector } from 'react-redux';
type ListMemberPermissionProps = {
	channel: IChannel;
	selectedUserIds: string[];
};

const ListMemberPermission = (props: ListMemberPermissionProps) => {
	const { channel } = props;
	const dispatch = useAppDispatch();
	const userProfile = useSelector(selectAllAccount);
	const rawMembers = useSelector(selectMembersByChannelId(channel.id));
	const [memberList, setMemberList] = useState<any[]>();

	const checkOwner = useCallback((userId: string) => userId === userProfile?.user?.google_id, [userProfile?.user?.google_id]);

	const deleteMember = async (userId: string) => {
		if (userId !== userProfile?.user?.id) {
			const body = {
				channelId: channel.id,
				userId: userId,
			};
			await dispatch(channelUsersActions.removeChannelUsers(body));
		}
	};

	const listMembersInChannel = () => {
		if (channel.channel_private === 0 || channel.channel_private === undefined) {
			const filteredMembers = rawMembers.filter((member) => member.user && member.user.id && props.selectedUserIds.includes(member.user.id));
			return filteredMembers.map((member) => member.user);
		}
		const filteredMembers = rawMembers.filter((member) => member.userChannelId !== '0');
		return filteredMembers.map((member) => member.user);
	};

	useLayoutEffect(() => {
		if (rawMembers) {
			listMembersInChannel();
			setMemberList(listMembersInChannel());
		}
	}, [rawMembers.length, props.selectedUserIds]);

	return memberList?.map((user) => ( 
		<ItemMemberPermission 
			id={user.id}
			userName={user.username}
			displayName={user.display_name}
			avatar={user.avatar_url}
			onDelete={() => deleteMember(user.id)}
		/>
	));
};

export default ListMemberPermission;

type ItemMemberPermissionProps =  {
	id?: string;
	userName?: string;
	avatar?: string;
	displayName?: string;
	onDelete: () => void;
}

const ItemMemberPermission = (props: ItemMemberPermissionProps) => {
	const {id='', userName='', displayName='', avatar='', onDelete} = props;
	const [checkClanOwner, checkChannelOwner] = useCheckOwnerForUser();
	const isClanOwner = checkClanOwner(id);
	const isChannelOwner = checkChannelOwner(id);
	return(
		<div className={`flex justify-between py-2 rounded`} key={id}>
			<div className="flex gap-x-2 items-center">
				<AvatarImage 
					alt={userName}
					userName={userName}
					className="min-w-6 min-h-6 max-w-6 max-h-6"
					src={avatar}
					classNameText='text-[9px] pt-[3px]'
				/>
				<p className="text-sm">{displayName || userName}</p>
			</div>
			<div className="flex items-center gap-x-2">
				<p className="text-xs text-[#AEAEAE]">
					{isClanOwner && 'Clan Owner'}
					{(isChannelOwner && !isClanOwner) && 'Channel Owner'}
				</p>
				<div onClick={!isChannelOwner ? () => onDelete() : ()=>{}} role="button">
					<Icons.EscIcon
						defaultSize={`${isChannelOwner ? '' : 'cursor-pointer'} size-[15px]`}
						defaultFill={isChannelOwner ? '#4C4D55' : '#AEAEAE'}
					/>
				</div>
			</div>
		</div>
	)
}
