import { useState } from 'react';
import { ExitSetting } from '../SettingProfile';
import ClanSettingOverview from './ClanSettingOverview';
import { ItemObjProps, ItemSetting, listItemSetting } from './ItemObj';
import ServerSettingMainRoles from './SettingMainRoles';
import SettingSidebar from './SettingSidebar';
import { useMenu } from '@mezon/core';
import * as Icons from '../Icons';

export type ModalSettingProps = {
	open: boolean;
	onClose: () => void;
};

const ClanSetting = (props: ModalSettingProps) => {
	const { open, onClose } = props;
	const [currentSetting, setCurrentSetting] = useState<ItemObjProps>(listItemSetting[0]);
	const handleSettingItemClick = (settingItem: ItemObjProps) => {
		setCurrentSetting(settingItem);
	};
	const [menu, setMenu] = useState(true);
	const { closeMenu } = useMenu();

	return (
		<div>
			{open ? (
				<div className="  flex fixed inset-0  w-screen z-10">
					<div className="flex flex-row w-screen">
						<div className='h-fit absolute top-5 right-5 block sbm:hidden'>
							<button
								className="bg-[#AEAEAE] w-[30px] h-[30px] rounded-[50px] font-bold transform hover:scale-105 hover:bg-slate-400 transition duration-300 ease-in-out"
								onClick={onClose}
							>
							X
							</button>
						</div>
						<div className='h-fit absolute top-5 left-5 block sbm:hidden'>
							<button
								className={`bg-[#AEAEAE] w-[30px] h-[30px] rounded-[50px] font-bold transform hover:scale-105 hover:bg-slate-400 transition duration-300 ease-in-out flex justify-center items-center ${menu ? 'rotate-90' : '-rotate-90'}`}
								onClick={() => setMenu(!menu)}
							>
								<Icons.ArrowDown defaultFill="white" defaultSize="w-[20px] h-[30px]" />
							</button>
						</div>
						<div className={`flex-col flex-1 dark:bg-bgSecondary bg-bgLightSecondary ${(closeMenu && !menu) ? 'hidden' : 'flex'}`}>
							<SettingSidebar onClickItem={handleSettingItemClick} handleMenu={(value: boolean)=>setMenu(value)}/>
						</div>

						<div className="flex-3 bg-white dark:bg-bgPrimary overflow-y-auto hide-scrollbar">
							<div className="flex flex-row flex-1 justify-start h-full">
								<div className="w-[740px] px-[40px] pt-[60px] pb-[80px]">
									<div className="relative">
										<h2 className="text-xl font-semibold mb-5 dark:text-textDarkTheme text-textLightTheme">
											{currentSetting.name}
										</h2>
										{currentSetting.id === ItemSetting.OVERVIEW && <ClanSettingOverview />}
										{currentSetting.id === ItemSetting.ROLES && <ServerSettingMainRoles />}
									</div>
								</div>
								<ExitSetting onClose={onClose} />
							</div>
						</div>
						<div className="w-1 h-full dark:bg-bgPrimary bg-bgLightModeSecond"></div>
					</div>
				</div>
			) : null}
		</div>
	);
};

export default ClanSetting;
