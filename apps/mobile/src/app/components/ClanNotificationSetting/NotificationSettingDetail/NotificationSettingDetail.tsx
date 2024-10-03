import { ENotificationActive, ENotificationChannelId, EOptionOverridesType, optionNotification } from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import {
	defaultNotificationCategoryActions,
	notificationSettingActions,
	selectCurrentChannelNotificatonSelected,
	selectCurrentClanId,
	useAppDispatch
} from '@mezon/store-mobile';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { MezonOption } from '../../../temp-ui';
import { MuteClanNotificationBS } from '../MuteClanNotificationBS';
import { style } from './NotificationSettingDetail.styles';

const NotificationSettingDetail = ({ route }: { route: any }) => {
	const { notifyChannelCategorySetting } = route.params || {};
	const currentClanId = useSelector(selectCurrentClanId);
	const { t } = useTranslation(['clanNotificationsSetting']);
	const [selectedOption, setSelectedOption] = useState(null);
	const { themeValue } = useTheme();
	const dispatch = useAppDispatch();
	const styles = style(themeValue);
	const title = useMemo(() => {
		return notifyChannelCategorySetting?.channel_category_title || notifyChannelCategorySetting?.title;
	}, [notifyChannelCategorySetting]);

	useEffect(() => {
		dispatch(notificationSettingActions.getNotificationSetting({ channelId: notifyChannelCategorySetting?.id || '' }));
	}, []);
	const getNotificationChannelSelected = useSelector(selectCurrentChannelNotificatonSelected);

	const isUnmute = useMemo(() => {
		return (
			getNotificationChannelSelected?.active === ENotificationActive.ON || getNotificationChannelSelected.id === ENotificationChannelId.Default
		);
	}, [getNotificationChannelSelected]);

	const optionsNotificationSetting = useMemo(() => {
		return optionNotification?.map((option) => ({ ...option, disabled: !isUnmute }));
	}, [isUnmute]);

	useEffect(() => {
		setSelectedOption(notifyChannelCategorySetting?.notification_setting_type);
	}, [notifyChannelCategorySetting?.notification_setting_type]);

	const handleNotificationChange = (value) => {
		setSelectedOption(value);
		if (title === 'category') {
			dispatch(
				defaultNotificationCategoryActions.setDefaultNotificationCategory({
					category_id: notifyChannelCategorySetting?.id,
					notification_type: value,
					clan_id: currentClanId || ''
				})
			);
		}
		if (title === 'channel') {
			dispatch(
				notificationSettingActions.setNotificationSetting({
					channel_id: notifyChannelCategorySetting?.id,
					notification_type: value,
					clan_id: currentClanId || ''
				})
			);
		}
	};

	const handleRemoveOverride = () => {
		setSelectedOption(0);
		if (title === 'category') {
			dispatch(
				defaultNotificationCategoryActions.deleteDefaultNotificationCategory({
					category_id: notifyChannelCategorySetting?.id,
					clan_id: currentClanId
				})
			);
		}
		if (title === 'channel') {
			dispatch(
				notificationSettingActions.deleteNotiChannelSetting({ channel_id: notifyChannelCategorySetting?.id, clan_id: currentClanId || '' })
			);
		}
	};

	return (
		<Block backgroundColor={themeValue.primary} flex={1} padding={size.s_10}>
			{notifyChannelCategorySetting?.type !== EOptionOverridesType.Category && (
				<Block>
					<MuteClanNotificationBS
						isUnmute={isUnmute}
						notificationChannelSelected={getNotificationChannelSelected}
						currentChannel={notifyChannelCategorySetting}
						description={t('clanNotificationSettingDetail.muteChannelSubText')}
					/>
				</Block>
			)}
			<MezonOption
				onChange={handleNotificationChange}
				value={selectedOption}
				title={'Clan Notifications Setting'}
				data={optionsNotificationSetting}
			/>
			{!!selectedOption && (
				<TouchableOpacity
					onPress={() => {
						handleRemoveOverride();
					}}
					style={styles.resetOverridesBtn}
				>
					<Text style={styles.textBtn}>{t('resetOverrides')}</Text>
				</TouchableOpacity>
			)}
		</Block>
	);
};

export default NotificationSettingDetail;
