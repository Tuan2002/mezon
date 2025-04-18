import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ActionEmitEvent, CheckIcon, STORAGE_DATA_CLAN_CHANNEL_CACHE, getUpdateOrAddClanChannelCache, isEqual, save } from '@mezon/mobile-components';
import { Colors, useTheme } from '@mezon/mobile-ui';
import {
	channelsActions,
	getStoreAsync,
	selectAllChannels,
	selectChannelById,
	selectCurrentUserId,
	threadsActions,
	useAppDispatch,
	useAppSelector
} from '@mezon/store-mobile';
import { checkIsThread } from '@mezon/utils';
import { ApiUpdateChannelDescRequest } from 'mezon-js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceEventEmitter, Pressable, ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import MezonConfirm from '../../componentUI/MezonConfirm';
import MezonIconCDN from '../../componentUI/MezonIconCDN';
import MezonInput from '../../componentUI/MezonInput';
import MezonMenu, { IMezonMenuItemProps, IMezonMenuSectionProps } from '../../componentUI/MezonMenu';
import { IconCDN } from '../../constants/icon_cdn';
import useBackHardWare from '../../hooks/useBackHardWare';
import { APP_SCREEN, MenuChannelScreenProps } from '../../navigation/ScreenTypes';
import { AddMemberOrRoleBS } from '../../screens/channelPermissionSetting/components/AddMemberOrRoleBS';
import { validInput } from '../../utils/validate';
import { style } from './styles';

interface IChannelSettingValue {
	channelName: string;
	channelTopic: string;
	//TODO: update more
}

