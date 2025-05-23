import { useClans, usePermissionChecker } from '@mezon/core';
import { ActionEmitEvent } from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import {
	ChannelsEntity,
	checkDuplicateNameClan,
	createSystemMessage,
	fetchSystemMessageByClanId,
	getStoreAsync,
	selectAllChannels,
	updateSystemMessage,
	useAppDispatch
} from '@mezon/store-mobile';
import { EPermission } from '@mezon/utils';
import { unwrapResult } from '@reduxjs/toolkit';
import { ChannelType } from 'mezon-js';
import { ApiSystemMessage, ApiSystemMessageRequest } from 'mezon-js/api.gen';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceEventEmitter, Dimensions, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import MezonIconCDN from '../../../componentUI/MezonIconCDN';
import MezonImagePicker from '../../../componentUI/MezonImagePicker';
import MezonInput from '../../../componentUI/MezonInput';
import MezonMenu, { IMezonMenuItemProps, IMezonMenuSectionProps } from '../../../componentUI/MezonMenu';
import MezonOption from '../../../componentUI/MezonOption';
import MezonSwitch from '../../../componentUI/MezonSwitch';
import { IconCDN } from '../../../constants/icon_cdn';
import { APP_SCREEN, MenuClanScreenProps } from '../../../navigation/ScreenTypes';
import { validInput } from '../../../utils/validate';
import DeleteClanModal from '../../DeleteClanModal';
import { ErrorInput } from '../../ErrorInput';
import ChannelsMessageSystem from './MessageSystemChannel';
import { style } from './styles';

