import { useColorsRoleById, useTheme } from '@mezon/mobile-ui';
import { selectMemberClanByUserId } from '@mezon/store-mobile';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { MezonAvatar } from '../../../componentUI';
import { useMessageParser } from '../../../hooks/useMessageParser';
import { ENotifyBsToShow, NotifyProps } from '../types';
import { style } from './NotificationIndividualItem.styles';

function NotificationIndividualItem({ notify, onLongPressNotify, onPressNotify }: NotifyProps) {
	const user = useSelector(selectMemberClanByUserId(notify.sender_id ?? ''));
	const username = notify?.content?.username || user?.user?.display_name || user?.user?.username;
	const { messageTimeDifference } = useMessageParser(notify?.content);
	const colorsUsername = useColorsRoleById(notify?.sender_id)?.highestPermissionRoleColor;
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	let notice = notify?.subject;

	if (username) {
		const usernameLength = username?.length;
		notice = notify?.subject?.includes(username) ? notify?.subject?.slice(usernameLength) : notify?.subject;
	}
	return (
		<TouchableOpacity
			onPress={() => {
				onPressNotify(notify);
			}}
			onLongPress={() => {
				onLongPressNotify(ENotifyBsToShow.removeNotification, notify);
			}}
		>
			<View style={styles.notifyContainer}>
				<View style={styles.notifyHeader}>
					<MezonAvatar
						avatarUrl={user?.user?.avatar_url || ''}
						username={user?.user?.display_name || notify?.content?.username || ''}
					></MezonAvatar>
					<View style={styles.notifyContent}>
						<Text numberOfLines={2} style={styles.notifyHeaderTitle}>
							<Text numberOfLines={2} style={{ ...styles.notifyUserName, color: colorsUsername }}>
								{username}
							</Text>{' '}
							{notice}
						</Text>
					</View>
					<Text style={styles.notifyDuration}>{messageTimeDifference}</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
}

export default NotificationIndividualItem;
