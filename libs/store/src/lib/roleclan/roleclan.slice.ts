import { IRolesClan, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ApiRole, RoleUserListRoleUser } from 'mezon-js/api.gen';
import { ensureSession, getMezonCtx } from '../helpers';
import { RootState } from '../store';

export const ROLES_CLAN_FEATURE_KEY = 'rolesclan';

/*
 * Update these interfaces according to your requirements.
 */

export interface RolesClanEntity extends IRolesClan {
	id: string; // Primary ID
}

export const mapRolesClanToEntity = (RolesClanRes: ApiRole) => {
	const id = (RolesClanRes as unknown as any).id;
	return { ...RolesClanRes, id };
};

export interface RolesClanState extends EntityState<RolesClanEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	currentRoleId?: string | null;
	roleMembers:Record<string,RoleUserListRoleUser[]> 
	roles: IRolesClan[];
}

export const RolesClanAdapter = createEntityAdapter<RolesClanEntity>();

type GetRolePayload = {
	clanId?: string,
	repace?: boolean,
	channelId?: string,
};
export const fetchRolesClan = createAsyncThunk(
	'RolesClan/fetchRolesClan',
	async ({ clanId, repace = false, channelId }: GetRolePayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.listRoles(mezon.session, 100,1,'',clanId);
		if (!response.roles) {
			return [];
		}
		if (repace) {
			thunkAPI.dispatch(rolesClanActions.removeRoleByChannel(channelId ?? ''));
		}
		return response.roles.map(mapRolesClanToEntity);
	},
);

type FetchReturnMembersRole ={
	roleID:string
	members:RoleUserListRoleUser[]
}

type FetchMembersRolePayload = {
	roleId: string;
	clanId: string
};
export const fetchMembersRole = createAsyncThunk(
	'MembersRole/fetchMembersRole',
	async ({ roleId }: FetchMembersRolePayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.listRoleUsers(mezon.session,roleId, 100,'');
		if (!response.role_users) {
			return thunkAPI.rejectWithValue([]);
		}
		return ({
			roleID: roleId,members:response.role_users
		}) as FetchReturnMembersRole;
	},
);

export const fetchDeleteRole = createAsyncThunk(

	'DeleteRole/fetchDeleteRole',

	async ({ roleId, clanId }: FetchMembersRolePayload, thunkAPI) => {
		try{
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			const response = await mezon.client.updateRoleDelete(mezon.session,roleId,{clan_id: clanId});
			thunkAPI.dispatch(rolesClanActions.remove(roleId))
			if (!response) {
				return thunkAPI.rejectWithValue([]);
			}
			return response;
		}catch{
			return thunkAPI.rejectWithValue([]);
		}
	},
);

type CreateRolePayload = {
	clan_id: string;
    title: string | undefined;
    add_user_ids: string[];
    active_permission_ids: string[];
};

export const fetchCreateRole = createAsyncThunk(
	'CreatRole/fetchCreateRole',
	async ({ clan_id, title, add_user_ids, active_permission_ids}: CreateRolePayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const body = {
			active_permission_ids: active_permission_ids || [],
    		add_user_ids: add_user_ids || [],
    		allow_mention: 0,
    		clan_id: clan_id,
    		color: '',
    		description: '',
    		display_online: 0,
    		title: title ?? '',
		}
		const response = await mezon.client.createRole(mezon.session,body);
		if (!response) {
			
			return thunkAPI.rejectWithValue([]);
		}
		return response;
	},
);

type UpdateRolePayload = {
    role_id: string;
    title: string | undefined;
    add_user_ids: string[];
    active_permission_ids: string[];
    remove_user_ids: string[];
    remove_permission_ids: string[];
	clanId: string;
};

export const fetchUpdateRole = createAsyncThunk(
	'UpdateRole/fetchUpdateRole',
	async ({ role_id, title, add_user_ids, active_permission_ids,remove_user_ids, remove_permission_ids, clanId}: UpdateRolePayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const body = {
			role_id: role_id,
			title: title ?? '',
			color: '',
			role_icon: '',
			description: '',
			display_online: 0,
			allow_mention: 0,
			add_user_ids: add_user_ids || [],
			active_permission_ids: active_permission_ids || [],
			remove_user_ids: remove_user_ids || [],
			remove_permission_ids: remove_permission_ids || [],
			clan_id: clanId
		}
		const response = await mezon.client.updateRole(mezon.session, role_id, body);
		if (!response) {
			
			return thunkAPI.rejectWithValue([]);
		}
		return response;
	},
);

export const initialRolesClanState: RolesClanState = RolesClanAdapter.getInitialState({
	loadingStatus: 'not loaded',
	RolesClan: [],
	roleMembers: {},
	roles: [],
	error: null,
});

