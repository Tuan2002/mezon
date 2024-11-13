import { rolesClanActions, selectCurrentClanId, useAppDispatch } from '@mezon/store';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useMyRole } from './useMyRole';
export function useRoles() {
	const dispatch = useAppDispatch();
	const currentClanId = useSelector(selectCurrentClanId);
	const { maxPermissionId } = useMyRole();

	const deleteRole = React.useCallback(
		async (roleId: string) => {
			await dispatch(rolesClanActions.fetchDeleteRole({ roleId, clanId: currentClanId || '' }));
		},
		[dispatch]
	);

	const createRole = React.useCallback(
		async (clanId: string, title: string, color: string, addUserIds: string[], activePermissionIds: string[]) => {
			const response = await dispatch(
				rolesClanActions.fetchCreateRole({
					clanId,
					title,
					color,
					addUserIds,
					activePermissionIds,
					maxPermissionId: maxPermissionId
				})
			);
			await dispatch(rolesClanActions.fetchRolesClan({ clanId, noCache: true }));
			return response?.payload;
		},
		[dispatch]
	);

	const updateRole = React.useCallback(
		async (
			clanId: string,
			roleId: string,
			title: string,
			color: string,
			addUserIds: string[],
			activePermissionIds: string[],
			removeUserIds: string[],
			removePermissionIds: string[]
		) => {
			const response = await dispatch(
				rolesClanActions.fetchUpdateRole({
					roleId,
					title,
					color,
					addUserIds,
					activePermissionIds,
					removeUserIds,
					removePermissionIds,
					clanId,
					maxPermissionId: maxPermissionId
				})
			);
			await dispatch(rolesClanActions.fetchRolesClan({ clanId, noCache: true }));
			return response?.payload;
		},
		[dispatch]
	);
	return useMemo(
		() => ({
			deleteRole,
			createRole,
			updateRole
		}),
		[deleteRole, createRole, updateRole]
	);
}
