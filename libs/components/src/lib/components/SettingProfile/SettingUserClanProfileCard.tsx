import { useAuth, useMemberStatus } from '@mezon/core';
import { selectAccountCustomStatus } from '@mezon/store';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AvatarProfile from '../ModalUserProfile/AvatarProfile';
import { getColorAverageFromURL } from './AverageColor';
export type Profilesform = {
	displayName: string;
	urlImage: string;
};
export type propProfilesform = {
	profiles: Profilesform;
	currentDisplayName?: string;
	isDM?: boolean;
};
const SettingUserClanProfileCard = (props: propProfilesform) => {
	const { userProfile } = useAuth();
	const { profiles, currentDisplayName } = props;
	const checkUrl = profiles.urlImage === undefined || profiles.urlImage === '';
	const userStatusProfile = useSelector(selectAccountCustomStatus);
	const [color, setColor] = useState<string>('#323232');
	const userStatus = useMemberStatus(userProfile?.user?.id || '');

	useEffect(() => {
		const getColor = async () => {
			if (!checkUrl) {
				const colorImg = await getColorAverageFromURL(profiles.urlImage);
				if (colorImg) setColor(colorImg);
			}
		};

		getColor();
	}, [checkUrl, profiles.urlImage]);

	return (
		<div className="dark:bg-black bg-[#f0f0f0] mt-[10px]  rounded-lg flex flex-col relative">
			<div className="h-[105px] rounded-tr-[10px] rounded-tl-[10px]" style={{ backgroundColor: color }}></div>
			<AvatarProfile
				avatar={profiles.urlImage}
				username={userProfile?.user?.username}
				userToDisplay={true}
				customStatus={userStatusProfile}
				userID={userProfile?.user?.id}
				userStatus={userStatus}
			/>
			<div className="px-[16px]">
				<div className="dark:bg-bgPrimary bg-[#e2e2e2] dark:text-white text-black w-full p-4 my-[16px] rounded-[10px] flex flex-col gap-y-6 xl:gap-y-7">
					<div className="w-[300px]">
						<p className="font-bold tracking-wider text-xl one-line">
							{profiles.displayName || currentDisplayName || userProfile?.user?.username}
						</p>
						<p className="font-medium tracking-wide text-sm">{userProfile?.user?.username}</p>
					</div>
				</div>
			</div>
		</div>
	);
};
export default SettingUserClanProfileCard;
