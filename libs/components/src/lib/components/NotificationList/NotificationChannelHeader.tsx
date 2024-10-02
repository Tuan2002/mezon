import { selectClanById, selectTheme, useAppSelector } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { INotification, TNotificationChannel } from '@mezon/utils';
import { Tooltip } from 'flowbite-react';
import { useSelector } from 'react-redux';

type NotificationChannelHeaderProps = {
	itemUnread?: TNotificationChannel;
	notification?: INotification;
	isUnreadTab?: boolean;
	clan_id?: string;
	onMarkAsRead?: () => void;
	onDeleteNotification?: () => void;
};

const NotificationChannelHeader = ({
	itemUnread,
	isUnreadTab,
	clan_id,
	notification,
	onMarkAsRead,
	onDeleteNotification
}: NotificationChannelHeaderProps) => {
	const clan = useAppSelector(selectClanById(clan_id as string));
	const appearanceTheme = useSelector(selectTheme);

	return (
		<div className="flex justify-between">
			<div className="flex flex-row items-center gap-2">
				<div>
					{itemUnread?.clan_logo || notification?.content?.clan_logo ? (
						<img
							src={itemUnread?.clan_logo || notification?.content?.clan_logo}
							className="w-[45px] h-[45px] rounded-xl"
							alt={itemUnread?.clan_logo || notification?.content?.clan_logo}
						/>
					) : (
						<div>
							{clan?.clan_name && (
								<div className="w-[45px] h-[45px] bg-bgDisable flex justify-center items-center text-contentSecondary text-[20px] rounded-xl">
									{clan?.clan_name.charAt(0).toUpperCase()}
								</div>
							)}
						</div>
					)}
				</div>

				<div className="flex flex-col gap-1">
					<div className="font-bold text-[16px] cursor-pointer flex gap-x-1">
						# <p className=" hover:underline">{itemUnread?.channel_label || notification?.content?.channel_label}</p>
					</div>
					<div className="text-[10px] uppercase">
						{clan?.clan_name} {'>'} {itemUnread?.category_name || notification?.content?.category_name}
					</div>
				</div>
			</div>

			<div className="flex flex-row items-center gap-3">
				{isUnreadTab ? (
					<>
						<Tooltip
							content={
								<p style={{ whiteSpace: 'nowrap' }} className="max-w-60 truncate">
									{'Notification Settings'}
								</p>
							}
							trigger="hover"
							animation="duration-500"
							style={appearanceTheme === 'light' ? 'light' : 'dark'}
							placement="top"
						>
							<button className="dark:bg-bgTertiary bg-bgLightModeButton mr-1 dark:text-contentPrimary text-colorTextLightMode rounded-full w-6 h-6 flex items-center justify-center text-[10px]">
								<Icons.UnMuteBell defaultSize="w-4 h-4" />
							</button>
						</Tooltip>

						<Tooltip
							content={
								<p style={{ whiteSpace: 'nowrap' }} className="max-w-60 truncate">
									{'Mark as read'}
								</p>
							}
							trigger="hover"
							animation="duration-500"
							style={appearanceTheme === 'light' ? 'light' : 'dark'}
							placement="top"
						>
							<button
								className="dark:bg-bgTertiary bg-bgLightModeButton mr-1 dark:text-contentPrimary text-colorTextLightMode rounded-full w-6 h-6 flex items-center justify-center text-[10px]"
								onClick={onMarkAsRead}
							>
								✔
							</button>{' '}
						</Tooltip>
					</>
				) : (
					<Tooltip
						content={
							<p style={{ whiteSpace: 'nowrap' }} className="max-w-60 truncate">
								{'Close'}
							</p>
						}
						trigger="hover"
						animation="duration-500"
						style={appearanceTheme === 'light' ? 'light' : 'dark'}
						placement="top"
					>
						<button
							className="dark:bg-bgTertiary bg-bgLightModeButton mr-1 dark:text-contentPrimary text-colorTextLightMode rounded-full w-6 h-6 flex items-center justify-center text-[10px]"
							onClick={onDeleteNotification}
						>
							✕
						</button>
					</Tooltip>
				)}
			</div>
		</div>
	);
};

export default NotificationChannelHeader;
