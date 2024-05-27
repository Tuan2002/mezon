import React from 'react';
import {
	createStackNavigator,
} from '@react-navigation/stack';

import { APP_SCREEN } from "../../ScreenTypes";
import { Colors, size } from '@mezon/mobile-ui';
import { AddFriendScreen } from '../../../screens/friend/AddFriend';
import { RequestFriendScreen } from '../../../screens/friend/RequestFriend';
import { SettingFriendRequestScreen } from '../../../screens/friend/SettingFriendRequest';
import { FriendScreen } from '../../../screens/friend';
import { Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SettingIcon } from '@mezon/mobile-components';

const AddFriendButton = ({ navigation }: { navigation: any }) => {
	const { t } = useTranslation(['screen']);
	return (
		<Pressable
			onPress={() => navigation.navigate(APP_SCREEN.FRIENDS.STACK, { screen: APP_SCREEN.FRIENDS.ADD_FRIEND })}
			style={{marginRight: size.s_18}}
		>
			<Text style={{color: Colors.textViolet}}>{t('headerRight.addFriends')}</Text>
		</Pressable>
	)
}

const SettingFriendRequestButton = ({ navigation }: { navigation: any }) => {
	const { t } = useTranslation(['screen']);
	return (
		<Pressable
			onPress={() => navigation.navigate(APP_SCREEN.FRIENDS.STACK, { screen: APP_SCREEN.FRIENDS.REQUEST_FRIEND_SETTING })}
			style={{marginRight: size.s_18}}
		>
			<SettingIcon height={20} width={20} />
		</Pressable>
	)
}

// eslint-disable-next-line no-empty-pattern
export const FriendStacks = ({ navigation }: { navigation: any }) => {
	const Stack = createStackNavigator();
	const { t } = useTranslation(['screen']);
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: true,
				headerShadowVisible: false,
				gestureEnabled: true,
				gestureDirection: 'horizontal'
			}}>
			<Stack.Screen
                name={APP_SCREEN.FRIENDS.HOME}
                component={FriendScreen}
                options={{
                    headerTitle: t('headerTitle.Friends'),
                    headerTitleAlign: "center",
                    headerTintColor: Colors.white,
                    headerStyle: {
                        backgroundColor: Colors.secondary
                    },
					headerRight: () => <AddFriendButton navigation={navigation} />
                }}
            />
			<Stack.Screen
                name={APP_SCREEN.FRIENDS.ADD_FRIEND}
                component={AddFriendScreen}
                options={{
                    headerTitle: t('headerTitle.addFriends'),
                    headerTitleAlign: "center",
                    headerTintColor: Colors.white,
                    headerStyle: {
                        backgroundColor: Colors.secondary
                    }
                }}
            />
			<Stack.Screen
                name={APP_SCREEN.FRIENDS.REQUEST_FRIEND}
                component={RequestFriendScreen}
                options={{
                    headerTitle: t('headerTitle.requestFriend'),
                    headerTitleAlign: "center",
                    headerTintColor: Colors.white,
                    headerStyle: {
                        backgroundColor: Colors.secondary
                    },
					headerRight: () => <SettingFriendRequestButton navigation={navigation} />
                }}
            />
			<Stack.Screen
                name={APP_SCREEN.FRIENDS.REQUEST_FRIEND_SETTING}
                component={SettingFriendRequestScreen}
                options={{
                    headerTitle: t('headerTitle.friendRequestSettings'),
                    headerTitleAlign: "center",
                    headerTintColor: Colors.white,
                    headerStyle: {
                        backgroundColor: Colors.secondary
                    }
                }}
            />
		</Stack.Navigator>
	);
};
