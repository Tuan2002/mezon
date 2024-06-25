import { useDirect, useSendInviteMessage } from '@mezon/core';
import { selectAddFriends, selectAllAccount, selectMemberByUserId, selectTheme } from '@mezon/store';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getColorAverageFromURL } from '../SettingProfile/AverageColor';
import AboutUserProfile from './AboutUserProfile';
import AvatarProfile from './AvatarProfile';
import NoteUserProfile from './NoteUserProfile';
import RoleUserProfile from './RoleUserProfile';
import StatusProfile from './StatusProfile';
import { IMessageWithUser } from '@mezon/utils';
import { Icons } from '../../components';
import { Tooltip } from 'flowbite-react';
type ModalUserProfileProps = {
	userID?: string;
	isFooterProfile?: boolean;
	classWrapper?: string;
	classBanner?: string;
	hiddenRole?: boolean;
	showNote?: boolean;
	message?: IMessageWithUser;
};

const ModalUserProfile = ({ userID, isFooterProfile, classWrapper, classBanner, hiddenRole, showNote, message }: ModalUserProfileProps) => {
	const userProfile = useSelector(selectAllAccount);
	const { createDirectMessageWithUser } = useDirect();
	const { sendInviteMessage } = useSendInviteMessage();
	const appearanceTheme = useSelector(selectTheme);

	const userById = useSelector(selectMemberByUserId(userID ?? ''));

	const [content, setContent] = useState<string>('');

	const sendMessage = async (userId: string) => {
		const response = await createDirectMessageWithUser(userId);
		if (response.channel_id) {
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
	const checkUser = useMemo(() => userProfile?.user?.id === userID,[userID, userProfile?.user?.id]);
	const checkAnonymous = useMemo(() => message?.sender_id === '1767478432163172999',[message?.sender_id]);
	
	return (
		<div className={classWrapper}>
			<div className={`${classBanner ? classBanner : 'rounded-tl-lg rounded-tr-lg h-[60px]'} flex justify-end gap-x-2 p-2`} style={{ backgroundColor: color }}>
				{!checkUser &&
					<>
						{ checkAddFriend ? 
							<Tooltip
								content='Friend'
								trigger="hover"
								animation="duration-500"
								style={appearanceTheme === 'light' ? 'light' : 'dark'}
							>
								<div className='p-2 rounded-full bg-black'>
									<Icons.IconFriend className='text-white size-4'/>
								</div>
							</Tooltip> :
							<Tooltip
								content='Add friend'
								trigger="hover"
								animation="duration-500"
								style={appearanceTheme === 'light' ? 'light' : 'dark'}
							>
								<div className='p-2 rounded-full bg-black'>
									<Icons.AddPerson className='text-white size-4'/>
								</div>
							</Tooltip>
						}
						<Tooltip
							content='More'
							trigger="hover"
							animation="duration-500"
							style={appearanceTheme === 'light' ? 'light' : 'dark'}
						>
							<div className='p-2 rounded-full bg-black'>
								<Icons.ThreeDot defaultSize='size-4 text-white'/>
							</div>
						</Tooltip>
					</>
				}
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
							{isFooterProfile ? userProfile?.user?.display_name : userById ? userById.user?.display_name : (checkAnonymous ? 'Anonymous' : message?.username)}
						</p>
						<p className="font-medium tracking-wide text-sm my-0">
							{isFooterProfile ? userProfile?.user?.username : userById ? userById?.user?.username : (checkAnonymous ? 'Anonymous' : message?.username)}
						</p>
					</div>
					{isFooterProfile ? null : <AboutUserProfile userID={userID} />}
					{isFooterProfile ? <StatusProfile userById={userById} /> : !hiddenRole && <RoleUserProfile userID={userID} />}

					{!checkOwner(userById?.user?.google_id || '') && !hiddenRole ? (
						<div className="w-full items-center">
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
				</div>
			</div>
		</div>
	);
};

export default ModalUserProfile;
