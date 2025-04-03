import { useDMInvite } from '@mezon/core';
import {
	DirectEntity,
	FriendsEntity,
	selectAllDirectMessages,
	selectAllFriends,
	selectAllUsesInAllClansEntities,
	selectTheme,
	useAppSelector,
	UsersEntity
} from '@mezon/store';
import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { processUserData } from './dataHelper';
import ListMemberInviteItem from './ListMemberInviteItem';
export type ModalParam = {
	url: string;
	channelID?: string;
	isInviteExternalCalling?: boolean;
};
const ListMemberInvite = (props: ModalParam) => {
	const appearanceTheme = useSelector(selectTheme);
	const { isInviteExternalCalling = false } = props;
	const { listDMInvite, listUserInvite } = useDMInvite(props.channelID);
	const [searchTerm, setSearchTerm] = useState('');
	const [sendIds, setSendIds] = useState<Record<string, boolean>>({});
	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const filteredListDMBySearch = useMemo(() => {
		return listDMInvite?.filter((dmGroup) => {
			if (dmGroup.usernames?.toString()?.toLowerCase().includes(searchTerm.toLowerCase())) {
				return dmGroup.usernames?.toString()?.toLowerCase().includes(searchTerm.toLowerCase());
			}

			return dmGroup.channel_label?.toLowerCase().includes(searchTerm.toLowerCase());
		});
	}, [listDMInvite, searchTerm]);

	const filteredListUserBySearch = useMemo(() => {
		return listUserInvite?.filter((dmGroup) => {
			return dmGroup.user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
		});
	}, [listUserInvite, searchTerm]);

	const handleSend = (dmGroup: DirectEntity) => {
		setSendIds((ids) => {
			return {
				...ids,
				[dmGroup.id]: true
			};
		});
	};

	const dmGroupChatListRef = useRef(useAppSelector(selectAllDirectMessages));
	const allUsesInAllClansEntitiesRef = useRef(useSelector(selectAllUsesInAllClansEntities));
	const dmGroupChatList = dmGroupChatListRef.current;
	const allUsesInAllClansEntities = allUsesInAllClansEntitiesRef.current;
	const friends = useSelector(selectAllFriends);

	const data = useMemo(
		() =>
			processUserData(allUsesInAllClansEntities as Record<string, UsersEntity>, friends as FriendsEntity[], dmGroupChatList as DirectEntity[]),
		[allUsesInAllClansEntities, friends, dmGroupChatList]
	);
	return (
		<>
			<input
				type="text"
				value={searchTerm}
				onChange={handleInputChange}
				placeholder="Search for friends"
				className="w-full h-10 dark:bg-black bg-[#dfe0e2] rounded-[5px] px-[16px] py-[13px] text-[14px] outline-none"
			/>
			<p className="ml-[0px] mt-1 mb-4 dark:text-[#AEAEAE] text-black text-[15px] cursor-default">
				This channel is private, only select members and roles can view this channel.
			</p>
			<hr className="border-solid dark:border-borderDefault border-gray-200 rounded-t "></hr>
			<div
				className={`py-[10px] pr-2 cursor-default overflow-y-auto max-h-[200px] overflow-x-hidden ${appearanceTheme === 'light' ? 'customScrollLightMode' : ''}`}
			>
				{isInviteExternalCalling ? (
					<div className="flex flex-col gap-3">
						{data?.map((user) => (
							<ListMemberInviteItem
								dmGroup={undefined}
								user={user}
								key={user.id}
								url={props.url}
								onSend={handleSend}
								isSent={!!sendIds[user.id]}
								isExternalCalling={true}
								usersInviteExternal={user}
							/>
						))}
					</div>
				) : listDMInvite ? (
					<div className="flex flex-col gap-3">
						{filteredListDMBySearch?.map((dmGroup) => (
							<ListMemberInviteItem
								dmGroup={dmGroup}
								key={dmGroup.id}
								url={props.url}
								onSend={handleSend}
								isSent={!!sendIds[dmGroup.id]}
							/>
						))}
					</div>
				) : (
					<div className="flex flex-col gap-3">
						{filteredListUserBySearch?.map((user) => (
							<ListMemberInviteItem user={user} key={user.id} url={props.url} onSend={handleSend} isSent={!!sendIds[user.id]} />
						))}
					</div>
				)}
			</div>
			<hr className="border-solid dark:border-borderDefault border-gray-200 rounded-t " />
		</>
	);
};

export default ListMemberInvite;
