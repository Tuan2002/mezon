import { useMemberStatus } from '@mezon/core';
import { useTheme } from '@mezon/mobile-ui';
import { EventManagementEntity, selectMemberClanByUserId } from '@mezon/store-mobile';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import MezonAvatar from '../../../componentUI/MezonAvatar';
import { style } from './styles';

interface IEventMemberProps {
	event: EventManagementEntity;
}

const Avatar = ({ id, index }: { id: string; index: number }) => {
	const user = useSelector(selectMemberClanByUserId(id || ''));
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const userStatus = useMemberStatus(id || '');

	return (
		<View style={styles.item}>
			<MezonAvatar
				key={index.toString()}
				height={40}
				width={40}
				avatarUrl={user?.user?.avatar_url}
				username={user?.user?.username}
				userStatus={userStatus}
			/>
			<Text style={styles.text}>{user?.user?.display_name}</Text>
		</View>
	);
};

export function EventMember({ event }: IEventMemberProps) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	return <View style={styles.container}>{event?.user_ids?.map((uid, index) => <Avatar id={uid} index={index} />)}</View>;
}
