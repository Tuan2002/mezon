import { ClanHeader, DirectMessageList, FooterProfile } from '@mezon/components';
import { useAuth, useEscapeKey } from '@mezon/core';
import { useState } from 'react';
import Setting from '../setting';
import { MainContentDirect } from './MainContentDirect';
import { useSelector } from 'react-redux';
import { selectCloseMenu, selectStatusMenu } from '@mezon/store';

export default function Direct() {
	const { userProfile } = useAuth();
	const [openSetting, setOpenSetting] = useState(false);
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);

	useEscapeKey(() => setOpenSetting(false));

	return (
		<>
			<div
				className={`flex-col  flex w-[272px] dark:bg-bgSecondary bg-[#F7F7F7] relative min-w-widthMenuMobile sbm:min-w-[272px] ${closeMenu ? (statusMenu ? 'flex' : 'hidden') : ''}`}
			>
				<ClanHeader type={'direct'} />
				<DirectMessageList />
				<FooterProfile
					name={userProfile?.user?.username || ''}
					status={userProfile?.user?.online}
					avatar={userProfile?.user?.avatar_url || ''}
					userId={userProfile?.user?.id}
				/>
			</div>
			<MainContentDirect />
			<Setting />
		</>
	);
}
