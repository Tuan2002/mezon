import {
	MezonStoreProvider,
	accountActions,
	appActions,
	authActions,
	channelsActions,
	clansActions,
	emojiSuggestionActions,
	friendsActions,
	getStoreAsync,
	initStore,
	messagesActions,
	notificationActions,
	selectCurrentChannelId,
	selectCurrentClanId,
	selectHasInternetMobile,
	selectIsFromFCMMobile,
	selectIsLogin,
} from '@mezon/store-mobile';
import { useMezon } from '@mezon/transport';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Authentication } from './Authentication';
import { APP_SCREEN } from './ScreenTypes';
import { UnAuthentication } from './UnAuthentication';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ChatContextProvider } from '@mezon/core';
import { IWithError } from '@mezon/utils';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ThemeModeBase, useTheme } from '@mezon/mobile-ui';
import { AppState, DeviceEventEmitter, StatusBar } from 'react-native';
import NetInfoComp from '../components/NetworkInfo';
// import SplashScreen from '../components/SplashScreen';
import {
	ActionEmitEvent,
	STORAGE_CHANNEL_CURRENT_CACHE,
	STORAGE_CLAN_ID,
	STORAGE_IS_DISABLE_LOAD_BACKGROUND,
	STORAGE_KEY_TEMPORARY_ATTACHMENT,
	load,
	remove,
	save,
	setCurrentClanLoader,
	setDefaultChannelLoader,
} from '@mezon/mobile-components';
import { gifsActions } from '@mezon/store-mobile';
import notifee from '@notifee/react-native';
import * as SplashScreen from 'expo-splash-screen';
import { delay } from 'lodash';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../configs/toastConfig';

