import { Metrics } from '@mezon/mobile-ui';
import { appActions, selectStatusStream } from '@mezon/store-mobile';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Keyboard, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import useTabletLandscape from '../../hooks/useTabletLandscape';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import LeftDrawerContent from './homedrawer/DrawerContent';
import HomeDefault from './homedrawer/HomeDefault';
import { StreamingPopup } from './homedrawer/components/StreamingPopup';
import { styles } from './styles';

const Drawer = createDrawerNavigator();

const HomeScreen = React.memo((props: any) => {
	const dispatch = useDispatch();
	const isTabletLandscape = useTabletLandscape();
	const navigation = useNavigation();
	const streamPlay = useSelector(selectStatusStream);

	if (isTabletLandscape) {
		return (
			<View style={styles.container}>
				<View style={styles.containerDrawerContent}>
					<LeftDrawerContent />
				</View>
				<View style={styles.containerHomeDefault}>
					<HomeDefault navigation={navigation} />
				</View>
			</View>
		);
	}

	return (
		<View style={{ flex: 1, position: 'relative' }}>
			{streamPlay && <StreamingPopup />}
			<Drawer.Navigator
				screenOptions={{
					drawerPosition: 'left',
					drawerType: 'slide',
					swipeEdgeWidth: Metrics.screenWidth,
					swipeMinDistance: 5,
					drawerStyle: {
						width: '100%'
					}
				}}
				screenListeners={{
					state: (e) => {
						Keyboard.dismiss();
						if (e.data.state.history?.length > 1) {
							dispatch(appActions.setHiddenBottomTabMobile(false));
						} else {
							dispatch(appActions.setHiddenBottomTabMobile(true));
						}
					}
				}}
				drawerContent={() => <LeftDrawerContent />}
			>
				<Drawer.Screen
					name={APP_SCREEN.HOME_DEFAULT}
					component={HomeDefault}
					options={{
						drawerType: 'slide',
						swipeEdgeWidth: Metrics.screenWidth,
						keyboardDismissMode: 'none',
						swipeMinDistance: 5,
						headerShown: false
					}}
				/>
			</Drawer.Navigator>
		</View>
	);
});

export default HomeScreen;
