import { useEscapeKeyClose, useMarkAsRead, useOnClickOutside, usePermissionChecker, UserRestrictionZone } from '@mezon/core';
import { clansActions, defaultNotificationActions, selectDefaultNotificationClan, useAppDispatch } from '@mezon/store';
import { EPermission, IClan } from '@mezon/utils';
import { Dropdown } from 'flowbite-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Coords } from '../ChannelLink';
import { notificationTypesList } from '../PanelChannel';
import GroupPanels from '../PanelChannel/GroupPanels';
import ItemPanel from '../PanelChannel/ItemPanel';

interface IPanelCLanProps {
	coords: Coords;
	clan?: IClan;
	onDeleteCategory?: () => void;
	setShowClanListMenuContext?: () => void;
}

const PanelClan: React.FC<IPanelCLanProps> = ({ coords, clan, setShowClanListMenuContext }) => {
	const panelRef = useRef<HTMLDivElement | null>(null);
	const [positionTop, setPositionTop] = useState(false);
	const [canManageCLan] = usePermissionChecker([EPermission.clanOwner, EPermission.manageClan], '', clan?.clan_id ?? '');
	const dispatch = useAppDispatch();
	const defaultNotificationClan = useSelector(selectDefaultNotificationClan);

	const [isOnClickOutsideActive, setIsOnClickOutsideActive] = useState(true);

	useEffect(() => {
		const heightPanel = panelRef.current?.clientHeight;
		if (heightPanel && heightPanel > coords.distanceToBottom) {
			setPositionTop(true);
		}
	}, [coords.distanceToBottom]);
	const handClosePannel = useCallback(() => {
		setShowClanListMenuContext?.();
	}, []);

	useEscapeKeyClose(panelRef, handClosePannel);
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	useOnClickOutside(panelRef, isOnClickOutsideActive ? handClosePannel : () => {});
	const { handleMarkAsReadClan, statusMarkAsReadClan } = useMarkAsRead();
	useEffect(() => {
		if (statusMarkAsReadClan === 'success' || statusMarkAsReadClan === 'error') {
			handClosePannel();
		}
	}, [statusMarkAsReadClan]);

	const handleChangeSettingType = (notificationType: number) => {
		dispatch(
			defaultNotificationActions.setDefaultNotificationClan({
				clan_id: clan?.clan_id,
				notification_type: notificationType
			})
		);
		handClosePannel();
	};

	const notificationLabel = useMemo(() => {
		const notificationType = notificationTypesList.find((type) => type.value === defaultNotificationClan?.notification_setting_type);
		return notificationType ? notificationType.label : null;
	}, [defaultNotificationClan?.notification_setting_type]);

	const handleInvitePeople = () => {
		dispatch(clansActions.toggleInvitePeople(true));
		setIsOnClickOutsideActive(false);
	};
	return (
		<div
			ref={panelRef}
			tabIndex={-1}
			role={'button'}
			style={{ left: coords.mouseX, bottom: positionTop ? '12px' : 'auto', top: positionTop ? 'auto' : coords.mouseY }}
			className="outline-none fixed top-full dark:bg-bgProfileBody bg-white rounded-sm z-20 w-[200px] py-[10px] px-[10px] shadow-md"
		>
			<GroupPanels>
				<ItemPanel
					onClick={statusMarkAsReadClan === 'pending' ? undefined : () => handleMarkAsReadClan(clan?.id as string)}
					disabled={statusMarkAsReadClan === 'pending'}
				>
					{statusMarkAsReadClan === 'pending' ? 'Processing...' : 'Mark As Read'}
				</ItemPanel>
			</GroupPanels>

			<GroupPanels>
				<ItemPanel children="Invite People" info onClick={handleInvitePeople} />
			</GroupPanels>
			<GroupPanels>
				<Dropdown
					trigger="hover"
					dismissOnClick={false}
					renderTrigger={() => (
						<div>
							<ItemPanel children="Notification Settings" subText={notificationLabel as string} dropdown="change here" />
						</div>
					)}
					label=""
					placement="right-start"
					className="dark:!bg-bgProfileBody bg-gray-100 border-none ml-[3px] py-[6px] px-[8px] w-[200px] relative"
				>
					{notificationTypesList.map((notification) => (
						<ItemPanel
							children={notification.label}
							notificationId={notification.value}
							type="radio"
							name="NotificationSetting"
							key={notification.value}
							onClick={() => handleChangeSettingType(notification.value)}
							checked={defaultNotificationClan?.notification_setting_type === notification.value}
						/>
					))}
				</Dropdown>
				<ItemPanel children={'Hide Muted Channels'} type={'checkbox'} />
			</GroupPanels>
			<GroupPanels>
				{/* will be add later  */}
				{/* <UserRestrictionZone policy={canManageCLan}>
					<Dropdown
						trigger="hover"
						dismissOnClick={false}
						renderTrigger={() => (
							<div>
								<ItemPanel children={'Clan Settings'} dropdown="change here" />
							</div>
						)}
						label=""
						placement="right-start"
						className="dark:!bg-bgProfileBody bg-gray-100 border-none ml-[3px] py-[6px] px-[8px] w-[200px]"
					>
						{serverSettingsMenuList.map((menuItem) => (
							<ItemPanel children={menuItem.label} notificationId={menuItem.value} name="ServerSettingsMenu" key={menuItem.value} />
						))}
					</Dropdown>
				</UserRestrictionZone> */}
				<ItemPanel children={'Privacy Settings'} />
				<ItemPanel children={'Edit Server Profile'} />
			</GroupPanels>

			<UserRestrictionZone policy={!canManageCLan}>
				<GroupPanels>
					<ItemPanel children={'Leave Server'} danger />
				</GroupPanels>
			</UserRestrictionZone>
		</div>
	);
};

export default PanelClan;
