import { useAuth } from '@mezon/core';
import {
	debounce,
	getAppInfo,
	Icons,
	remove,
	STORAGE_CHANNEL_CURRENT_CACHE,
	STORAGE_DATA_CLAN_CHANNEL_CACHE,
	STORAGE_KEY_TEMPORARY_ATTACHMENT,
	STORAGE_KEY_TEMPORARY_INPUT_MESSAGES
} from '@mezon/mobile-components';
import { baseColor, size, useTheme } from '@mezon/mobile-ui';
import { appActions, authActions, channelsActions, clansActions, getAuthState, getStoreAsync, messagesActions } from '@mezon/store-mobile';
import { sleep } from '@mezon/utils';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, View } from 'react-native';
import WebView from 'react-native-webview';
import { useSelector } from 'react-redux';
import MezonMenu, { IMezonMenuItemProps, IMezonMenuSectionProps, reserve } from '../../componentUI/MezonMenu';
import MezonSearch from '../../componentUI/MezonSearch';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import { style } from './styles';

export const Settings = ({ navigation }: { navigation: any }) => {
	const { t, i18n } = useTranslation(['setting']);
	const { themeValue } = useTheme();
	const styles = style(themeValue);

	const [filteredMenu, setFilteredMenu] = useState<IMezonMenuSectionProps[]>([]);
	const [searchText, setSearchText] = useState<string>('');
	const [isShowCancel, setIsShowCancel] = useState<boolean>(false);
	const [linkRedirectLogout, setLinkRedirectLogout] = useState<string>('');
	const authState = useSelector(getAuthState);
	const session = JSON.stringify(authState.session);
	const { userProfile } = useAuth();
	const logout = async () => {
		const store = await getStoreAsync();
		store.dispatch(channelsActions.removeAll());
		store.dispatch(messagesActions.removeAll());
		store.dispatch(clansActions.setCurrentClanId(''));
		store.dispatch(clansActions.removeAll());
		store.dispatch(clansActions.refreshStatus());

		await remove(STORAGE_DATA_CLAN_CHANNEL_CACHE);
		await remove(STORAGE_CHANNEL_CURRENT_CACHE);
		await remove(STORAGE_KEY_TEMPORARY_INPUT_MESSAGES);
		await remove(STORAGE_KEY_TEMPORARY_ATTACHMENT);
		const [appInfo] = await Promise.all([getAppInfo()]);
		const { app_platform: platform } = appInfo;
		store.dispatch(authActions.logOut({ device_id: userProfile.user.username, platform: platform }));
		store.dispatch(appActions.setLoadingMainMobile(false));
		setLinkRedirectLogout('');
	};

	const logoutRedirect = async () => {
		const store = await getStoreAsync();
		store.dispatch(appActions.setLoadingMainMobile(true));
		setLinkRedirectLogout(process.env.NX_CHAT_APP_OAUTH2_LOG_OUT);
	};

	const confirmLogout = () => {
		Alert.alert(
			t('logOut'),
			'Are you sure you want to log out?',
			[
				{
					text: 'Cancel',
					onPress: () => {},
					style: 'cancel'
				},
				{ text: 'Yes', onPress: () => logoutRedirect() }
			],
			{ cancelable: false }
		);
	};

	const AccountMenu = useMemo(
		() =>
			[
				// {
				// 	onPress: () => reserve(),
				// 	expandable: true,
				// 	title: t('accountSettings.getNitro'),
				// 	icon: <Icons.NitroWheelIcon color={themeValue.textStrong} />,
				// },
				{
					onPress: () => {
						navigation.navigate(APP_SCREEN.SETTINGS.STACK, {
							screen: APP_SCREEN.SETTINGS.ACCOUNT
						});
					},
					expandable: true,
					title: t('accountSettings.account'),
					icon: <Icons.UserCircleIcon color={themeValue.textStrong} width={size.s_24} height={size.s_24} />
				},
				// {
				// 	onPress: () => reserve(),
				// 	expandable: true,
				// 	title: t('accountSettings.privacySafety'),
				// 	icon: <Icons.ShieldIcon color={themeValue.textStrong} />,
				// },
				// {
				// 	onPress: () => reserve(),
				// 	expandable: true,
				// 	title: t('accountSettings.familyCenter'),
				// 	icon: <Icons.GroupIcon color={themeValue.textStrong} />,
				// },
				// {
				// 	onPress: () => reserve(),
				// 	expandable: true,
				// 	title: t('accountSettings.authorizedApp'),
				// 	icon: <Icons.KeyIcon color={themeValue.textStrong} />,
				// },
				// {
				// 	onPress: () => reserve(),
				// 	expandable: true,
				// 	title: t('accountSettings.device'),
				// 	icon: <Icons.LaptopPhoneIcon color={themeValue.textStrong} />,
				// },
				// {
				// 	onPress: () => reserve(),
				// 	expandable: true,
				// 	title: t('accountSettings.connection'),
				// 	icon: <Icons.PuzzlePieceIcon color={themeValue.textStrong} />,
				// },
				// {
				// 	onPress: () => reserve(),
				// 	expandable: true,
				// 	title: t('accountSettings.clip'),
				// 	icon: <Icons.ClipIcon color={themeValue.textStrong} />,
				// },
				{
					onPress: () => {
						navigation.navigate(APP_SCREEN.FRIENDS.STACK, {
							screen: APP_SCREEN.FRIENDS.REQUEST_FRIEND
						});
					},
					expandable: true,
					title: t('accountSettings.friendRequests'),
					icon: <Icons.FriendIcon color={themeValue.textStrong} width={size.s_24} height={size.s_24} />
				},
				{
					onPress: () => {
						navigation.navigate(APP_SCREEN.SETTINGS.STACK, {
							screen: APP_SCREEN.SETTINGS.MY_QR_CODE
						});
					},
					expandable: true,
					title: t('accountSettings.MyQRCode'),
					icon: <Icons.MyQRCodeIcon color={themeValue.textStrong} width={size.s_24} height={size.s_24} />
				},
				{
					onPress: () => {
						navigation.navigate(APP_SCREEN.SETTINGS.STACK, {
							screen: APP_SCREEN.SETTINGS.QR_SCANNER
						});
					},
					expandable: true,
					title: t('accountSettings.QRScan'),
					icon: <Icons.QRCodeCameraIcon color={themeValue.textStrong} width={size.s_24} height={size.s_24} />
				}
			] satisfies IMezonMenuItemProps[],
		[navigation, t, themeValue.textStrong, i18n.language]
	);

	const PaymentMenu = useMemo(
		() =>
			[
				{
					onPress: () => reserve(),
					expandable: true,
					title: t('paymentSettings.serverBoost'),
					icon: <Icons.BoostTier2Icon color={themeValue.textStrong} width={size.s_24} height={size.s_24} />
				},
				{
					onPress: () => reserve(),
					expandable: true,
					title: t('paymentSettings.nitroGift'),
					icon: <Icons.GiftIcon color={themeValue.textStrong} width={size.s_24} height={size.s_24} />
				},
				{
					onPress: () => reserve(),
					expandable: true,
					title: t('paymentSettings.restoreSubscription'),
					icon: <Icons.NitroWheelIcon color={themeValue.textStrong} width={size.s_24} height={size.s_24} />
				}
			] satisfies IMezonMenuItemProps[],
		[themeValue.textStrong]
	);

	const AppMenu = useMemo(
		() =>
			[
				// {
				// 	onPress: () => reserve(),
				// 	expandable: true,
				// 	title: t('appSettings.voice'),
				// 	icon: <Icons.MicrophoneIcon color={themeValue.textStrong} />,
				// },
				{
					onPress: () => {
						navigation.navigate(APP_SCREEN.SETTINGS.STACK, {
							screen: APP_SCREEN.SETTINGS.APPEARANCE
						});
					},
					expandable: true,
					title: t('appSettings.appearance'),
					icon: <Icons.PaintPaletteIcon color={themeValue.textStrong} width={size.s_24} height={size.s_24} />
				},
				// {
				// 	onPress: () => reserve(),
				// 	expandable: true,
				// 	title: t('appSettings.accessibility'),
				// 	icon: <Icons.AccessibilityIcon color={themeValue.textStrong} />,
				// },
				{
					onPress: () => {
						navigation.navigate(APP_SCREEN.SETTINGS.STACK, {
							screen: APP_SCREEN.SETTINGS.LANGUAGE
						});
					},
					title: t('appSettings.language'),
					expandable: true,
					previewValue: i18n.language,
					icon: <Icons.LanguageIcon color={themeValue.textStrong} width={size.s_24} height={size.s_24} />
				}
				// {
				// 	onPress: () => reserve(),
				// 	expandable: true,
				// 	title: t('appSettings.chat'),
				// 	icon: <Icons.ImageTextIcon color={themeValue.textStrong} />,
				// },
				// {
				// 	onPress: () => reserve(),
				// 	expandable: true,
				// 	title: t('appSettings.webBrowser'),
				// 	icon: <Icons.GlobeEarthIcon color={themeValue.textStrong} />,
				// },
				// {
				// 	onPress: () => reserve(),
				// 	expandable: true,
				// 	title: t('appSettings.notifications'),
				// 	icon: <Icons.BellIcon color={themeValue.textStrong} />,
				// },
				// {
				// 	onPress: () => reserve(),
				// 	expandable: true,
				// 	title: t('appSettings.appIcon'),
				// 	icon: <Icons.BrandMezonIcon color={themeValue.textStrong} />,
				// },
				// {
				// 	onPress: () => reserve(),
				// 	expandable: true,
				// 	title: t('appSettings.advanced'),
				// 	icon: <Icons.SettingsIcon color={themeValue.textStrong} />,
				// },
			] satisfies IMezonMenuItemProps[],
		[themeValue.textStrong, i18n.language]
	);

	const SupportMenu = useMemo(
		() =>
			[
				{
					onPress: () => reserve(),
					expandable: true,
					title: t('supportSettings.support'),
					icon: <Icons.CircleQuestionIcon color={themeValue.textStrong} width={size.s_24} height={size.s_24} />
				},
				{
					onPress: () => reserve(),
					expandable: true,
					title: t('supportSettings.uploadLog'),
					icon: <Icons.CircleInformationIcon color={themeValue.textStrong} width={size.s_24} height={size.s_24} />
				},
				{
					onPress: () => reserve(),
					expandable: true,
					title: t('supportSettings.acknowledgement'),
					icon: <Icons.CircleInformationIcon color={themeValue.textStrong} width={size.s_24} height={size.s_24} />
				}
			] satisfies IMezonMenuItemProps[],
		[themeValue.textStrong]
	);

	const WhatsNew = useMemo(
		() =>
			[
				{
					onPress: () => reserve(),
					expandable: true,
					title: t('whatsNew.whatsNew'),
					icon: <Icons.CircleInformationIcon color={themeValue.textStrong} width={size.s_24} height={size.s_24} />
				}
			] satisfies IMezonMenuItemProps[],
		[themeValue.textStrong]
	);

	const LogOut = useMemo(
		() =>
			[
				{
					onPress: () => confirmLogout(),
					title: t('logOut'),
					textStyle: { color: baseColor.redStrong },
					icon: <Icons.DoorExitIcon color={baseColor.redStrong} width={size.s_24} height={size.s_24} />
				}
			] satisfies IMezonMenuItemProps[],
		[i18n.language]
	);

	const menu: IMezonMenuSectionProps[] = [
		{
			title: t('accountSettings.title'),
			items: AccountMenu
		},
		// {
		// 	title: t('paymentSettings.title'),
		// 	items: PaymentMenu,
		// },
		{
			title: t('appSettings.title'),
			items: AppMenu
		},
		// {
		// 	title: t('supportSettings.title'),
		// 	items: SupportMenu,
		// },
		// {
		// 	title: t('whatsNew.title'),
		// 	items: WhatsNew,
		// },
		{
			items: LogOut
		}
	];

	const renderedMenu = useMemo(() => {
		if (searchText.trim() === '') {
			return menu;
		}
		return filteredMenu;
	}, [filteredMenu, themeValue.textStrong, i18n.language]);

	const debouncedHandleSearchChange = useCallback(
		debounce((text) => {
			const results: IMezonMenuItemProps[] = [];
			menu.forEach((section) => {
				if (section.title) {
					const matchedItems = section.items.filter((item) => item.title.toLowerCase().includes(text.toLowerCase()));
					results.push(...matchedItems);
				}
			});

			setFilteredMenu([
				{
					title: '',
					items: results
				}
			]);
		}, 300),
		[]
	);

	const handleSearchChange = (text: string) => {
		setSearchText(text);
		debouncedHandleSearchChange(text);
	};

	const handleSearchFocus = useCallback(() => {
		setIsShowCancel(true);
	}, []);

	const handleCancelButton = useCallback(() => {
		setIsShowCancel(false);
	}, []);

	const injectedJS = `
    (function() {
	const authData = {
		"loadingStatus":JSON.stringify("loaded"),
		"session": JSON.stringify(${session}),
		"isLogin": "true",
		"_persist": JSON.stringify({"version":-1,"rehydrated":true})
	};
    localStorage.setItem('persist:auth', JSON.stringify(authData));
    })();
	true;
	true;
  `;

	return (
		<View style={styles.settingContainer}>
			{!!linkRedirectLogout && (
				<WebView
					source={{
						uri: linkRedirectLogout
					}}
					originWhitelist={['*']}
					style={{ flex: 1, width: '100%', height: 500, zIndex: 11 }}
					injectedJavaScriptBeforeContentLoaded={injectedJS}
					javaScriptEnabled={true}
					nestedScrollEnabled={true}
					onLoadEnd={async () => {
						await sleep(1000);
						await logout();
					}}
				/>
			)}
			<ScrollView contentContainerStyle={styles.settingScroll} keyboardShouldPersistTaps={'handled'}>
				<MezonSearch
					value={searchText}
					isShowCancel={isShowCancel}
					onChangeText={handleSearchChange}
					onFocusText={handleSearchFocus}
					onCancelButton={handleCancelButton}
				/>

				<MezonMenu menu={renderedMenu} />
			</ScrollView>
		</View>
	);
};
