import { RolesClanEntity, selectAllRolesClan, selectCurrentChannelId, selectCurrentClan, selectUserChannelById } from '@mezon/store';
import { EPermission } from '@mezon/utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';

const getUserPermissionsStatus = (activeRoleIds: string[] = [], clanRoles: RolesClanEntity[] = []) => {
	const result: { [key in EPermission]: boolean } = {
		[EPermission.administrator]: false,
		[EPermission.viewChannel]: false,
		[EPermission.manageChannel]: false,
		[EPermission.sendMessage]: false,
		[EPermission.deleteMessage]: false,
		[EPermission.manageThread]: false,
		[EPermission.manageClan]: false,
		[EPermission.everyone]: true
	};

	clanRoles.forEach((role) => {
		const activeRole = activeRoleIds.includes(role?.id);

		if (activeRole || role?.slug === EPermission.everyone) {
			const listOfActivePermission = role?.permission_list?.permissions?.filter((p) => p?.active) || [];
			listOfActivePermission.forEach((permission) => {
				if (permission?.slug) {
					const permissionKey = permission?.slug as EPermission;
					result[permissionKey] = true;
				}
			});
		}
	});

	return result;
};

export function useUserPermission() {
	const { userId, userProfile } = useAuth();
	const currentChannelId = useSelector(selectCurrentChannelId);
	const userById = useSelector(selectUserChannelById(userId || '', currentChannelId || ''));
	const currentClan = useSelector(selectCurrentClan);
	const rolesClan = useSelector(selectAllRolesClan);
	const userPermissionsStatus = useMemo(() => {
		return getUserPermissionsStatus(userById?.role_id, rolesClan);
	}, [userById?.role_id, rolesClan]);

	const isClanOwner = useMemo(() => {
		return currentClan?.creator_id === userProfile?.user?.id;
	}, [currentClan?.creator_id, userProfile?.user?.id]);

	return {
		userPermissionsStatus,
		isClanOwner,
		isCanManageThread: userPermissionsStatus['manage-thread'] || userPermissionsStatus.administrator || isClanOwner,
		isCanManageChannel:
			userPermissionsStatus['manage-channel'] || userPermissionsStatus.administrator || isClanOwner || userPermissionsStatus['manage-clan'],
		isCanManageClan: userPermissionsStatus['manage-clan'] || userPermissionsStatus.administrator || isClanOwner,
		isCanDeleteMessage: userPermissionsStatus['delete-message'] || userPermissionsStatus.administrator || isClanOwner,
		isCanSendMessage:
			userPermissionsStatus['send-message'] ||
			userPermissionsStatus.administrator ||
			isClanOwner ||
			userPermissionsStatus['manage-channel'] ||
			userPermissionsStatus['manage-clan'] ||
			userPermissionsStatus['manage-thread'],
		isCanViewChannel:
			userPermissionsStatus['send-message'] ||
			userPermissionsStatus['view-channel'] ||
			userPermissionsStatus.administrator ||
			isClanOwner ||
			userPermissionsStatus['manage-channel'] ||
			userPermissionsStatus['manage-clan'] ||
			userPermissionsStatus['manage-thread'],
		isCanManageEvent: isClanOwner || userPermissionsStatus.administrator || userPermissionsStatus['manage-clan'],
		isCanEditRole: isClanOwner || userPermissionsStatus.administrator || userPermissionsStatus['manage-clan']
	};
}
