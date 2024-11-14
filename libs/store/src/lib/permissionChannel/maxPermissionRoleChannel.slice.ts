import { captureSentryError } from '@mezon/logger';
import { LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ApiPermission } from 'mezon-js/api.gen';
import { ensureSession, getMezonCtx } from '../helpers';
import { fetchMaxChannelPermissionCached } from '../policies/overriddenPolicies.slice';

export const MAX_PERMISSION_ROLE_CHANNEL_FEATURE_KEY = 'maxpermissionrolechannel';

export interface MaxPermissionRoleChannelState extends EntityState<ApiPermission, string> {
	loadingStatus: LoadingStatus;
	channelPermissions: ApiPermission[];
	error?: string | null;
}

const maxPermissionRoleChannelAdapter = createEntityAdapter({
	selectId: (permission: ApiPermission) => permission.id || ''
});

type FetchMaxPermissionChannelsArgs = {
	channelId: string;
	clanId: string;
	noCache?: boolean;
};

/**
 * @deprecated use overriddenPolicies instead
 */
export const fetchMaxPermissionRoleChannel = createAsyncThunk(
	'permissionrolechannel/fetchMaxPermissionRoleChannel',
	async ({ clanId, channelId, noCache }: FetchMaxPermissionChannelsArgs, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			if (noCache) {
				fetchMaxChannelPermissionCached.clear(mezon, clanId, channelId);
			}
			const response = await fetchMaxChannelPermissionCached(mezon, clanId, channelId);
			if (response && response.permissions?.permissions) {
				await thunkAPI.dispatch(maxPermissionRoleChannelActions.setMaxPermissionChannel(response.permissions.permissions));
				return response?.permissions.permissions;
			}
			captureSentryError('no reponse', 'permissionrolechannel/fetchMaxPermissionRoleChannel');
			return thunkAPI.rejectWithValue('no reponse');
		} catch (error) {
			captureSentryError(error, 'permissionrolechannel/fetchMaxPermissionRoleChannel');
			return thunkAPI.rejectWithValue(error);
		}
	}
);

const initialMaxPermissionRoleChannelState: MaxPermissionRoleChannelState = maxPermissionRoleChannelAdapter.getInitialState({
	loadingStatus: 'not loaded',
	channelPermissions: [],
	error: null
});

/**
 * @deprecated use overriddenPolicies instead
 */
export const maxPermissionRoleChannelSlice = createSlice({
	name: MAX_PERMISSION_ROLE_CHANNEL_FEATURE_KEY,
	initialState: initialMaxPermissionRoleChannelState,
	reducers: {
		add: maxPermissionRoleChannelAdapter.addOne,
		removeAll: maxPermissionRoleChannelAdapter.removeAll,
		remove: maxPermissionRoleChannelAdapter.removeOne,
		update: maxPermissionRoleChannelAdapter.updateOne,
		setMaxPermissionChannel: (state, action: PayloadAction<ApiPermission[]>) => {
			state.channelPermissions = action.payload;
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchMaxPermissionRoleChannel.pending, (state: MaxPermissionRoleChannelState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchMaxPermissionRoleChannel.fulfilled, (state: MaxPermissionRoleChannelState, action) => {
				maxPermissionRoleChannelAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchMaxPermissionRoleChannel.rejected, (state: MaxPermissionRoleChannelState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

/**
 * @deprecated use overriddenPolicies instead
 */
export const maxPermissionRoleChannelReducer = maxPermissionRoleChannelSlice.reducer;

export const maxPermissionRoleChannelActions = {
	...maxPermissionRoleChannelSlice.actions,
	fetchMaxPermissionRoleChannel
};

const { selectAll } = maxPermissionRoleChannelAdapter.getSelectors();

/**
 * @deprecated use overriddenPolicies instead
 * @param rootState
 * @returns
 */
export const getMaxPermissionRoleChannelState = (rootState: {
	[MAX_PERMISSION_ROLE_CHANNEL_FEATURE_KEY]: MaxPermissionRoleChannelState;
}): MaxPermissionRoleChannelState => rootState[MAX_PERMISSION_ROLE_CHANNEL_FEATURE_KEY];

/**
 * @deprecated use overriddenPolicies instead
 */
export const selectAllMaxPermissionRoleChannel = createSelector(getMaxPermissionRoleChannelState, selectAll);