export const RolesClanSlice = createSlice({
	name: ROLES_CLAN_FEATURE_KEY,
	initialState: initialRolesClanState,
	reducers: {
		add: RolesClanAdapter.addOne,
		remove: RolesClanAdapter.removeOne,
		removeRoleByChannel: (state, action: PayloadAction<string>) => {
			const channelId = action.payload;
			const updatedRoles = Object.values(state.entities).filter((role) => {
				if(role.channel_ids){
					return !role.channel_ids.includes(channelId);
				}
			});
			return RolesClanAdapter.setAll(state, updatedRoles);
		},
		setCurrentRoleId: (state, action: PayloadAction<string>) => {
			state.currentRoleId = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchRolesClan.pending, (state: RolesClanState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchRolesClan.fulfilled, (state: RolesClanState, action: PayloadAction<IRolesClan[]>) => {
				RolesClanAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})

			.addCase(fetchRolesClan.rejected, (state: RolesClanState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
		builder
			.addCase(fetchMembersRole.fulfilled, (state: RolesClanState, action: PayloadAction<FetchReturnMembersRole>) => {
				state.roleMembers[action.payload.roleID]=(action.payload.members);
			})
	},
});

export const roleSlice = createSlice({
	name: 'roleId',
	initialState: {
	  selectedRoleId: '',
	  nameRoleNew: '',
	  selectedPermissions: [] as string[],
	  addPermissions: [],
	  addMemberRoles: [] as string[],
	  removePermissions: [],
	  removeMemberRoles: [],
	},
	reducers: {
	  setSelectedRoleId: (state, action) => {
		state.selectedRoleId = action.payload;
	  },
	  setNameRoleNew: (state, action) => {
		state.nameRoleNew = action.payload;
	  },
	  setSelectedPermissions: (state, action) => {
		state.selectedPermissions = action.payload;
	  },
	  setAddPermissions: (state, action) => {
		state.addPermissions = action.payload;
	  },
	  setAddMemberRoles: (state, action) => {
		state.addMemberRoles = action.payload;
	  },
	  setRemovePermissions: (state, action) => {
		state.removePermissions = action.payload;
	  },
	  setRemoveMemberRoles: (state, action) => {
		state.removeMemberRoles = action.payload;
	  },
	},
  });

export const roleIdReducer = roleSlice.reducer;

export const { setSelectedRoleId, setNameRoleNew, setAddPermissions, setAddMemberRoles, setRemovePermissions, setRemoveMemberRoles, setSelectedPermissions} = roleSlice.actions;

export const getSelectedRoleId = (state: RootState) => state.roleId.selectedRoleId;

export const getNewNameRole = (state: RootState) => state.roleId.nameRoleNew;

export const getNewSelectedPermissions = (state: RootState) => state.roleId.selectedPermissions;

export const getNewAddPermissions = (state: RootState) => state.roleId.addPermissions;

export const getNewAddMembers = (state: RootState) => state.roleId.addMemberRoles;

export const getRemovePermissions = (state: RootState) => state.roleId.removePermissions;

export const getRemoveMemberRoles = (state: RootState) => state.roleId.removeMemberRoles;


export const updateRoleSlice = createSlice({
	name: 'isshow',
	initialState: {
	  isShow: false,
	},
	reducers: {
	  toggleIsShowTrue: (state) => {
		state.isShow = true;
	  },
	  toggleIsShowFalse: (state) => {
		state.isShow = false;
	  },
	},
  });
  
  export const IsShowReducer= updateRoleSlice.reducer;
  
  export const { toggleIsShowTrue, toggleIsShowFalse } = updateRoleSlice.actions;
  
  export const getIsShow = (state: RootState) => state.isshow.isShow;

/*
 * Export reducer for store configuration.
 */
export const RolesClanReducer = RolesClanSlice.reducer;
export const rolesClanActions = { ...RolesClanSlice.actions, fetchRolesClan, fetchMembersRole, fetchDeleteRole, fetchCreateRole, fetchUpdateRole};


const { selectAll, selectEntities } = RolesClanAdapter.getSelectors();

export const getRolesClanState = (rootState: { [ROLES_CLAN_FEATURE_KEY]: RolesClanState }): RolesClanState =>
	rootState[ROLES_CLAN_FEATURE_KEY];

export const selectAllRolesClan = createSelector(getRolesClanState, selectAll);

export const selectCurrentRoleId = createSelector(getRolesClanState, (state) => state.currentRoleId);

export const selectRolesClanEntities = createSelector(getRolesClanState, selectEntities);

export const selectRolesByChannelId = (channelId?: string | null) =>
	createSelector(selectRolesClanEntities, (entities) => {
		const roles = Object.values(entities);
		return roles.filter((role) => role?.channel_ids?.includes(channelId!));
	});

export const selectCurrentRole = createSelector(selectRolesClanEntities, selectCurrentRoleId, (RolesClanEntities, RoleId) =>
RoleId ? RolesClanEntities[RoleId] : null,);
export const selectAllRoleMember = createSelector(getRolesClanState, (state)=>state.roleMembers);
export const selectMembersByRoleID = (roleID:string)=>{createSelector(selectAllRoleMember, (roleMembers)=>{return roleMembers[roleID]});}