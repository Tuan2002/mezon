import { CategoryChannelItemProps, EOptionOverridesType, notificationType } from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import { selectAllchannelCategorySetting } from '@mezon/store-mobile';
import { useNavigation } from '@react-navigation/native';
import { ChannelType } from 'mezon-js';
import React, { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import MezonIconCDN from '../../../componentUI/MezonIconCDN';
import { IconCDN } from '../../../constants/icon_cdn';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import { style } from './CategoryChannelItem.styles';

export const CategoryChannelItem = React.memo(
	({
		typePreviousIcon,
		notificationStatus,
		categorySubtext,
		categoryLabel,
		expandable,
		stylesItem = {},
		data,
		categoryChannelId
	}: CategoryChannelItemProps) => {
		const { themeValue } = useTheme();
		const navigation = useNavigation<any>();
		const styles = style(themeValue);
		const channelCategorySettings = useSelector(selectAllchannelCategorySetting);

		const dataNotificationsSetting = useMemo(() => {
			return channelCategorySettings?.find((item) => item?.id === categoryChannelId);
		}, [categoryChannelId, channelCategorySettings]);

		const navigateToNotificationDetail = useCallback(() => {
			navigation.navigate(APP_SCREEN.MENU_CLAN.STACK, {
				screen: APP_SCREEN.MENU_CLAN.NOTIFICATION_SETTING_DETAIL,
				params: {
					notifyChannelCategorySetting: dataNotificationsSetting || data
				}
			});
		}, []);

		return (
			<TouchableOpacity onPress={navigateToNotificationDetail} style={{ ...styles.categoryItem, ...stylesItem }}>
				<View style={{ flexDirection: 'row', gap: size.s_10, alignItems: 'center', maxWidth: '80%' }}>
					{typePreviousIcon === ChannelType.CHANNEL_TYPE_CHANNEL && (
						<MezonIconCDN icon={IconCDN.channelText} width={16} height={16} color={themeValue.channelNormal} />
					)}
					{typePreviousIcon === EOptionOverridesType.Category && (
						<MezonIconCDN icon={IconCDN.forderIcon} width={16} height={16} color={themeValue.channelNormal} />
					)}
					<View>
						{categoryLabel && <Text style={styles.categoryLabel}>{categoryLabel}</Text>}
						{categorySubtext && <Text style={styles.categorySubtext}>{categorySubtext}</Text>}
					</View>
				</View>

				<View style={{ flexDirection: 'row', gap: size.s_10, alignItems: 'center' }}>
					{notificationStatus && <Text style={styles.customStatus}>{notificationType[notificationStatus]}</Text>}
					{expandable && <MezonIconCDN icon={IconCDN.chevronSmallRightIcon} height={18} width={18} color={themeValue.text} />}
				</View>
			</TouchableOpacity>
		);
	}
);
