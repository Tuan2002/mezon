import { Icons } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { IMezonMenuItemProps, IMezonMenuSectionProps, MezonMenu, MezonSwitch, reserve } from '../../../temp-ui';
import { style } from './NotificationOption.styles';
interface INotificationOptionProps {
	selectedTabs: { mention: boolean; individual: boolean };
	onChangeTab: (value: string, isSelected: true) => void;
}
const NotificationOption = memo(({ selectedTabs, onChangeTab }: INotificationOptionProps) => {
	const { t } = useTranslation(['notification']);
	const { themeValue } = useTheme();
	const styles = style(themeValue);

	const handleTabChange = (value, isSelected) => {
		onChangeTab(value, isSelected);
	};
	const Btn = useCallback(
		({ val }: { val: 'individual' | 'mention' }) => (
			<MezonSwitch
				value={selectedTabs[val]}
				onValueChange={(isSelected) => {
					handleTabChange(val, isSelected);
				}}
			/>
		),
		[]
	);

	const notificationMenu = useMemo(
		() =>
			[
				{
					title: t('tabNotify.forYou'),
					icon: <Icons.AtIcon color={themeValue.textStrong} />,
					component: <Btn val="individual" />
				},
				{
					title: t('tabNotify.mention'),
					icon: <Icons.BellIcon color={themeValue.textStrong} />,
					component: <Btn val="mention" />
				}
			] satisfies IMezonMenuItemProps[],
		[]
	);

	const settingMenu = useMemo(
		() =>
			[
				{
					title: t('tabNotify.notificationSettings'),
					icon: <Icons.SettingsIcon color={themeValue.textStrong} />,
					expandable: true,
					onPress: () => reserve()
				}
			] satisfies IMezonMenuItemProps[],
		[]
	);

	const menu = useMemo(
		() => [{ items: notificationMenu }, { items: settingMenu }] satisfies IMezonMenuSectionProps[],
		[notificationMenu, settingMenu]
	);

	return (
		<View style={styles.wrapperOption}>
			<MezonMenu menu={menu} />
		</View>
	);
});

export default NotificationOption;
