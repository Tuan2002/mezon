import { HomeTab, MessageTab, NotiTab, ProfileTab } from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import { selectHiddenBottomTabMobile } from '@mezon/store-mobile';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Animated } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { useSelector } from 'react-redux';
import useTabletLandscape from '../../hooks/useTabletLandscape';
import Notifications from '../../screens/Notifications';
import HomeScreen from '../../screens/home/HomeScreen';
import MessagesScreen from '../../screens/messages/MessagesScreen';
import MessagesScreenTablet from '../../screens/messages/MessagesScreenTablet';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import { APP_SCREEN } from '../ScreenTypes';

const TabStack = createBottomTabNavigator();

const BottomNavigator = memo(({ isLastActiveTabDm = false }: { isLastActiveTabDm: boolean }) => {
	const isTabletLandscape = useTabletLandscape();
	const isHiddenBottomTab = useSelector(selectHiddenBottomTabMobile);
	const isHiddenTab = useMemo(() => {
		return isHiddenBottomTab || isTabletLandscape;
	}, [isHiddenBottomTab, isTabletLandscape]);
	const { themeValue } = useTheme();
	const tabBarTranslateY = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		BootSplash.hide({ fade: true });
	}, []);

	useEffect(() => {
		Animated.timing(tabBarTranslateY, {
			toValue: isHiddenTab ? 80 : 0,
			duration: 150,
			useNativeDriver: true
		}).start();
	}, [isHiddenTab, tabBarTranslateY]);

	const AnimatedIcon = ({ color, Icon, focused }) => {
		const scaleValue = useRef(new Animated.Value(1)).current;
		const opacityValue = useRef(new Animated.Value(1)).current;

		useEffect(() => {
			if (focused) {
				// Scale up and bounce effect
				Animated.sequence([
					Animated.timing(scaleValue, {
						toValue: 1.15,
						duration: 100,
						useNativeDriver: true
					}),
					Animated.spring(scaleValue, {
						toValue: 1,
						friction: 3,
						tension: 40,
						useNativeDriver: true
					})
				]).start();

				// Fade effect
				Animated.sequence([
					Animated.timing(opacityValue, {
						toValue: 0.7,
						duration: 100,
						useNativeDriver: true
					}),
					Animated.timing(opacityValue, {
						toValue: 1,
						duration: 200,
						useNativeDriver: true
					})
				]).start();
			}
		}, [focused, scaleValue, opacityValue]);

		return (
			<Animated.View
				style={{
					transform: [{ scale: scaleValue }],
					opacity: opacityValue
				}}
			>
				<Icon color={color} width={size.s_22} height={size.s_22} />
			</Animated.View>
		);
	};
	return (
		<TabStack.Navigator
			screenOptions={{
				tabBarHideOnKeyboard: true,
				tabBarStyle: {
					position: 'absolute',
					zIndex: isHiddenTab ? -1 : 100,
					height: size.s_80,
					paddingHorizontal: 0,
					transform: [{ translateY: tabBarTranslateY }],
					paddingBottom: size.s_20,
					borderTopWidth: 1,
					elevation: 0,
					backgroundColor: themeValue.secondary,
					borderTopColor: themeValue.border
				},
				tabBarActiveTintColor: themeValue.textStrong,
				tabBarInactiveTintColor: themeValue.textDisabled
			}}
			initialRouteName={isLastActiveTabDm ? APP_SCREEN.MESSAGES.HOME : APP_SCREEN.HOME}
		>
			<TabStack.Screen
				name={APP_SCREEN.HOME}
				component={HomeScreen}
				options={{
					headerShown: false,
					title: 'Clans',
					tabBarLabelStyle: { fontWeight: '600', top: -size.s_2 },
					tabBarIcon: ({ color, focused }) => <AnimatedIcon Icon={HomeTab} color={color} focused={focused} />
				}}
			/>
			<TabStack.Screen
				name={APP_SCREEN.MESSAGES.HOME}
				component={isTabletLandscape ? MessagesScreenTablet : MessagesScreen}
				options={{
					headerShown: false,
					title: 'Messages',
					tabBarLabelStyle: { fontWeight: '600', top: -size.s_2 },
					tabBarIcon: ({ color, focused }) => <AnimatedIcon Icon={MessageTab} color={color} focused={focused} />
				}}
			/>
			<TabStack.Screen
				name={APP_SCREEN.NOTIFICATION.HOME}
				component={Notifications}
				options={{
					headerShown: false,
					title: 'Notifications',
					tabBarLabelStyle: { fontWeight: '600', top: -size.s_2 },
					tabBarIcon: ({ color, focused }) => <AnimatedIcon Icon={NotiTab} color={color} focused={focused} />
				}}
			/>
			<TabStack.Screen
				name={APP_SCREEN.PROFILE.HOME}
				component={ProfileScreen}
				options={{
					headerShown: false,
					title: 'Profile',
					tabBarLabelStyle: { fontWeight: '600', top: -size.s_2 },
					tabBarIcon: ({ color, focused }) => <AnimatedIcon Icon={ProfileTab} color={color} focused={focused} />
				}}
			/>
		</TabStack.Navigator>
	);
});

export default BottomNavigator;
