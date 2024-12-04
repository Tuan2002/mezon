import { IUserAccount, LoadingStatus } from '@mezon/utils';
import { PayloadAction, createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { MezonValueContext, ensureSession, getMezonCtx } from '../helpers';
import { memoizeAndTrack } from '../memoize';

export const ACCOUNT_FEATURE_KEY = 'account';
export interface IAccount {
	email: string;
	password: string;
}
export interface AccountState {
	loadingStatus: LoadingStatus;
	error?: string | null;
	account?: IAccount | null;
	userProfile?: IUserAccount | null;
	anonymousMode: boolean;
	logo?: string;
}

export const initialAccountState: AccountState = {
	loadingStatus: 'not loaded',
	account: null,
	userProfile: null,
	anonymousMode: false
};

const CHANNEL_PROFILE_CACHED_TIME = 1000 * 60 * 3;
const fetchUserProfileCached = memoizeAndTrack((mezon: MezonValueContext) => mezon.client.getAccount(mezon.session), {
	promise: true,
	maxAge: CHANNEL_PROFILE_CACHED_TIME,
	normalizer: (args) => {
		return args[0].session.username || '';
	}
});

export const getUserProfile = createAsyncThunk<IUserAccount, { noCache: boolean } | void>('account/user', async (arg, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	const noCache = arg?.noCache ?? false;
	if (noCache) {
		fetchUserProfileCached.clear(mezon);
	}
	const response = await fetchUserProfileCached(mezon);
	if (!response) {
		return thunkAPI.rejectWithValue('Invalid session');
	}
	return response;
});

export const accountSlice = createSlice({
	name: ACCOUNT_FEATURE_KEY,
	initialState: initialAccountState,
	reducers: {
		setAccount(state, action) {
			state.account = action.payload;
		},
		setAnonymousMode(state) {
			state.anonymousMode = !state.anonymousMode;
		},
		setCustomStatus(state, action: PayloadAction<string>) {
			if (state?.userProfile?.user) {
				const userMetadata = JSON.parse(state.userProfile.user.metadata || '{}');
				const updatedUserMetadata = { ...userMetadata, status: action.payload };
				state.userProfile.user.metadata = JSON.stringify(updatedUserMetadata);
			}
		},
		setLogoCustom(state, action: PayloadAction<string | undefined>) {
			state.logo = action.payload;
		},
		setWalletValue(state, action: PayloadAction<number>) {
			if (state.userProfile?.wallet) {
				try {
					const walletData = JSON.parse(state.userProfile.wallet);
					walletData.value = action.payload;
					state.userProfile.wallet = JSON.stringify(walletData);
				} catch (error) {
					console.error('Error updating wallet value:', error);
				}
			}
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(getUserProfile.pending, (state: AccountState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(getUserProfile.fulfilled, (state: AccountState, action: PayloadAction<IUserAccount>) => {
				state.userProfile = action.payload;
				state.logo = action.payload.logo;
				state.loadingStatus = 'loaded';
			})
			.addCase(getUserProfile.rejected, (state: AccountState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

/*
 * Export reducer for store configuration.
 */
export const accountReducer = accountSlice.reducer;

export const accountActions = { ...accountSlice.actions, getUserProfile };

export const getAccountState = (rootState: { [ACCOUNT_FEATURE_KEY]: AccountState }): AccountState => rootState[ACCOUNT_FEATURE_KEY];

export const selectAllAccount = createSelector(getAccountState, (state: AccountState) => state.userProfile);

export const selectCurrentUserId = createSelector(getAccountState, (state: AccountState) => state?.userProfile?.user?.id || '');

export const selectAnonymousMode = createSelector(getAccountState, (state: AccountState) => state.anonymousMode);

export const selectAccountMetadata = createSelector(getAccountState, (state: AccountState) => JSON.parse(state.userProfile?.user?.metadata || '{}'));

export const selectAccountCustomStatus = createSelector(selectAccountMetadata, (metadata) => metadata?.status || '');

export const selectLogoCustom = createSelector(getAccountState, (state) => state.logo);
