import { useAuth, useDirect, useMemberCustomStatus, useMemberStatus } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { Block, Colors, useTheme } from '@mezon/mobile-ui';
import { selectAllRolesClan, selectCurrentChannel, selectCurrentClan, selectDirectsOpenlist, selectMemberByUserId } from '@mezon/store-mobile';
import { IMessageWithUser } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useMixImageColor } from '../../../../../../app/hooks/useMixImageColor';
import { APP_SCREEN } from '../../../../../../app/navigation/ScreenTypes';
import MezonAvatar from '../../../../../../app/temp-ui/MezonAvatar';
import { style } from './UserProfile.styles';
import UserSettingProfile from './component/UserSettingProfile';

interface userProfileProps {
	userId?: string;
	user?: any;
	message?: IMessageWithUser;
	checkAnonymous?: boolean;
	onClose?: () => void;
	showAction?: boolean;
}

const UserProfile = React.memo(({ userId, user, onClose, checkAnonymous, message, showAction = true }: userProfileProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { userProfile } = useAuth();
	const { t } = useTranslation(['userProfile']);
	const userById = useSelector(selectMemberByUserId(userId || user?.id || ''));

	const userStatus = useMemberStatus(userId || user?.id);
	const RolesClan = useSelector(selectAllRolesClan);
	const { color } = useMixImageColor(user?.avatarSm || userProfile?.user?.avatar_url);
	const navigation = useNavigation<any>();
	const { createDirectMessageWithUser } = useDirect();
	const listDM = useSelector(selectDirectsOpenlist);
	const currentClan = useSelector(selectCurrentClan);
	const currentChannel = useSelector(selectCurrentChannel);
	const userCustomStatus = useMemberCustomStatus(userId || user?.id || '');

	const isClanOwner = useMemo(() => {
		return currentClan?.creator_id === userProfile?.user?.id
	}, [currentClan?.creator_id, userProfile?.user?.id])
	const userRolesClan = useMemo(() => {
		return userById?.role_id ? RolesClan?.filter?.((role) => userById?.role_id?.includes(role.id)) : [];
	}, [userById?.role_id, RolesClan]);

	const checkOwner = (userId: string) => {
		return userId === userProfile?.user?.google_id;
	};

	const directMessageWithUser = useCallback(
		async (userId: string) => {
			const directMessage = listDM.find((dm) => dm?.user_id?.length === 1 && dm?.user_id[0] === userId);
			if (directMessage?.id) {
				navigation.navigate(APP_SCREEN.MESSAGES.STACK, {
					screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL,
					params: { directMessageId: directMessage?.id },
				});
				return;
			}
			const response = await createDirectMessageWithUser(userId);
			if (response?.channel_id) {
				navigation.navigate(APP_SCREEN.MESSAGES.STACK, {
					screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL,
					params: { directMessageId: response?.channel_id },
				});
			}
		},
		[createDirectMessageWithUser, listDM, navigation],
	);

	const navigateToMessageDetail = () => {
		if (onClose && typeof onClose === 'function') {
			onClose();
		}
		directMessageWithUser(userId || user?.id);
	};

	return (
		<View style={[styles.wrapper]}>
			<View style={[
				styles.backdrop,
				{ backgroundColor: user?.avatar_url || user?.avatarSm ? color : Colors.titleReset }
			]}>
				<View style={[styles.userAvatar]}>
					<MezonAvatar
						width={80}
						height={80}
						avatarUrl={user?.avatar_url || user?.avatarSm}
						username={user?.display_name}
						userStatus={userStatus}
						isBorderBoxImage={true}
					/>
				</View>
			</View>
			<View style={[styles.container]}>
				<View style={[styles.userInfo]}>
					<Text style={[styles.userName]}>
						{user?.username || (checkAnonymous ? 'Anonymous' : message?.username)}
					</Text>
					<Text style={[styles.subUserName]}>
						{user?.username || (checkAnonymous ? 'Anonymous' : message?.username)}
					</Text>
					{userCustomStatus ? <Text style={styles.customStatusText}>{userCustomStatus}</Text> : null}
					{!checkOwner(userById?.user?.google_id || '') && (
						<View style={[styles.userAction]}>
							<TouchableOpacity onPress={() => navigateToMessageDetail()} style={[styles.actionItem]}>
								<Icons.ChatIcon color={themeValue.text} />
								<Text style={[styles.actionText]}>{t('userAction.sendMessage')}</Text>
							</TouchableOpacity>
							<View style={[styles.actionItem]}>
								<Icons.PhoneCallIcon color={themeValue.text} />
								<Text style={[styles.actionText]}>{t('userAction.voiceCall')}</Text>
							</View>
							<View style={[styles.actionItem]}>
								<Icons.VideoIcon color={themeValue.text} />
								<Text style={[styles.actionText]}>{t('userAction.videoCall')}</Text>
							</View>
						</View>
					)}
				</View>
				{showAction && userById ? (
					<View style={[styles.userInfo]}>
						{userById?.user?.about_me && (
							<View>
								<Text style={[styles.aboutMe]}>{t('aboutMe.headerTitle')}</Text>
								<Text style={[styles.aboutMeText]}>{userById?.user?.about_me}</Text>
							</View>
						)}
						{userRolesClan?.length ? (
							<View>
								<Text style={[styles.title]}>{t('aboutMe.roles.headerTitle')}</Text>
								<View style={[styles.roles]}>
									{userRolesClan?.map((role, index) => (
										<View style={[styles.roleItem]} key={`${role.id}_${index}`}>
											<Block width={15} height={15} borderRadius={50} backgroundColor={Colors.bgToggleOnBtn}></Block>
											<Text style={[styles.textRole]}>{role?.title}</Text>
										</View>
									))}
								</View>
							</View>
						) : null}
						<UserSettingProfile
							userProfile={userProfile}
							currentChannel={currentChannel}
							user={userById || (user as any)}
							clan={currentClan}
							isClanOwner={isClanOwner}
						/>
					</View>
				) : null}
			</View>
		</View>
	);
});

export default UserProfile;
