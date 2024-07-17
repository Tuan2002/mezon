import { useFriends } from '@mezon/core';
import { useTheme } from '@mezon/mobile-ui';
import { FriendsEntity } from '@mezon/store-mobile';
import { User } from 'mezon-js';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Text, View } from 'react-native';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { SeparatorWithLine } from '../../../components/Common';
import { EFriendItemAction, FriendItem } from '../../../components/FriendItem';
import { UserInformationBottomSheet } from '../../../components/UserInformationBottomSheet';
import { EAddFriendWays } from '../enum';
import { AddFriendModal } from './components/AddFriendModal';
import { style } from './styles';

export const AddFriendScreen = () => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { friends, acceptFriend, deleteFriend } = useFriends();
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const { t } = useTranslation('friends');
	const [currentAddFriendType, setCurrentAddFriendType] = useState<EAddFriendWays | null>(null);
	const receivedFriendRequestList = useMemo(() => {
		return friends.filter((friend) => friend.state === 2);
	}, [friends]);

	const handleFriendAction = useCallback(
		(friend: FriendsEntity, action: EFriendItemAction) => {
			switch (action) {
				case EFriendItemAction.Delete:
					deleteFriend(friend?.user?.username, friend?.user?.id);
					break;
				case EFriendItemAction.Approve:
					acceptFriend(friend?.user?.username, friend?.user?.id);
					break;
				case EFriendItemAction.ShowInformation:
					setSelectedUser(friend?.user);
					break;
				default:
					break;
			}
		},
		[acceptFriend, deleteFriend],
	);

	const waysToAddFriendList = useMemo(() => {
		return [
			{
				title: t('addFriend.findYourFriend'),
				type: EAddFriendWays.FindFriend,
			},
			{
				title: t('addFriend.addByUserName'),
				type: EAddFriendWays.UserName,
			},
		];
	}, [t]);

	return (
		<View style={styles.addFriendContainer}>
			<View style={styles.groupWrapper}>
				<FlatList
					data={waysToAddFriendList}
					keyExtractor={(item) => item.type.toString()}
					ItemSeparatorComponent={SeparatorWithLine}
					renderItem={({ item }) => (
						<TouchableHighlight onPress={() => setCurrentAddFriendType(item.type)} style={styles.addFriendItem} key={item.type}>
							<Text style={styles.addFriendText}>{item.title}</Text>
						</TouchableHighlight>
					)}
				/>
			</View>
			<Text style={styles.whiteText}>{t('addFriend.incomingFriendRequest')}</Text>
			<View style={styles.groupWrapper}>
				<FlatList
					data={receivedFriendRequestList}
					ItemSeparatorComponent={SeparatorWithLine}
					keyExtractor={(friend) => friend.id.toString()}
					renderItem={({ item }) => <FriendItem friend={item} handleFriendAction={handleFriendAction} />}
				/>
			</View>

			<AddFriendModal type={currentAddFriendType} onClose={() => setCurrentAddFriendType(null)} />
			<UserInformationBottomSheet user={selectedUser} onClose={() => setSelectedUser(null)} />
		</View>
	);
};
