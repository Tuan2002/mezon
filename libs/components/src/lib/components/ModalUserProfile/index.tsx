import { useDirect, useSendInviteMessage, useSettingFooter } from '@mezon/core';
import { clansActions, selectAddFriends, selectAllAccount, selectMemberByUserId, useAppDispatch } from '@mezon/store';
import { IMessageWithUser } from '@mezon/utils';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getColorAverageFromURL } from '../SettingProfile/AverageColor';
import AboutUserProfile from './AboutUserProfile';
import AvatarProfile from './AvatarProfile';
import NoteUserProfile from './NoteUserProfile';
import RoleUserProfile from './RoleUserProfile';
import StatusProfile from './StatusProfile';
import GroupIconBanner from './StatusProfile/groupIconBanner';
type ModalUserProfileProps = {
	userID?: string;
	isFooterProfile?: boolean;
	classWrapper?: string;
	classBanner?: string;
	hiddenRole?: boolean;
	showNote?: boolean;
	message?: IMessageWithUser;
	showPopupLeft?: boolean;
};

export type OpenModalProps = {
	openFriend: boolean;
	openAddFriend: boolean;
	openOption: boolean;
};

const ModalUserProfile = ({
	userID,
	isFooterProfile,
	classWrapper,
	classBanner,
	hiddenRole,
	showNote,
	message,
	showPopupLeft,
}: ModalUserProfileProps) => {
	const dispatch = useAppDispatch();
	const userProfile = useSelector(selectAllAccount);
	const { createDirectMessageWithUser } = useDirect();
	const { sendInviteMessage } = useSendInviteMessage();

	const userById = useSelector(selectMemberByUserId(userID ?? ''));
	// console.log("userById: ", userById);
	const [content, setContent] = useState<string>('');

	const initOpenModal = {
		openFriend: false,
		openAddFriend: false,
		openOption: false,
	};
	const [openModal, setOpenModal] = useState<OpenModalProps>(initOpenModal);

	const sendMessage = async (userId: string) => {
		const response = await createDirectMessageWithUser(userId);
		if (response.channel_id) {
			await dispatch(clansActions.joinClan({ clanId: response.clan_id as string }));
			sendInviteMessage(content, response.channel_id);
			setContent('');
		}
	};
	const handleContent = (e: React.ChangeEvent<HTMLInputElement>) => {
		setContent(e.target.value);
	};
	const checkOwner = (userId: string) => {
		return userId === userProfile?.user?.google_id;
	};

	const checkUrl = (url: string | undefined) => {
		if (url !== undefined && url !== '') return true;
		return false;
	};
	const [color, setColor] = useState<string>('#323232');

	const getColor = async () => {
		if (checkUrl(userProfile?.user?.avatar_url) && checkUrl(userById?.user?.avatar_url)) {
			const url = isFooterProfile ? userProfile?.user?.avatar_url : userById?.user?.avatar_url;
			const colorImg = await getColorAverageFromURL(url || '');
			if (colorImg) setColor(colorImg);
		}
	};

	useEffect(() => {
		getColor();
	}, [userID, []]);

	const checkAddFriend = useSelector(selectAddFriends(userById?.user?.id || ''));
	const checkUser = useMemo(() => userProfile?.user?.id === userID, [userID, userProfile?.user?.id]);
	const checkAnonymous = useMemo(() => message?.sender_id === '1767478432163172999', [message?.sender_id]);

	const { setIsShowSettingFooterStatus, setIsShowSettingFooterInitTab } = useSettingFooter();
	const openSetting = () => {
		setIsShowSettingFooterStatus(true);
		setIsShowSettingFooterInitTab('Profiles');
	};

	return (
		<div className={classWrapper} onClick={() => setOpenModal(initOpenModal)}>
			<div
				className={`${classBanner ? classBanner : 'rounded-tl-lg rounded-tr-lg h-[60px]'} flex justify-end gap-x-2 p-2`}
				style={{ backgroundColor: color }}
			>
				{!checkUser && (
					<GroupIconBanner
						checkAddFriend={checkAddFriend}
						openModal={openModal}
						setOpenModal={setOpenModal}
						user={userById}
						showPopupLeft={showPopupLeft}
					/>
				)}
			</div>
			<AvatarProfile
				avatar={isFooterProfile ? userProfile?.user?.avatar_url : userById?.user?.avatar_url}
				username={isFooterProfile ? userProfile?.user?.username : userById?.user?.username}
				userToDisplay={isFooterProfile ? userProfile : userById}
			/>
			<div className="px-[16px]">
				<div className="dark:bg-bgProfileBody bg-white w-full p-2 my-[16px] dark:text-white text-black rounded-[10px] flex flex-col text-justify">
					<div>
						<p className="font-semibold tracking-wider text-xl one-line my-0">
							{isFooterProfile
								? userProfile?.user?.display_name
								: userById
									? userById.user?.display_name
									: checkAnonymous
										? 'Anonymous'
										: message?.username}
						</p>
						<p className="font-medium tracking-wide text-sm my-0">
							{isFooterProfile
								? userProfile?.user?.username
								: userById
									? userById?.user?.username
									: checkAnonymous
										? 'Anonymous'
										: message?.username}
						</p>
					</div>
					{isFooterProfile ? null : <AboutUserProfile userID={userID} />}
					{isFooterProfile ? <StatusProfile userById={userById} /> : !hiddenRole && userById && <RoleUserProfile userID={userID} />}

					{!checkOwner(userById?.user?.google_id || '') && !hiddenRole ? (
						<div className="w-full items-center mt-2">
							<input
								type="text"
								className="w-full border dark:border-bgDisable rounded-[5px] dark:bg-bgDisable bg-bgLightModeSecond p-[5px] "
								placeholder={`Message @${userById?.user?.username}`}
								value={content}
								onKeyPress={(e) => {
									if (e.key === 'Enter') {
										sendMessage(userById?.user?.id || '');
									}
								}}
								onChange={handleContent}
							/>
						</div>
					) : null}
					{showNote && (
						<>
							<div className="w-full border-b-[1px] dark:border-[#40444b] border-gray-200 opacity-70 text-center p-2"></div>
							<NoteUserProfile />
						</>
					)}
					{!isFooterProfile && checkUser && (
						<button className="rounded dark:bg-slate-800 bg-bgLightModeButton py-2 hover:bg-opacity-50 mt-2" onClick={openSetting}>
							Edit Profile
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default ModalUserProfile;
