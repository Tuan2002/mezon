import { directActions, directMetaActions, selectDirectById, selectIsUnreadDMById, useAppDispatch, useAppSelector } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { ChannelMembersEntity, MemberProfileType } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { memo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { MemberProfile } from '../../MemberProfile';
export type DirectMessProp = {
	id: string;
	currentDmGroupId: string;
	joinToChatAndNavigate: (DMid: string, type: number) => void;
	navigateToFriends: () => void;
	isActive: boolean;
};

export type directMessageValueProps = {
	type?: number;
	userId: string[];
	dmID: string;
};

function DMListItem({ id, currentDmGroupId, joinToChatAndNavigate, navigateToFriends, isActive }: DirectMessProp) {
	const dispatch = useAppDispatch();
	const directMessage = useAppSelector((state) => selectDirectById(state, id));
	const isUnReadChannel = useSelector(selectIsUnreadDMById(directMessage.id));

	const handleCloseClick = async (e: React.MouseEvent, directId: string) => {
		e.stopPropagation();
		await dispatch(directActions.closeDirectMessage({ channel_id: directId }));
		const timestamp = Date.now() / 1000;
		dispatch(directMetaActions.setDirectMetaLastSeenTimestamp({ channelId: directId, timestamp: timestamp }));

		if (directId === currentDmGroupId) {
			navigateToFriends();
		}
	};

	const directMessageValue: directMessageValueProps = {
		type: directMessage.type,
		userId: directMessage.user_id ?? [],
		dmID: directMessage.id
	};

	const isTypeDMGroup = Number(directMessage.type) === ChannelType.CHANNEL_TYPE_GROUP;

	const ref = useRef<HTMLDivElement>(null);

	return (
		<div
			ref={ref}
			className={`group/itemListDm relative  text-[#AEAEAE] hover:text-white h-fit pl-2 rounded-[6px] dark:hover:bg-[rgba(30,30,30,0.4)] hover:bg-[#E1E1E1] py-2 w-full dark:focus:bg-bgTertiary focus:bg-[#c7c7c7] ${isActive ? 'dark:bg-[#1E1E1E] bg-[#c7c7c7] dark:text-white text-black' : ''}`}
			style={{
				cursor: 'pointer'
			}}
			onClick={() => {
				if (ref.current) {
					ref.current.className = ref.current.className + ' dark:bg-[#1E1E1E] bg-[#c7c7c7] dark:text-white text-black';
				}
				joinToChatAndNavigate(id, directMessage?.type as number);
			}}
		>
			<MemberProfile
				avatar={isTypeDMGroup ? 'assets/images/avatar-group.png' : (directMessage?.channel_avatar?.at(0) ?? '')}
				name={(directMessage?.channel_label || directMessage?.usernames) ?? `${directMessage.creator_name}'s Group` ?? ''}
				userNameAva={directMessage?.usernames}
				status={directMessage.is_online?.some(Boolean)}
				isHideStatus={true}
				isHideIconStatus={false}
				key={directMessage.channel_id}
				isUnReadDirect={isUnReadChannel}
				directMessageValue={directMessageValue}
				isHideAnimation={true}
				positionType={MemberProfileType.DM_LIST}
				countMember={(directMessage?.user_id?.length || 0) + 1}
				user={directMessage as ChannelMembersEntity}
			/>
			<button
				className={`group-hover/itemListDm:opacity-100 opacity-0 absolute right-2 text-gray-500 hover:text-red-500 ${isTypeDMGroup ? 'top-[22px]' : 'top-[18px]'}`}
				onClick={(e) => handleCloseClick(e, directMessage.channel_id as string)}
			>
				<Icons.Close defaultSize="size-3" />
			</button>
		</div>
	);
}

export default memo(DMListItem, (prev, cur) => {
	return prev.id === cur.id && prev.isActive === cur.isActive;
});
