import { fetchWebhooks, selectCloseMenu, selectCurrentChannel, selectCurrentChannelId, selectCurrentClanId, useAppDispatch } from '@mezon/store';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import * as Icons from '../../../../../ui/src/lib/Icons';
import DeleteClanModal from '../DeleteClanModal';
import { ExitSetting } from '../SettingProfile';
import ClanSettingOverview from './ClanSettingOverview';
import Integrations from './Integrations';
import { ItemObjProps, ItemSetting, listItemSetting } from './ItemObj';
import NotificationSoundSetting from './NotificationSoundSetting';
import SettingEmoji from './SettingEmoji';
import ServerSettingMainRoles from './SettingMainRoles';
import SettingSidebar from './SettingSidebar';
import SettingSticker from './SettingSticker';

export type ModalSettingProps = {
	onClose: () => void;
  initialSetting?: string
};

const ClanSetting = (props: ModalSettingProps) => {
	const { onClose, initialSetting } = props;
	const [currentSettingId, setCurrentSettingId] = useState<string>(initialSetting ? initialSetting : listItemSetting[0].id);
  const currentSetting = useMemo(() => {
    return listItemSetting.find(item => item.id === currentSettingId);
  }, [currentSettingId])
  
	const handleSettingItemClick = (settingItem: ItemObjProps) => {
		setCurrentSettingId(settingItem.id);
	};
 
	const [menu, setMenu] = useState(true);
	const closeMenu = useSelector(selectCloseMenu);
	const [isShowDeletePopup, setIsShowDeletePopup] = useState<boolean>(false);
	const currentChannel = useSelector(selectCurrentChannel) || undefined;
  
  const currentSettingPage = () => {
    switch (currentSettingId) {
      case ItemSetting.OVERVIEW:
        return <ClanSettingOverview />;
      case ItemSetting.ROLES:
        return <ServerSettingMainRoles />;
      case ItemSetting.INTEGRATIONS:
        return <Integrations currentChannel={currentChannel}/>;
      case ItemSetting.EMOJI:
        return <SettingEmoji />;
      case ItemSetting.NOTIFICATION_SOUND:
        return <NotificationSoundSetting />;
      case ItemSetting.STICKERS:
        return <SettingSticker />;
    }
  }
  	const dispatch = useAppDispatch();
  	const currentClanId = useSelector(selectCurrentClanId) as string;
	const currentChannelId = useSelector(selectCurrentChannelId) as string;
	useEffect(()=>{
		dispatch(fetchWebhooks({ channelId: currentChannelId, clanId: currentClanId }))
	})

	useEffect(() => {
		if (currentSettingId === ItemSetting.DELETE_SERVER) {
			setIsShowDeletePopup(true);
		}
	}, [currentSettingId]);
	return (
		<div className="  flex fixed inset-0  w-screen z-10">
			<div className="flex flex-row w-screen">
				<div className="z-50 h-fit absolute top-5 right-5 block sbm:hidden">
					<button
						className="bg-[#AEAEAE] w-[30px] h-[30px] rounded-[50px] font-bold transform hover:scale-105 hover:bg-slate-400 transition duration-300 ease-in-out"
						onClick={onClose}
					>
						X
					</button>
				</div>
				<div className="z-50 h-fit absolute top-5 left-5 block sbm:hidden">
					<button
						className={`bg-[#AEAEAE] w-[30px] h-[30px] rounded-[50px] font-bold transform hover:scale-105 hover:bg-slate-400 transition duration-300 ease-in-out flex justify-center items-center ${menu ? 'rotate-90' : '-rotate-90'}`}
						onClick={() => setMenu(!menu)}
					>
						<Icons.ArrowDown defaultFill="white" defaultSize="w-[20px] h-[30px]" />
					</button>
				</div>
				<div className={`flex-col flex-1 dark:bg-bgSecondary bg-bgLightSecondary ${closeMenu && !menu ? 'hidden' : 'flex'}`}>
					<SettingSidebar
						onClickItem={handleSettingItemClick}
						handleMenu={(value: boolean) => setMenu(value)}
						currentSetting={currentSetting?.id || ''}
						setIsShowDeletePopup={() => setIsShowDeletePopup(true)}
					/>
				</div>

				<div className="flex-3 bg-white dark:bg-bgPrimary overflow-y-auto hide-scrollbar">
					<div className="flex flex-row flex-1 justify-start h-full">
						<div className="w-[740px] sbm:pl-10 pr-7">
							<div className="relative max-h-full sbm:min-h-heightRolesEdit min-h-heightRolesEditMobile">
								{!(currentSetting?.id === ItemSetting.INTEGRATIONS) ? (
									<h2 className="text-xl font-semibold mb-5 dark:text-textDarkTheme text-textLightTheme sbm:mt-[60px] mt-[10px]">
										{currentSetting?.name}
									</h2>
								) : (
									''
								)}
                				{currentSettingPage()}
							</div>
						</div>
						{isShowDeletePopup && <DeleteClanModal onClose={() => setIsShowDeletePopup(false)} />}
						<ExitSetting onClose={onClose} />
					</div>
				</div>
				<div className="w-1 h-full dark:bg-bgPrimary bg-bgLightModeSecond"></div>
			</div>
		</div>
	);
};

export default ClanSetting;