const RootStack = createStackNavigator();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
const NavigationMain = () => {
	const isLoggedIn = useSelector(selectIsLogin);
	const hasInternet = useSelector(selectHasInternetMobile);
	const dispatch = useDispatch();
	const timerRef = useRef<any>();
	const currentClanId = useSelector(selectCurrentClanId);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const isFromFcmMobile = useSelector(selectIsFromFCMMobile);

	useEffect(() => {
		let timer;
		if (isLoggedIn) {
			// dispatch(appActions.setLoadingMainMobile(true));
			timer = delay(initAppLoading, 800);
		}

		return () => {
			timer && clearTimeout(timer);
			timerRef?.current && clearTimeout(timerRef.current);
		};
	}, [isLoggedIn]);

	useEffect(() => {
		const timer = setTimeout(async () => {
			await SplashScreen.hideAsync();
			await notifee.cancelAllNotifications();
			await remove(STORAGE_CHANNEL_CURRENT_CACHE);
			await remove(STORAGE_KEY_TEMPORARY_ATTACHMENT);
		}, 200);

		return () => {
			clearTimeout(timer);
		};
	}, []);

	useEffect(() => {
		let timeout: string | number | NodeJS.Timeout;
		const appStateSubscription = AppState.addEventListener('change', (state) => {
			if (isLoggedIn) timeout = delay(handleAppStateChange, 200, state);
		});
		return () => {
			appStateSubscription.remove();
			timeout && clearTimeout(timeout);
		};
	}, [currentChannelId, isFromFcmMobile, isLoggedIn]);

	useEffect(() => {
		const appStateSubscription = AppState.addEventListener('change', async (state) => {
			if (state === 'active') {
				await notifee.cancelAllNotifications();
			}
			if (state === 'background') {
				save(STORAGE_IS_DISABLE_LOAD_BACKGROUND, 'false');
				dispatch(appActions.setIsFromFCMMobile(false));
			}
		});
		return () => {
			appStateSubscription.remove();
		};
	}, []);

	useEffect(() => {
		if (isLoggedIn && hasInternet) {
			authLoader();
		}
	}, [isLoggedIn, hasInternet]);

	useEffect(() => {
		if (currentClanId) {
			switchClanLoader();
		}
	}, [currentClanId]);

	const initAppLoading = async () => {
		const isFromFCM = await load(STORAGE_IS_DISABLE_LOAD_BACKGROUND);
		await mainLoader({ isFromFCM: isFromFCM?.toString() === 'true' });
	};

	const handleAppStateChange = async (state: string) => {
		const isFromFCM = await load(STORAGE_IS_DISABLE_LOAD_BACKGROUND);
		if (state === 'active') {
			DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: false });
			if (isFromFCM?.toString() === 'true' || isFromFcmMobile) {
				DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: true });
			} else {
				await messageLoaderBackground();
			}
		}
	};

	const messageLoaderBackground = async () => {
		try {
			if (!currentChannelId) {
				return null;
			}
			const store = await getStoreAsync();
			dispatch(appActions.setLoadingMainMobile(false));
			await store.dispatch(
				messagesActions.jumpToMessage({ messageId: '', channelId: currentChannelId, noCache: true, isFetchingLatestMessages: true }),
			);
			DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: true });
			return null;
		} catch (error) {
			alert('error messageLoaderBackground' + error.message);
			DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: true });
			console.log('error messageLoaderBackground', error);
		}
	};

	const switchClanLoader = async () => {
		const promises = [];
		const store = await getStoreAsync();
		promises.push(store.dispatch(emojiSuggestionActions.fetchEmoji({ clanId: currentClanId || '0', noCache: true })));
		promises.push(store.dispatch(notificationActions.fetchListNotification(currentClanId)));
		await Promise.all(promises);
	};
	const authLoader = async () => {
		const store = await getStoreAsync();
		try {
			const response = await store.dispatch(authActions.refreshSession());
			if ((response as unknown as IWithError).error) {
				console.log('Session expired');
				return;
			}

			const profileResponse = await store.dispatch(accountActions.getUserProfile());

			if ((profileResponse as unknown as IWithError).error) {
				console.log('Session expired');
				return;
			}
		} catch (error) {
			console.log('Tom log  => error authLoader', error);
		}
	};

	const mainLoader = async ({ isFromFCM = false }) => {
		try {
			const store = await getStoreAsync();
			const promises = [];

			// Fetch messages if currentChannelId is available
			if (currentChannelId) {
				promises.push(
					store.dispatch(messagesActions.fetchMessages({ channelId: currentChannelId, noCache: true, isFetchingLatestMessages: true })),
				);
			}

			// If not from FCM, join current clan and fetch channels
			if (!isFromFCM) {
				promises.push(store.dispatch(clansActions.fetchClans()));

				if (currentClanId) {
					save(STORAGE_CLAN_ID, currentClanId);
					promises.push(store.dispatch(clansActions.joinClan({ clanId: currentClanId })));
					promises.push(store.dispatch(clansActions.changeCurrentClan({ clanId: currentClanId, noCache: true })));
					promises.push(store.dispatch(channelsActions.fetchChannels({ clanId: currentClanId, noCache: true })));
				}
			}

			// Additional API calls
			promises.push(store.dispatch(friendsActions.fetchListFriends({})));
			promises.push(store.dispatch(gifsActions.fetchGifCategories()));
			promises.push(store.dispatch(gifsActions.fetchGifCategoryFeatured()));
			promises.push(store.dispatch(clansActions.joinClan({ clanId: '0' })));

			// Execute all promises concurrently
			const results = await Promise.all(promises);

			// Handle results if necessary
			if (!isFromFCM) {
				const respChannel = results.find((result) => result.type === 'channels/fetchChannels/fulfilled');
				if (respChannel && currentClanId) {
					await setDefaultChannelLoader(respChannel.payload, currentClanId);
				} else {
					const clanResp = results.find((result) => result.type === 'clans/fetchClans/fulfilled');

					if (clanResp && !currentClanId) {
						await setCurrentClanLoader(clanResp.payload);
					}
				}
			}

			dispatch(appActions.setLoadingMainMobile(false));
			return null;
		} catch (error) {
			console.log('error mainLoader', error);
			dispatch(appActions.setLoadingMainMobile(false));
		}
	};

	return (
		<NavigationContainer>
			<NetInfoComp />
			<RootStack.Navigator screenOptions={{ headerShown: false }}>
				{isLoggedIn ? (
					<RootStack.Group
						screenOptions={{
							gestureEnabled: false,
						}}
					>
						<RootStack.Screen name={APP_SCREEN.AUTHORIZE} component={Authentication} />
					</RootStack.Group>
				) : (
					<RootStack.Group
						screenOptions={{
							animationTypeForReplace: 'pop',
							gestureEnabled: false,
						}}
					>
						<RootStack.Screen name={APP_SCREEN.UN_AUTHORIZE} component={UnAuthentication} />
					</RootStack.Group>
				)}
			</RootStack.Navigator>
			{/*{isLoadingSplashScreen && <SplashScreen />}*/}
		</NavigationContainer>
	);
};

const CustomStatusBar = () => {
	const { themeValue, themeBasic } = useTheme();
	// eslint-disable-next-line eqeqeq
	return (
		<StatusBar animated backgroundColor={themeValue.secondary} barStyle={themeBasic == ThemeModeBase.DARK ? 'light-content' : 'dark-content'} />
	);
};

const RootNavigation = () => {
	const mezon = useMezon();
	const { store, persistor } = useMemo(() => {
		if (!mezon) {
			return { store: null, persistor: null };
		}
		return initStore(mezon, undefined);
	}, [mezon]);

	return (
		<MezonStoreProvider store={store} loading={null} persistor={persistor}>
			<CustomStatusBar />
			<ChatContextProvider>
				<NavigationMain />
			</ChatContextProvider>
			<Toast config={toastConfig} />
		</MezonStoreProvider>
	);
};

export default RootNavigation;