type ScreenChannelSetting = typeof APP_SCREEN.MENU_CHANNEL.SETTINGS;
export function ChannelSetting({ navigation, route }: MenuChannelScreenProps<ScreenChannelSetting>) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { channelId } = route.params;
	const { t } = useTranslation(['channelSetting', 'channelCreator']);
	const { t: t1 } = useTranslation(['screenStack']);
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const dispatch = useAppDispatch();
	const channel = useAppSelector((state) => selectChannelById(state, channelId || ''));
	const isChannel = !checkIsThread(channel);
	const [isCheckValid, setIsCheckValid] = useState<boolean>(true);
	const [isCheckDuplicateNameChannel, setIsCheckDuplicateNameChannel] = useState<boolean>(false);
	const channelsClan = useSelector(selectAllChannels);
	const [originSettingValue, setOriginSettingValue] = useState<IChannelSettingValue>({
		channelName: '',
		channelTopic: ''
	});
	const [currentSettingValue, setCurrentSettingValue] = useState<IChannelSettingValue>({
		channelName: '',
		channelTopic: ''
	});
	const isNotChanged = useMemo(() => {
		return isEqual(originSettingValue, currentSettingValue);
	}, [originSettingValue, currentSettingValue]);

	useBackHardWare();
	const currentUserId = useSelector(selectCurrentUserId);

	navigation.setOptions({
		headerTitle: isChannel ? t1('menuChannelStack.channelSetting') : t1('menuChannelStack.threadSetting'),
		headerRight: () => (
			<Pressable onPress={() => handleSaveChannelSetting()}>
				<Text style={[styles.saveChangeButton, !isNotChanged ? styles.changed : styles.notChange]}>{t('confirm.save')}</Text>
			</Pressable>
		)
	});

	const handleUpdateValue = (value: Partial<IChannelSettingValue>) => {
		setCurrentSettingValue({ ...currentSettingValue, ...value });
	};

	useEffect(() => {
		if (channel?.channel_id) {
			const initialChannelSettingValue: IChannelSettingValue = {
				channelName: channel?.channel_label,
				channelTopic: ''
			};
			setOriginSettingValue(initialChannelSettingValue);
			setCurrentSettingValue(initialChannelSettingValue);
		}
	}, [channel]);

	useEffect(() => {
		setIsCheckValid(validInput(currentSettingValue?.channelName));
	}, [currentSettingValue?.channelName]);

	const handleSaveChannelSetting = async () => {
		const isCheckNameChannelValue =
			!!channelsClan?.length && channelsClan?.some((channel) => channel?.channel_label === currentSettingValue?.channelName);
		setIsCheckDuplicateNameChannel(isCheckNameChannelValue);
		const updateChannel: ApiUpdateChannelDescRequest = {
			channel_id: channel?.channel_id || '',
			channel_label: currentSettingValue?.channelName,
			category_id: channel.category_id,
			app_url: ''
		};
		if (isCheckNameChannelValue || !isCheckValid) return;
		await dispatch(channelsActions.updateChannel(updateChannel));
		navigation?.goBack();
		Toast.show({
			type: 'success',
			props: {
				text2: t('toast.updated'),
				leadingIcon: <CheckIcon color={Colors.green} />
			}
		});
	};

	const deleteMenu = useMemo(
		() =>
			[
				{
					title: isChannel ? t('fields.channelDelete.delete') : t('fields.threadDelete.delete'),
					textStyle: { color: 'red' },
					onPress: () => handlePressDeleteChannel(),
					icon: <MezonIconCDN icon={IconCDN.trashIcon} color="red" />
				},
				{
					title: isChannel ? t('fields.channelDelete.leave') : t('fields.threadLeave.leave'),
					textStyle: { color: 'red' },
					onPress: () => handlePressLeaveChannel(),
					icon: <MezonIconCDN icon={IconCDN.leaveGroupIcon} color={Colors.textRed} />,
					isShow: channel?.creator_id !== currentUserId
				}
			] satisfies IMezonMenuItemProps[],
		[channel?.creator_id, currentUserId, isChannel, t]
	);

	const bottomMenu = useMemo(() => [{ items: deleteMenu }] satisfies IMezonMenuSectionProps[], []);

	const handleDeleteChannel = useCallback(async () => {
		await dispatch(
			channelsActions.deleteChannel({
				channelId: channel?.channel_id,
				clanId: channel?.clan_id
			})
		);
		DeviceEventEmitter.emit(ActionEmitEvent.ON_TRIGGER_MODAL, { isDismiss: true });
		navigation.navigate(APP_SCREEN.HOME);
		if (channel?.parent_id !== '0') {
			await dispatch(
				channelsActions.joinChannel({
					clanId: channel?.clan_id,
					channelId: channel?.parent_id,
					noFetchMembers: false
				})
			);
		}
	}, []);

	const handleJoinChannel = async () => {
		const channelId = channel?.parent_id || '';
		const clanId = channel?.clan_id || '';
		const dataSave = getUpdateOrAddClanChannelCache(clanId, channelId);
		const store = await getStoreAsync();
		requestAnimationFrame(async () => {
			store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false }));
		});
		save(STORAGE_DATA_CLAN_CHANNEL_CACHE, dataSave);
	};

	const handleConfirmLeaveThread = useCallback(async () => {
		await dispatch(
			threadsActions.leaveThread({
				clanId: channel?.clan_id || '',
				channelId: channel?.parent_id || '',
				threadId: channel?.id || '',
				isPrivate: channel.channel_private || 0
			})
		);
		navigation.navigate(APP_SCREEN.HOME);
		DeviceEventEmitter.emit(ActionEmitEvent.ON_TRIGGER_MODAL, { isDismiss: true });
		handleJoinChannel();
	}, []);

	const handlePressLeaveChannel = () => {
		const data = {
			children: (
				<MezonConfirm
					onConfirm={handleConfirmLeaveThread}
					title={t('confirm.leave.title')}
					confirmText={t('confirm.leave.confirmText')}
					content={t('confirm.leave.content', {
						channelName: channel?.channel_label
					})}
				/>
			)
		};
		DeviceEventEmitter.emit(ActionEmitEvent.ON_TRIGGER_MODAL, { isDismiss: false, data });
	};

	const handlePressDeleteChannel = () => {
		const data = {
			children: (
				<MezonConfirm
					onConfirm={handleDeleteChannel}
					title={t('confirm.delete.title')}
					confirmText={t('confirm.delete.confirmText')}
					content={t('confirm.delete.content', {
						channelName: channel?.channel_label
					})}
				/>
			)
		};
		DeviceEventEmitter.emit(ActionEmitEvent.ON_TRIGGER_MODAL, { isDismiss: false, data });
	};

	return (
		<ScrollView style={styles.container}>
			<View style={styles.inputWrapper}>
				<MezonInput
					label={t('fields.channelName.title')}
					value={currentSettingValue.channelName}
					onTextChange={(text) => handleUpdateValue({ channelName: text })}
					maxCharacter={64}
					errorMessage={
						isCheckDuplicateNameChannel
							? t('channelCreator:fields.channelName.duplicateChannelName')
							: !isCheckValid
								? t('fields.channelName.errorMessage')
								: ''
					}
					placeHolder={t('fields.channelName.placeholder')}
					isValid={!isCheckDuplicateNameChannel && isCheckValid}
				/>
			</View>

			{/*<MezonSlider data={slowModeOptions} title={t('fields.channelSlowMode.title')} />*/}

			<MezonMenu menu={bottomMenu} />
			<AddMemberOrRoleBS bottomSheetRef={bottomSheetRef} channel={channel} />
		</ScrollView>
	);
}
