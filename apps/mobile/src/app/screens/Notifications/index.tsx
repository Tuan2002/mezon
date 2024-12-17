import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNotification } from '@mezon/core';
import { getUpdateOrAddClanChannelCache, Icons, save, STORAGE_CLAN_ID, STORAGE_DATA_CLAN_CHANNEL_CACHE } from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import {
	appActions,
	channelsActions,
	clansActions,
	directActions,
	getStoreAsync,
	messagesActions,
	notificationActions,
	RootState,
	selectCurrentClanId,
	useAppDispatch
} from '@mezon/store-mobile';
import { INotification, NotificationCode, NotificationEntity } from '@mezon/utils';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { ChannelStreamMode } from 'mezon-js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { MezonBottomSheet } from '../../componentUI';
import useTabletLandscape from '../../hooks/useTabletLandscape';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import EmptyNotification from './EmptyNotification';
import NotificationItem from './NotificationItem';
import NotificationItemOption from './NotificationItemOption';
import NotificationOption from './NotificationOption';
import { style } from './Notifications.styles';
import SkeletonNotification from './SkeletonNotification';
import { EActionDataNotify, ENotifyBsToShow } from './types';

const Notifications = () => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { notification, deleteNotify } = useNotification();
	const [notify, setNotify] = useState<INotification>();
	const currentClanId = useSelector(selectCurrentClanId);
	const loadingStatus = useSelector((state: RootState) => state?.notification?.loadingStatus);
	const isLoading = useMemo(() => ['loading']?.includes(loadingStatus), [loadingStatus]);
	const dispatch = useAppDispatch();
	const isTabletLandscape = useTabletLandscape();
	const { t } = useTranslation(['notification']);
	const navigation = useNavigation();
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const bottomSheetOptionsRef = useRef<BottomSheetModal>(null);
	const timeoutRef = useRef(null);

	const [selectedTabs, setSelectedTabs] = useState({ individual: true, mention: true });
	const [notificationsFilter, setNotificationsFilter] = useState<NotificationEntity[]>([]);

	useFocusEffect(
		React.useCallback(() => {
			if (currentClanId && currentClanId !== '0') {
				initLoader();
			}
			return () => {
				dispatch(notificationActions.refreshStatus());
			};
		}, [currentClanId])
	);

	useEffect(() => {
		handleFilterNotify(EActionDataNotify.All);
	}, [notification]);

	const initLoader = async () => {
		const store = await getStoreAsync();
		store.dispatch(notificationActions.fetchListNotification({ clanId: currentClanId }));
	};

	const handleFilterNotify = (tabNotify) => {
		const sortNotifications = notification.sort((a, b) => {
			const dateA = new Date(a.create_time || '').getTime();
			const dateB = new Date(b.create_time || '').getTime();
			return dateB - dateA;
		});

		switch (tabNotify) {
			case EActionDataNotify.Individual:
				setNotificationsFilter(
					sortNotifications.filter((item) => item.code !== NotificationCode.USER_MENTIONED && item.code !== NotificationCode.USER_REPLIED)
				);
				break;
			case EActionDataNotify.Mention:
				setNotificationsFilter(
					sortNotifications.filter((item) => item.code === NotificationCode.USER_MENTIONED || item.code === NotificationCode.USER_REPLIED)
				);
				break;
			case EActionDataNotify.All:
				setNotificationsFilter(sortNotifications);
				break;
			default:
				setNotificationsFilter([]);
				break;
		}
	};

	const handleTabChange = (value, isSelected) => {
		setSelectedTabs((prevState) => ({
			...prevState,
			[value]: isSelected
		}));
	};

	useEffect(() => {
		setSelectedTabs({ individual: true, mention: true });
	}, [currentClanId]);

	useEffect(() => {
		const { individual, mention } = selectedTabs;
		handleFilterNotify(
			individual && mention ? EActionDataNotify.All : individual ? EActionDataNotify.Individual : mention ? EActionDataNotify.Mention : null
		);
	}, [selectedTabs.individual, selectedTabs.mention]);

	useEffect(() => {
		return () => {
			timeoutRef?.current && clearTimeout(timeoutRef.current);
		};
	}, []);

	const openBottomSheet = useCallback((type: ENotifyBsToShow, notify?: INotification) => {
		switch (type) {
			case ENotifyBsToShow.notification:
				bottomSheetRef.current?.present();
				break;
			case ENotifyBsToShow.removeNotification:
				bottomSheetOptionsRef.current?.present();
				setNotify(notify);
				break;
			default:
				bottomSheetRef.current?.present();
				break;
		}
	}, []);

	const handleDeleteNotify = (notify?: INotification) => {
		notify && deleteNotify(notify.id, currentClanId || '0');
		closeBottomSheet();
	};

	const handleNotification = (notify: INotification, currentClanId: string, store: any, navigation: any) => {
		store.dispatch(appActions.setLoadingMainMobile(true));
		return new Promise<void>((resolve) => {
			requestAnimationFrame(async () => {
				const promises = [];
				if (notify?.content?.mode === ChannelStreamMode.STREAM_MODE_DM || notify?.content?.mode === ChannelStreamMode.STREAM_MODE_GROUP) {
					promises.push(store.dispatch(directActions.fetchDirectMessage({})));
					promises.push(store.dispatch(directActions.setDmGroupCurrentId(notify?.content?.channel_id)));
				} else {
					if (notify?.content?.clan_id !== currentClanId) {
						promises.push(store.dispatch(clansActions.changeCurrentClan({ clanId: notify?.content?.clan_id })));
					}

					promises.push(
						store.dispatch(
							channelsActions.joinChannel({
								clanId: notify?.content?.clan_id ?? '',
								channelId: notify?.content?.channel_id,
								noFetchMembers: false
							})
						)
					);
				}

				await Promise.all(promises);

				if (notify?.content?.mode === ChannelStreamMode.STREAM_MODE_DM || notify?.content?.mode === ChannelStreamMode.STREAM_MODE_GROUP) {
					navigation.navigate(APP_SCREEN.MESSAGES.STACK, {
						screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL,
						params: { directMessageId: notify?.content?.channel_id }
					});
				} else {
					const dataSave = getUpdateOrAddClanChannelCache(notify?.content?.clan_id, notify?.content?.channel_id);
					save(STORAGE_CLAN_ID, notify?.content?.clan_id);
					save(STORAGE_DATA_CLAN_CHANNEL_CACHE, dataSave);
					navigation.navigate(APP_SCREEN.HOME as never);
					navigation.dispatch(DrawerActions.closeDrawer());
				}
				timeoutRef.current = setTimeout(() => {
					store.dispatch(
						messagesActions.jumpToMessage({
							clanId: notify?.content?.clan_id,
							channelId: notify?.content?.channel_id,
							messageId: notify?.content?.message_id
						})
					);
					store.dispatch(appActions.setLoadingMainMobile(false));
				}, 200);
				resolve();
			});
		});
	};

	const handleOnPressNotify = useCallback(
		async (notify: INotification) => {
			if (!notify?.content?.channel_id) {
				return;
			}
			const store = await getStoreAsync();
			await handleNotification(notify, currentClanId, store, navigation);
		},
		[currentClanId, navigation]
	);

	const closeBottomSheet = () => {
		bottomSheetRef.current?.dismiss();
		bottomSheetOptionsRef.current?.dismiss();
	};

	const handleGoback = () => {
		navigation.goBack();
	};

	return (
		<View style={styles.notifications}>
			<View style={styles.notificationsHeader}>
				{isTabletLandscape && (
					<Pressable onPress={handleGoback}>
						<View style={styles.notificationHeaderIcon}>
							<Icons.ChevronSmallLeftIcon height={20} width={20} color={themeValue.textStrong} />
						</View>
					</Pressable>
				)}
				<Text style={styles.notificationHeaderTitle}>{t('headerTitle')}</Text>
				<Pressable onPress={() => openBottomSheet(ENotifyBsToShow.notification)}>
					<View style={styles.notificationHeaderIcon}>
						<Icons.MoreHorizontalIcon height={20} width={20} color={themeValue.textStrong} />
					</View>
				</Pressable>
			</View>
			{isLoading ? (
				<SkeletonNotification numberSkeleton={8} />
			) : notificationsFilter?.length ? (
				<FlashList
					showsVerticalScrollIndicator={false}
					data={notificationsFilter}
					renderItem={({ item }) => {
						return <NotificationItem notify={item} onLongPressNotify={openBottomSheet} onPressNotify={handleOnPressNotify} />;
					}}
					contentContainerStyle={{
						paddingBottom: size.s_100 * 2
					}}
					estimatedItemSize={200}
					keyExtractor={(item) => `${item.id}_item_noti`}
				/>
			) : (
				<EmptyNotification />
			)}

			<MezonBottomSheet ref={bottomSheetRef} heightFitContent title={t('headerTitle')} titleSize="md">
				<NotificationOption onChangeTab={handleTabChange} selectedTabs={selectedTabs} />
			</MezonBottomSheet>

			<MezonBottomSheet ref={bottomSheetOptionsRef} heightFitContent>
				<NotificationItemOption onDelete={() => handleDeleteNotify(notify)} />
			</MezonBottomSheet>
		</View>
	);
};

export default Notifications;
