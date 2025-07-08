import { usePermissionChecker } from '@mezon/core';
import { useTheme } from '@mezon/mobile-ui';
import { selectAllRolesClan, selectMemberClanByUserId2, useAppSelector } from '@mezon/store-mobile';
import { EPermission, UsersClanEntity } from '@mezon/utils';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import MezonIconCDN from '../../../../../../src/app/componentUI/MezonIconCDN';
import { IconCDN } from '../../../../../../src/app/constants/icon_cdn';
import MezonAvatar from '../../../../componentUI/MezonAvatar';
import { style } from './styles';

interface IUserItem {
	userID: string;
	onMemberSelect?: (member: UsersClanEntity) => void;
}

export function UserItem({ userID, onMemberSelect }: IUserItem) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const user = useAppSelector((state) => selectMemberClanByUserId2(state, userID));
	const rolesClan = useAppSelector(selectAllRolesClan);
	const [isClanOwner] = usePermissionChecker([EPermission.clanOwner]);
	const [isManageClan] = usePermissionChecker([EPermission.manageClan]);
	const canEditRoles = useMemo(() => isClanOwner || isManageClan, [isClanOwner, isManageClan]);

	const clanUserRole = useMemo(() => {
		return (
			rolesClan?.filter((role) => {
				const roleUser = role?.role_user_list?.role_users;
				if (roleUser) {
					return roleUser?.some((user) => user?.id === userID);
				}
				return false;
			}) || []
		);
	}, [userID, rolesClan]);

	const onPressMemberItem = () => {
		canEditRoles && onMemberSelect(user);
	};

	return (
		<Pressable onPress={onPressMemberItem}>
			<View style={styles.container}>
				<MezonAvatar avatarUrl={user?.user?.avatar_url || ''} username={user?.user?.username} />
				<View style={[styles.rightContent]}>
					<View style={styles.content}>
						<Text style={styles.displayName}>{user?.user?.display_name || ''}</Text>
						<Text style={styles.username}>{user?.user?.username || ''}</Text>

						<View style={styles.roleWrapper}>
							{clanUserRole?.length > 0 &&
								clanUserRole.map((role, index) => (
									<View key={'role_' + role.title + index.toString()} style={styles.roleContainer}>
										<View style={styles.roleCircle}></View>
										<Text style={styles.roleTitle}>{role.title}</Text>
									</View>
								))}
						</View>
					</View>
					<View style={styles.icon}>
						<MezonIconCDN icon={IconCDN.chevronSmallRightIcon} color={themeValue.text} height={20} width={20} />
					</View>
				</View>
			</View>
		</Pressable>
	);
}
