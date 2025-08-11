import { useMemberStatus } from '@mezon/core';
import { ActionEmitEvent } from '@mezon/mobile-components';
import { baseColor, useTheme } from '@mezon/mobile-ui';
import { selectDmGroupCurrent, selectMemberClanByUserId2 } from '@mezon/store-mobile';
import { ChannelStatusEnum } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { ChannelType } from 'mezon-js';
import { memo, useContext, useMemo } from 'react';
import { DeviceEventEmitter, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import MezonAvatar from '../../../componentUI/MezonAvatar';
import MezonIconCDN from '../../../componentUI/MezonIconCDN';
import { IconCDN } from '../../../constants/icon_cdn';
import useTabletLandscape from '../../../hooks/useTabletLandscape';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import { getUserStatusByMetadata } from '../../../utils/helpers';
import MenuCustomDm from '../../MenuCustomDm';
import { threadDetailContext } from '../MenuThreadDetail';
import { style } from './styles';

export const ThreadHeader = memo(() => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const currentChannel = useContext(threadDetailContext);
	const currentDmGroup = useSelector(selectDmGroupCurrent(currentChannel?.id ?? ''));
	const isTabletLandscape = useTabletLandscape();

	const isDMThread = useMemo(() => {
		return [ChannelType.CHANNEL_TYPE_DM, ChannelType.CHANNEL_TYPE_GROUP].includes(currentChannel?.type);
	}, [currentChannel]);

	const firstUserId = useMemo(() => {
		const userIds = currentChannel?.user_id;
		return Array.isArray(userIds) && userIds.length === 1 ? userIds[0] : '';
	}, [currentChannel?.user_id]);

	const userStatus = useMemberStatus(firstUserId);
	const user = useSelector((state) => selectMemberClanByUserId2(state, firstUserId));
	const status = getUserStatusByMetadata(user?.user?.metadata);

	const navigation = useNavigation<any>();
	const openMenu = () => {
		const data = {
			heightFitContent: true,
			children: <MenuCustomDm currentChannel={currentChannel} channelLabel={channelLabel} />
		};
		DeviceEventEmitter.emit(ActionEmitEvent.ON_TRIGGER_BOTTOM_SHEET, { isDismiss: false, data });
	};
	const channelLabel = useMemo(() => {
		return (currentDmGroup?.channel_label ||
			currentChannel?.channel_label ||
			(typeof currentChannel?.usernames === 'string' ? currentChannel?.usernames : currentChannel?.usernames?.[0] || '')) as string;
	}, [currentDmGroup?.channel_label, currentChannel?.channel_label, currentChannel?.usernames]);

	const isChannel = useMemo(() => {
		return !!currentChannel?.channel_label && !Number(currentChannel?.parent_id);
	}, [currentChannel?.channel_label, currentChannel?.parent_id]);

	const handlebackMessageDetail = () => {
		if (isDMThread && !isTabletLandscape) {
			navigation.navigate(APP_SCREEN.MESSAGES.MESSAGE_DETAIL, { directMessageId: currentChannel?.id });
		} else {
			navigation.goBack();
		}
	};

	const isAgeRestrictedChannel = useMemo(() => {
		return currentChannel?.age_restricted === 1;
	}, [currentChannel?.age_restricted]);

	const renderChannelIcon = () => {
		const isPrivateChannel = currentChannel?.channel_private === ChannelStatusEnum.isPrivate;
		const isTextOrThreadChannel = [ChannelType.CHANNEL_TYPE_CHANNEL, ChannelType.CHANNEL_TYPE_THREAD].includes(currentChannel?.type);
		if (currentChannel?.type === ChannelType.CHANNEL_TYPE_CHANNEL && isAgeRestrictedChannel) {
			return <MezonIconCDN icon={IconCDN.channelTextWarning} width={20} height={20} color={themeValue.text} />;
		}
		if (isPrivateChannel && isTextOrThreadChannel) {
			return isChannel ? (
				<MezonIconCDN icon={IconCDN.channelTextLock} width={20} height={20} color={themeValue.text} />
			) : (
				<MezonIconCDN icon={IconCDN.threadLockIcon} width={20} height={20} color={themeValue.text} />
			);
		}

		return isChannel ? (
			<MezonIconCDN icon={IconCDN.channelText} width={20} height={20} color={themeValue.text} />
		) : (
			<MezonIconCDN icon={IconCDN.threadIcon} width={20} height={20} color={themeValue.text} />
		);
	};

	return (
		<View style={styles.channelLabelWrapper}>
			<TouchableOpacity style={styles.iconBackHeader} onPress={handlebackMessageDetail}>
				<MezonIconCDN icon={IconCDN.arrowLargeLeftIcon} color={themeValue.text} height={20} width={20} />
			</TouchableOpacity>

			{isDMThread ? (
				<View style={styles.avatarWrapper}>
					<View>
						{currentChannel?.type === ChannelType.CHANNEL_TYPE_GROUP ? (
							<View style={[styles.groupAvatar, styles.avatarSize]}>
								<MezonIconCDN icon={IconCDN.groupIcon} color={baseColor.white} />
							</View>
						) : (
							<MezonAvatar
								avatarUrl={
									Array.isArray(currentChannel?.channel_avatar) && currentChannel.channel_avatar.length > 0
										? currentChannel.channel_avatar[0]
										: undefined
								}
								username={channelLabel}
								userStatus={userStatus}
								customStatus={status}
							/>
						)}
					</View>
					<Text numberOfLines={5} style={styles.dmLabel}>
						{channelLabel}
					</Text>
				</View>
			) : (
				<View style={styles.channelText}>
					{renderChannelIcon()}
					<Text numberOfLines={1} style={styles.channelLabel}>
						{channelLabel}
					</Text>
				</View>
			)}
			{isDMThread && (
				<TouchableOpacity onPress={openMenu} style={styles.iconMenuHeader}>
					<MezonIconCDN icon={IconCDN.moreHorizontalIcon} color={themeValue.white} />
				</TouchableOpacity>
			)}
		</View>
	);
});