export const { width } = Dimensions.get('window');
type ClanSettingsScreen = typeof APP_SCREEN.MENU_CLAN.OVERVIEW_SETTING;
export function ClanOverviewSetting({ navigation }: MenuClanScreenProps<ClanSettingsScreen>) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { currentClan, updateClan } = useClans();
	const { t } = useTranslation(['clanOverviewSetting']);
	const [clanName, setClanName] = useState<string>(currentClan?.clan_name ?? '');
	const [banner, setBanner] = useState<string>(currentClan?.banner ?? '');
	const [loading, setLoading] = useState<boolean>(false);
	const [hasAdminPermission, hasManageClanPermission, clanOwnerPermission] = usePermissionChecker([
		EPermission.administrator,
		EPermission.manageClan,
		EPermission.clanOwner
	]);
	const [isCheckValid, setIsCheckValid] = useState<boolean>();
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [systemMessage, setSystemMessage] = useState<ApiSystemMessage | null>(null);
	const [selectedChannelMessage, setSelectedChannelMessage] = useState<ChannelsEntity>(null);
	const [updateSystemMessageRequest, setUpdateSystemMessageRequest] = useState<ApiSystemMessageRequest | null>(null);

	const dispatch = useAppDispatch();

	const handleCheckDuplicateClanname = async () => {
		const store = await getStoreAsync();
		const isDuplicate = await store.dispatch(checkDuplicateNameClan(clanName?.trim()));
		return isDuplicate?.payload || false;
	};

	const channelsList = useSelector(selectAllChannels);
	const listChannelWithoutVoice = channelsList.filter(
		(channel) => channel?.clan_id === currentClan?.clan_id && channel.type === ChannelType.CHANNEL_TYPE_CHANNEL
	);

	useEffect(() => {
		const isClanNameChanged = clanName !== currentClan?.clan_name;
		const isBannerChanged = banner !== (currentClan?.banner || '');

		let hasSystemMessageChanged = false;
		if (updateSystemMessageRequest && systemMessage) {
			hasSystemMessageChanged =
				systemMessage.welcome_random !== updateSystemMessageRequest.welcome_random ||
				systemMessage.welcome_sticker !== updateSystemMessageRequest.welcome_sticker ||
				systemMessage.boost_message !== updateSystemMessageRequest.boost_message ||
				systemMessage.setup_tips !== updateSystemMessageRequest.setup_tips ||
				systemMessage.channel_id !== updateSystemMessageRequest.channel_id;
		}

		if (!validInput(clanName)) {
			setErrorMessage(t('menu.serverName.errorMessage'));
		}

		setIsCheckValid((isClanNameChanged && validInput(clanName)) || isBannerChanged || hasSystemMessageChanged);
	}, [clanName, banner, updateSystemMessageRequest, systemMessage]);

	const fetchSystemMessage = async () => {
		if (!currentClan?.clan_id) return;
		const resultAction = await dispatch(fetchSystemMessageByClanId({ clanId: currentClan?.clan_id, noCache: true }));
		const message = unwrapResult(resultAction);
		if (message) {
			setSystemMessage(message);
			setUpdateSystemMessageRequest(message);
		}
	};

	useEffect(() => {
		fetchSystemMessage();
	}, [currentClan]);

	const disabled = useMemo(() => {
		return !(hasAdminPermission || hasManageClanPermission || clanOwnerPermission);
	}, [clanOwnerPermission, hasAdminPermission, hasManageClanPermission]);

	navigation.setOptions({
		headerStatusBarHeight: Platform.OS === 'android' ? 0 : undefined,
		headerBackTitleVisible: false,
		headerRight: () => {
			if (disabled) return <View />;
			return (
				<Pressable onPress={handleSave} disabled={loading || !isCheckValid}>
					<Text style={{ ...styles.headerActionTitle, opacity: loading || !isCheckValid ? 0.5 : 1 }}>{t('header.save')}</Text>
				</Pressable>
			);
		}
	});

	const handleUpdateSystemMessage = async () => {
		if (systemMessage && Object.keys(systemMessage).length > 0 && currentClan?.clan_id && updateSystemMessageRequest) {
			const cachedMessageUpdate: ApiSystemMessage = {
				boost_message:
					updateSystemMessageRequest?.boost_message === systemMessage?.boost_message ? '' : updateSystemMessageRequest?.boost_message,
				channel_id: updateSystemMessageRequest?.channel_id === systemMessage?.channel_id ? '' : updateSystemMessageRequest?.channel_id,
				clan_id: systemMessage?.clan_id,
				id: systemMessage?.id,
				hide_audit_log:
					updateSystemMessageRequest?.hide_audit_log === systemMessage?.hide_audit_log ? '' : updateSystemMessageRequest?.hide_audit_log,
				setup_tips: updateSystemMessageRequest?.setup_tips === systemMessage?.setup_tips ? '' : updateSystemMessageRequest?.setup_tips,
				welcome_random:
					updateSystemMessageRequest?.welcome_random === systemMessage?.welcome_random ? '' : updateSystemMessageRequest?.welcome_random,
				welcome_sticker:
					updateSystemMessageRequest?.welcome_sticker === systemMessage?.welcome_sticker ? '' : updateSystemMessageRequest?.welcome_sticker
			};
			const request = {
				clanId: currentClan.clan_id,
				newMessage: cachedMessageUpdate,
				cachedMessage: updateSystemMessageRequest
			};
			await dispatch(updateSystemMessage(request));
		} else if (updateSystemMessageRequest) {
			await dispatch(createSystemMessage(updateSystemMessageRequest));
		}
		DeviceEventEmitter.emit(ActionEmitEvent.ON_TRIGGER_BOTTOM_SHEET, { isDismiss: true });
	};

	async function handleSave() {
		setLoading(true);

		const isClanNameChanged = clanName !== currentClan?.clan_name;

		if (isClanNameChanged) {
			const isDuplicateClan = await handleCheckDuplicateClanname();
			if (isDuplicateClan) {
				setErrorMessage(t('menu.serverName.duplicateNameMessage'));
				setIsCheckValid(false);
				setLoading(false);
				return;
			}
		}

		await updateClan({
			clan_id: currentClan?.clan_id ?? '',
			request: {
				banner: banner,
				clan_name: clanName?.trim() || (currentClan?.clan_name ?? ''),
				creator_id: currentClan?.creator_id ?? '',
				is_onboarding: currentClan?.is_onboarding,
				logo: currentClan?.logo ?? '',
				welcome_channel_id: currentClan?.welcome_channel_id ?? ''
			}
		});
		await handleUpdateSystemMessage();

		setLoading(false);
		Toast.show({
			type: 'info',
			text1: t('toast.saveSuccess')
		});

		navigation.goBack();
	}

	function handleLoad(url: string) {
		if (hasAdminPermission || clanOwnerPermission) {
			setBanner(url);
		} else {
			Toast.show({
				type: 'error',
				text1: t('menu.serverName.permissionDenied')
			});
		}
	}

	const handleClearBanner = () => {
		if (hasAdminPermission || clanOwnerPermission) {
			setBanner('');
		} else {
			Toast.show({
				type: 'error',
				text1: t('menu.serverName.permissionDenied')
			});
		}
	};

	const handleSelectChannel = useCallback((channel) => {
		setSelectedChannelMessage(channel);
		setUpdateSystemMessageRequest((prev) => ({
			...prev,
			channel_id: channel?.channel_id
		}));
	}, []);

	const openBottomSheet = () => {
		const data = {
			heightFitContent: true,
			children: <DeleteClanModal />
		};
		DeviceEventEmitter.emit(ActionEmitEvent.ON_TRIGGER_BOTTOM_SHEET, { isDismiss: false, data });
	};

	const openBottomSheetSystemChannel = () => {
		const data = {
			heightFitContent: true,
			children: <ChannelsMessageSystem onSelectChannel={handleSelectChannel} />
		};
		DeviceEventEmitter.emit(ActionEmitEvent.ON_TRIGGER_BOTTOM_SHEET, { isDismiss: false, data });
	};

	// const inactiveMenu: IMezonMenuItemProps[] = [
	// 	{
	// 		title: t('menu.inactive.inactiveChannel'),
	// 		expandable: true,
	// 		previewValue: 'No Active channel',
	// 		onPress: () => reserve(),
	// 		disabled: disabled
	// 	},
	// 	{
	// 		title: t('menu.inactive.inactiveTimeout'),
	// 		expandable: true,
	// 		previewValue: '5 mins',
	// 		disabled: disabled,
	// 		onPress: () => reserve()
	// 	}
	// ];

	// ...existing code...

	const systemMessageMenu: IMezonMenuItemProps[] = [
		{
			title: t('menu.systemMessage.channel'),
			expandable: true,
			component: (
				<Text style={{ color: 'white', fontSize: 11 }}>
					{selectedChannelMessage?.channel_label || listChannelWithoutVoice[0]?.channel_label}
				</Text>
			),
			onPress: openBottomSheetSystemChannel,
			disabled: disabled
		},
		{
			title: t('menu.systemMessage.welcomeRandom'),
			component: (
				<MezonSwitch
					disabled={disabled}
					value={systemMessage?.welcome_random === '1'}
					onValueChange={(value) =>
						setUpdateSystemMessageRequest((prev) => ({
							...prev,
							welcome_random: value ? '1' : '0'
						}))
					}
				/>
			),
			disabled: disabled
		},
		{
			title: t('menu.systemMessage.welcomeSticker'),
			component: (
				<MezonSwitch
					disabled={disabled}
					value={systemMessage?.welcome_sticker === '1'}
					onValueChange={(value) =>
						setUpdateSystemMessageRequest((prev) => ({
							...prev,
							welcome_sticker: value ? '1' : '0'
						}))
					}
				/>
			),
			disabled: disabled
		},
		{
			title: t('menu.systemMessage.boostMessage'),
			component: (
				<MezonSwitch
					disabled={disabled}
					value={systemMessage?.boost_message === '1'}
					onValueChange={(value) =>
						setUpdateSystemMessageRequest((prev) => ({
							...prev,
							boost_message: value ? '1' : '0'
						}))
					}
				/>
			),
			disabled: disabled
		},
		{
			title: t('menu.systemMessage.setupTips'),
			component: (
				<MezonSwitch
					disabled={disabled}
					value={systemMessage?.setup_tips === '1'}
					onValueChange={(value) =>
						setUpdateSystemMessageRequest((prev) => ({
							...prev,
							setup_tips: value ? '1' : '0'
						}))
					}
				/>
			),
			disabled: disabled
		}
	];

	const deleteMenu: IMezonMenuItemProps[] = [
		{
			title: t('menu.deleteServer.delete'),
			textStyle: { color: 'red' },
			onPress: openBottomSheet
		}
	];

	const generalMenu: IMezonMenuSectionProps[] = [
		// {
		// 	items: inactiveMenu,
		// 	title: t('menu.inactive.title'),
		// 	bottomDescription: t('menu.inactive.description')
		// },
		{
			items: systemMessageMenu,
			title: t('menu.systemMessage.title'),
			bottomDescription: t('menu.systemMessage.description')
		}
	];

	const dangerMenu: IMezonMenuSectionProps[] = [
		{
			items: deleteMenu
		}
	];

	const optionData = [
		{
			title: t('fields.defaultNotification.allMessages'),
			value: 0,
			disabled: disabled
		},
		{
			title: t('fields.defaultNotification.onlyMentions'),
			value: 1,
			disabled: disabled
		}
	];

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: themeValue.secondary
			}}
		>
			<ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps={'handled'}>
				<MezonImagePicker
					disabled={disabled}
					defaultValue={banner}
					height={200}
					width={width - 40}
					onLoad={handleLoad}
					showHelpText
					autoUpload
				/>

				<Pressable style={{ position: 'absolute', right: size.s_14, top: size.s_2 }} onPress={handleClearBanner}>
					<MezonIconCDN icon={IconCDN.circleXIcon} height={25} width={25} color={themeValue.white} />
				</Pressable>

				<View style={{ marginVertical: 10 }}>
					<MezonInput
						label={t('menu.serverName.title')}
						onTextChange={setClanName}
						value={clanName}
						maxCharacter={64}
						disabled={disabled}
					/>
					{!isCheckValid && !!errorMessage && <ErrorInput style={styles.errorInput} errorMessage={errorMessage} />}
				</View>

				<MezonMenu menu={generalMenu} />

				<MezonOption
					title={t('fields.defaultNotification.title')}
					bottomDescription={t('fields.defaultNotification.description')}
					data={optionData}
				/>
				{!disabled && <MezonMenu menu={dangerMenu} />}
			</ScrollView>
		</View>
	);
}
