import { ActionEmitEvent } from '@mezon/mobile-components';
import { selectDmGroupCurrentId, selectHiddenBottomTabMobile } from '@mezon/store';
import { useDrawerStatus } from '@react-navigation/drawer';
import { DrawerActions, useNavigation, useNavigationState } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, BackHandler, DeviceEventEmitter, View } from 'react-native';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';

function BackNativeListener() {
	const navigation = useNavigation<any>();
	const drawerStatus = useDrawerStatus();
	const isHiddenTab = useSelector(selectHiddenBottomTabMobile);
	const currentDirectId = useSelector(selectDmGroupCurrentId);
	const [isOpenBottomSheetClan, setIsOpenBottomSheetClan] = useState<boolean>(false);

	const routesNavigation = useNavigationState((state) => state?.routes?.[state?.index]);

	const isHomeActive = useMemo(() => {
		if (routesNavigation?.state?.index === 0) {
			return true;
		}
		return routesNavigation?.name === APP_SCREEN.BOTTOM_BAR && !routesNavigation?.state?.index;
	}, [routesNavigation]);

	useEffect(() => {
		const eventOpenBottomSheet = DeviceEventEmitter.addListener(ActionEmitEvent.ON_STATUS_OPEN_BOTTOM_SHEET, ({ isOpen = false }) => {
			setIsOpenBottomSheetClan(isOpen);
		});

		return () => {
			eventOpenBottomSheet.remove();
		};
	}, []);

	useEffect(() => {
		const backAction = () => {
			if (drawerStatus === 'closed') {
				navigation.dispatch(DrawerActions.openDrawer());
				return true;
			} else if (isHomeActive && !isHiddenTab && !currentDirectId) {
				if (isOpenBottomSheetClan) {
					DeviceEventEmitter.emit(ActionEmitEvent.ON_MENU_CLAN_CHANNEL, true);
					return true;
				}
				Alert.alert(
					'Exit App',
					'Are you sure you want to close the app?',
					[
						{
							text: 'Cancel',
							onPress: () => null,
							style: 'cancel'
						},
						{
							text: 'Yes',
							onPress: () => BackHandler.exitApp()
						}
					],
					{ cancelable: false }
				);
				return true;
			} else {
				// empty
			}
			return false;
		};
		const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
		return () => {
			backHandler.remove();
		};
	}, [isHomeActive, drawerStatus, navigation, isHiddenTab, isOpenBottomSheetClan, currentDirectId]);

	return <View />;
}

export default React.memo(BackNativeListener);
