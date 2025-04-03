import { ActionEmitEvent, ENotificationActive, ENotificationChannelId, Icons } from '@mezon/mobile-components';
import { baseColor, useTheme } from '@mezon/mobile-ui';
import {
	DirectEntity,
	channelsActions,
	deleteChannel,
	directActions,
	directMetaActions,
	fetchDirectMessage,
	markAsReadProcessing,
	notificationSettingActions,
	removeMemberChannel,
	selectCurrentClan,
	selectCurrentUserId,
	selectNotifiSettingsEntitiesById,
	useAppDispatch,
	useAppSelector
} from '@mezon/store-mobile';
import { createImgproxyUrl, sleep } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { ApiUpdateChannelDescRequest, ChannelType } from 'mezon-js';
import { ApiMarkAsReadRequest } from 'mezon-js/api.gen';
import React, { memo, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceEventEmitter, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import MezonIconCDN from '../../../../../../../src/app/componentUI/MezonIconCDN';
import { IconCDN } from '../../../../../../../src/app/constants/icon_cdn';
import MezonConfirm from '../../../../../componentUI/MezonConfirm';
import MezonMenu, { IMezonMenuItemProps, IMezonMenuSectionProps, reserve } from '../../../../../componentUI/MezonMenu';
import { APP_SCREEN } from '../../../../../navigation/ScreenTypes';
import { style } from './styles';

interface IServerMenuProps {
	// inviteRef: MutableRefObject<any>;
	messageInfo: DirectEntity;
}

function MessageMenu({ messageInfo }: IServerMenuProps) {
	const { t } = useTranslation(['dmMessage']);
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const dispatch = useAppDispatch();
	const navigation = useNavigation<any>();
	const currentClan = useSelector(selectCurrentClan);

	const dismiss = () => {
		DeviceEventEmitter.emit(ActionEmitEvent.ON_TRIGGER_BOTTOM_SHEET, { isDismiss: true });
	};

	useEffect(() => {
		dispatch(notificationSettingActions.getNotificationSetting({ channelId: messageInfo?.channel_id }));
	}, []);

	const userName: string = useMemo(() => {
		return (
			messageInfo?.channel_label || (typeof messageInfo?.usernames === 'string' ? messageInfo?.usernames : messageInfo?.usernames?.[0] || '')
		);
	}, [messageInfo?.channel_label, messageInfo?.usernames]);

	const getNotificationChannelSelected = useSelector(selectNotifiSettingsEntitiesById(messageInfo?.channel_id));

	const isDmUnmute = useMemo(() => {
		return (
			getNotificationChannelSelected?.active === ENotificationActive.ON || getNotificationChannelSelected?.id === ENotificationChannelId.Default
		);
	}, [getNotificationChannelSelected]);

	const isGroup = useMemo(() => {
		return Number(messageInfo?.type) === ChannelType.CHANNEL_TYPE_GROUP;
	}, [messageInfo?.type]);

	const lastOne = useMemo(() => {
		return !messageInfo?.user_id?.length;
	}, [messageInfo?.user_id]);

	const leaveGroupMenu: IMezonMenuItemProps[] = [
		{
			onPress: async () => {
				dismiss();
				await sleep(500);
				const data = {
					children: (
						<MezonConfirm
							onConfirm={handleLeaveGroupConfirm}
							title={t('confirm.title', {
								groupName: messageInfo?.channel_label
							})}
							content={t('confirm.content', {
								groupName: messageInfo?.channel_label
							})}
							confirmText={t('confirm.confirmText')}
						/>
					)
				};
				DeviceEventEmitter.emit(ActionEmitEvent.ON_TRIGGER_MODAL, { isDismiss: false, data });
			},
			isShow: isGroup,
			title: lastOne ? t('delete.leaveGroup') : t('menu.leaveGroup'),
			textStyle: { color: 'red' }
		}
	];

	const profileMenu: IMezonMenuItemProps[] = [
		{
			onPress: async () => {
				await dispatch(directActions.closeDirectMessage({ channel_id: messageInfo?.channel_id }));
				dismiss();
			},
			title: t('menu.closeDm'),
			isShow: !isGroup,
			icon: <MezonIconCDN icon={IconCDN.userMinusIcon} color={baseColor.gray} />
		}
	];

	const handleMarkAsRead = async (channel_id: string) => {
		if (!channel_id) return;
		const timestamp = Date.now() / 1000;
		dispatch(directMetaActions.setDirectLastSeenTimestamp({ channelId: channel_id, timestamp }));

		const body: ApiMarkAsReadRequest = {
			clan_id: '',
			category_id: '',
			channel_id
		};
		try {
			await dispatch(markAsReadProcessing(body));
		} catch (error) {
			console.error('Failed to mark as read:', error);
		} finally {
			dismiss();
		}
	};

	const markAsReadMenu: IMezonMenuItemProps[] = [
		{
			onPress: async () => await handleMarkAsRead(messageInfo?.channel_id ?? ''),
			title: t('menu.markAsRead'),
			icon: <MezonIconCDN icon={IconCDN.eyeIcon} color={baseColor.gray} />
		}
	];

	const favoriteMenu: IMezonMenuItemProps[] = [
		{
			onPress: () => reserve(),
			title: t('menu.favorite'),
			icon: <Icons.FavoriteFilledIcon color={baseColor.gray} />
		}
	];

	const muteOrUnMuteChannel = (active: ENotificationActive) => {
		const body = {
			channel_id: messageInfo?.channel_id || '',
			notification_type: getNotificationChannelSelected?.notification_setting_type || 0,
			clan_id: currentClan?.clan_id || '',
			active
		};
		dispatch(notificationSettingActions.setMuteNotificationSetting(body));
	};

	const handleEnableOrDisableE2EE = async () => {
		const updateChannel: ApiUpdateChannelDescRequest = {
			channel_id: messageInfo.channel_id,
			channel_label: '',
			category_id: messageInfo.category_id,
			app_url: messageInfo.app_url,
			e2ee: !messageInfo.e2ee ? 1 : 0
		};
		await dispatch(channelsActions.updateChannel(updateChannel));
		dismiss();
	};

	const optionsMenu: IMezonMenuItemProps[] = [
		{
			onPress: handleEnableOrDisableE2EE,
			title: messageInfo?.e2ee ? t('menu.disableE2EE') : t('menu.enableE2EE'),
			icon: messageInfo?.e2ee ? (
				<MezonIconCDN icon={IconCDN.lockUnlockIcon} color={themeValue.textStrong} />
			) : (
				<MezonIconCDN icon={IconCDN.lockIcon} color={themeValue.text} />
			)
		},
		{
			title: isDmUnmute ? t('menu.muteConversation') : t('menu.unMuteConversation'),
			onPress: () => {
				if (!isDmUnmute) {
					muteOrUnMuteChannel(ENotificationActive.ON);
				} else {
					navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, {
						screen: APP_SCREEN.MENU_THREAD.MUTE_THREAD_DETAIL_CHANNEL,
						params: { currentChannel: messageInfo, isCurrentChannel: false }
					});
				}
				dismiss();
			},
			icon: isDmUnmute ? (
				<MezonIconCDN icon={IconCDN.bellSlashIcon} color={themeValue.textStrong} />
			) : (
				<MezonIconCDN icon={IconCDN.bellIcon} width={22} height={22} color={themeValue.text} />
			)
		}
		// {
		// 	onPress: () => reserve(),
		// 	title: t('menu.notificationSettings')
		// }
	];

	const menu: IMezonMenuSectionProps[] = [
		{
			items: leaveGroupMenu
		},
		{
			items: profileMenu
		},
		{
			items: markAsReadMenu
		},
		{
			items: optionsMenu
		}
	];
	const currentUserId = useAppSelector(selectCurrentUserId);

	const handleLeaveGroupConfirm = async () => {
		const isLeaveOrDeleteGroup = lastOne
			? await dispatch(deleteChannel({ clanId: '', channelId: messageInfo?.channel_id ?? '', isDmGroup: true }))
			: await dispatch(removeMemberChannel({ channelId: messageInfo?.channel_id || '', userIds: [currentUserId], kickMember: false }));
		if (!isLeaveOrDeleteGroup) {
			return;
		}

		await dispatch(fetchDirectMessage({ noCache: true }));
		DeviceEventEmitter.emit(ActionEmitEvent.ON_TRIGGER_MODAL, { isDismiss: true });
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				{isGroup ? (
					<View style={styles.groupAvatar}>
						<MezonIconCDN icon={IconCDN.groupIcon} />
					</View>
				) : (
					<View style={styles.avatarWrapper}>
						{messageInfo?.channel_avatar?.[0] ? (
							<FastImage
								source={{
									uri: createImgproxyUrl(messageInfo?.channel_avatar?.[0] ?? '', { width: 100, height: 100, resizeType: 'fit' })
								}}
								style={styles.friendAvatar}
							/>
						) : (
							<View style={styles.wrapperTextAvatar}>
								<Text style={styles.textAvatar}>{userName?.charAt?.(0)}</Text>
							</View>
						)}
					</View>
				)}
				<View style={styles.titleWrapper}>
					<Text style={styles.serverName} numberOfLines={2}>
						{userName}
					</Text>
					{isGroup && <Text style={styles.memberText}>{messageInfo?.user_id?.length + 1} members</Text>}
				</View>
			</View>

			<View>
				<MezonMenu menu={menu} />
			</View>
		</View>
	);
}

export default memo(MessageMenu);
