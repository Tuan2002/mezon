import { authActions, selectCurrentClan, useAppDispatch } from '@mezon/store';
import { LogoutModal } from 'libs/ui/src/lib/LogOutButton';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ItemObjProps, sideBarListItem } from '../ItemObj';
import SettingItem from '../SettingItem';

type SettingSidebarProps = {
	onClickItem?: (settingItem: ItemObjProps) => void;
	handleMenu: (value: boolean) => void;
	currentSetting: string;
	setIsShowDeletePopup: () => void;
};

const SettingSidebar = ({ onClickItem, handleMenu, currentSetting, setIsShowDeletePopup }: SettingSidebarProps) => {
	const [selectedButton, setSelectedButton] = useState<string | null>(currentSetting);
	const currentClan = useSelector(selectCurrentClan);

	const [openModal, setOpenModal] = useState<boolean>(false);
	const dispatch = useAppDispatch();
	const handleLogOut = () => {
		dispatch(authActions.logOut());
	};
	const handleCloseModal = () => {
		setOpenModal(false);
		setSelectedButton('');
	};

	const handleClickButtonSidebar = (settingItem: ItemObjProps) => {
		onClickItem?.(settingItem);
		setSelectedButton(settingItem.id);
	};

	return (
		<div className="flex flex-row flex-1 justify-end">
			<div className="w-[220px] py-[60px] pl-5 pr-[6px]">
				<p className="text-[#84ADFF] pl-[10px] pb-[6px] font-bold text-sm tracking-wider uppercase truncate">{currentClan?.clan_name}</p>
				{sideBarListItem.map((item, index) => (
					<div className={`${index !== 0 && 'mt-[20px] relative before:absolute before:content-[""] before:left-[10px] before:w-[calc(100%_-_20px)] before:h-[1px] before:bg-[#e3e3e3] dark:before:bg-[#3b3b3b] before:top-[-10px]'}`}>
						{item.title && <p className='select-none font-semibold px-[10px] py-[4px] text-sm uppercase dark:text-[#949ba4] text-[#5c5e66]'>{item.title}</p>}
						{
							item.listItem.map((setting) => (
								<SettingItem
									key={setting.id}
									name={setting.name}
									active={selectedButton === setting.id}
									onClick={() => handleClickButtonSidebar(setting)}
									handleMenu={handleMenu}
								/>
							))
						}
					</div>
				))}
				<button
					className={`text-red-500 text-buttonProfile w-full py-1 px-[10px] mb-1 text-[16px] font-medium rounded text-left dark:hover:bg-bgHover hover:bg-bgModifierHoverLight`}
					onClick={setIsShowDeletePopup}
				>
					Delete clan
				</button>
				{openModal && <LogoutModal handleLogOut={handleLogOut} onClose={handleCloseModal} />}
			</div>
		</div>
	);
};

export default SettingSidebar;
