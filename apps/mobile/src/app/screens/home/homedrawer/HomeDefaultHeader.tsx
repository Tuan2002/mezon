import { ENotificationActive, ETypeSearch, Icons } from '@mezon/mobile-components';
import { Colors, size, useTheme } from '@mezon/mobile-ui';
import { selectChannelById, selectCurrentChannel, useAppSelector } from '@mezon/store-mobile';
import { ChannelStatusEnum } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import useStatusMuteChannel from '../../../hooks/useStatusMuteChannel';
import useTabletLandscape from '../../../hooks/useTabletLandscape';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import { style } from './styles';

const HomeDefaultHeader = React.memo(
	({ navigation, openBottomSheet, onOpenDrawer }: { navigation: any; openBottomSheet: () => void; onOpenDrawer: () => void }) => {
		const { themeValue } = useTheme();
		const styles = style(themeValue);
		const currentChannel = useSelector(selectCurrentChannel);
		const parent = useAppSelector((state) => selectChannelById(state, currentChannel?.parent_id || ''));

		const parentChannelLabel = parent?.channel_label || '';
		const navigateMenuThreadDetail = () => {
			navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.BOTTOM_SHEET });
		};
		const isTabletLandscape = useTabletLandscape();

		const navigateToSearchPage = () => {
			navigation.navigate(APP_SCREEN.MENU_CHANNEL.STACK, {
				screen: APP_SCREEN.MENU_CHANNEL.SEARCH_MESSAGE_CHANNEL,
				params: {
					typeSearch: ETypeSearch.SearchChannel,
					currentChannel
				}
			});
		};

		const isAgeRestrictedChannel = currentChannel?.age_restricted === 1;

		const navigateToNotifications = () => {
			navigation.navigate(APP_SCREEN.NOTIFICATION.STACK, {
				screen: APP_SCREEN.NOTIFICATION.HOME
			});
		};

		const renderChannelIcon = () => {
			if (currentChannel?.channel_private === ChannelStatusEnum.isPrivate && !!Number(currentChannel?.parent_id)) {
				return <Icons.ThreadLockIcon width={size.s_20} height={size.s_20} color={themeValue.textStrong} />;
			}

			if (!!currentChannel?.channel_label && !!Number(currentChannel?.parent_id)) {
				return <Icons.ThreadIcon width={size.s_20} height={size.s_20} color={themeValue.textStrong} />;
			}

			if (
				currentChannel?.channel_private === ChannelStatusEnum.isPrivate &&
				currentChannel?.type === ChannelType.CHANNEL_TYPE_CHANNEL &&
				!isAgeRestrictedChannel
			) {
				return <Icons.TextLockIcon width={size.s_20} height={size.s_20} color={themeValue.textStrong} />;
			}

			if (currentChannel?.channel_private !== ChannelStatusEnum.isPrivate && currentChannel?.type === ChannelType.CHANNEL_TYPE_STREAMING) {
				return <Icons.StreamIcon width={size.s_20} height={size.s_20} color={themeValue.textStrong} />;
			}

			if (currentChannel?.channel_private !== ChannelStatusEnum.isPrivate && currentChannel?.type === ChannelType.CHANNEL_TYPE_APP) {
				return <Icons.AppChannelIcon width={size.s_20} height={size.s_20} color={themeValue.textStrong} />;
			}

			if (currentChannel?.type === ChannelType.CHANNEL_TYPE_CHANNEL && isAgeRestrictedChannel) {
				return <Icons.HashtagWarning width={size.s_20} height={size.s_20} color={themeValue.textStrong} />;
			}

			return <Icons.TextIcon width={size.s_20} height={size.s_20} color={themeValue.textStrong} />;
		};

		return (
			<View style={styles.homeDefaultHeader}>
				<TouchableOpacity style={{ flex: 1 }} onPress={navigateMenuThreadDetail}>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						{!isTabletLandscape && (
							<TouchableOpacity
								hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
								activeOpacity={0.8}
								style={styles.iconBar}
								onPress={onOpenDrawer}
							>
								<Icons.ArrowLargeLeftIcon width={size.s_20} height={size.s_20} color={themeValue.textStrong} />
							</TouchableOpacity>
						)}
						{!!currentChannel?.channel_label && (
							<View style={styles.channelContainer}>
								{renderChannelIcon()}
								<View>
									<View style={styles.threadHeaderBox}>
										<Text style={styles.threadHeaderLabel} numberOfLines={1}>
											{currentChannel?.channel_label}
										</Text>
									</View>
									{!!parentChannelLabel && (
										<Text style={styles.channelHeaderLabel} numberOfLines={1}>
											{parentChannelLabel}
										</Text>
									)}
								</View>
							</View>
						)}
					</View>
				</TouchableOpacity>
				{isTabletLandscape && (
					<TouchableOpacity style={styles.iconBell} onPress={navigateToNotifications}>
						<Icons.Inbox width={size.s_20} height={size.s_20} color={themeValue.textStrong} />
					</TouchableOpacity>
				)}
				{!!currentChannel?.channel_label && !!Number(currentChannel?.parent_id) ? (
					<TouchableOpacity style={styles.iconBell} onPress={() => openBottomSheet()}>
						<NotificationBell color={themeValue.textStrong} />
					</TouchableOpacity>
				) : currentChannel ? (
					<TouchableOpacity style={styles.iconBell} onPress={() => navigateToSearchPage()}>
						<Icons.MagnifyingIcon width={size.s_20} height={size.s_20} color={Colors.textGray} />
					</TouchableOpacity>
				) : (
					<View />
				)}
			</View>
		);
	}
);

interface NotificationBellProps {
	color: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ color }) => {
	const iconProps = {
		width: size.s_20,
		height: size.s_20,
		color
	};

	const { statusMute } = useStatusMuteChannel();

	return statusMute === ENotificationActive.OFF ? <Icons.BellSlashIcon {...iconProps} /> : <Icons.BellIcon {...iconProps} />;
};

export default HomeDefaultHeader;
