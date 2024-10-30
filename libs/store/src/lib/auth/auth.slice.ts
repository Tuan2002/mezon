import { LoadingStatus } from '@mezon/utils';
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { Session } from 'mezon-js';
import { toast } from 'react-toastify';
import { ensureClientAsync, getMezonCtx, restoreLocalStorage } from '../helpers';
export const AUTH_FEATURE_KEY = 'auth';

export interface AuthState {
	loadingStatus: LoadingStatus;
	error?: string | null;
	session?: ISession | null;
	isLogin?: boolean;
}

export interface ISession {
	readonly created: boolean;
	token: string;
	readonly created_at: number;
	expires_at?: number;
	refresh_expires_at?: number;
	refresh_token: string;
	username?: string;
	user_id?: string;
	vars?: object;
}

export const initialAuthState: AuthState = {
	loadingStatus: 'not loaded',
	session: null,
	isLogin: false
};

function normalizeSession(session: Session): ISession {
	return JSON.parse(JSON.stringify(session));
}

export const authenticateGoogle = createAsyncThunk('auth/authenticateGoogle', async (token: string, thunkAPI) => {
	const mezon = getMezonCtx(thunkAPI);
	const session = await mezon.authenticateGoogle(token);
	if (!session) {
		return thunkAPI.rejectWithValue('Invalid session');
	}
	return normalizeSession(session);
});

export const authenticateApple = createAsyncThunk('auth/authenticateApple', async (token: string, thunkAPI) => {
	const mezon = getMezonCtx(thunkAPI);
	const session = await mezon.authenticateApple(token);
	if (!session) {
		return thunkAPI.rejectWithValue('Invalid session');
	}
	return normalizeSession(session);
});

export type AuthenticateEmailPayload = {
	username: string;
	password: string;
};

export const authenticateEmail = createAsyncThunk('auth/authenticateEmail', async ({ username, password }: AuthenticateEmailPayload, thunkAPI) => {
	const mezon = getMezonCtx(thunkAPI);
	const session = await mezon?.authenticateEmail(username, password).catch(function (err: any) {
		err.json().then((data: any) => {
			toast.error(data.message);
		});
	});

	if (!session) {
		return thunkAPI.rejectWithValue('Invalid session');
	}
	return normalizeSession(session);
});

export const refreshSession = createAsyncThunk('auth/refreshSession', async (_, thunkAPI) => {
	const mezon = await ensureClientAsync(getMezonCtx(thunkAPI));
	const sessionState = selectSession(thunkAPI.getState() as unknown as { [AUTH_FEATURE_KEY]: AuthState });

	if (!sessionState) {
		return thunkAPI.rejectWithValue('Invalid session');
	}

	if (mezon.sessionRef.current?.token === sessionState?.token) {
		return sessionState;
	}

	const session = await mezon?.refreshSession(sessionState);

	if (!session) {
		return thunkAPI.rejectWithValue('Invalid session');
	}

	return normalizeSession(session);
});

export const logOut = createAsyncThunk('auth/logOut', async (_, thunkAPI) => {
	const mezon = getMezonCtx(thunkAPI);
	await mezon?.logOutMezon();
	thunkAPI.dispatch(authActions.setLogout());
	restoreLocalStorage(['persist:auth', 'persist:apps', 'persist:categories']);
});

export const createQRLogin = createAsyncThunk('auth/getQRCode', async (_, thunkAPI) => {
	const mezon = getMezonCtx(thunkAPI);
	const QRlogin = await mezon?.createQRLogin();

	if (!QRlogin) {
		return thunkAPI.rejectWithValue('Invalid session');
	}
	return QRlogin;
});

export const checkLoginRequest = createAsyncThunk('auth/checkLoginRequest', async ({ loginId }: { loginId: string }, thunkAPI) => {
	const mezon = getMezonCtx(thunkAPI);

	const session = await mezon?.checkLoginRequest({ login_id: loginId });
	if (session) {
		return normalizeSession(session);
	}
	return null;
});

export const authSlice = createSlice({
	name: AUTH_FEATURE_KEY,
	initialState: initialAuthState,
	reducers: {
		setSession(state, action) {
			state.session = action.payload;
			state.isLogin = true;
		},
		setLogout(state) {
			state.session = null;
			state.isLogin = false;
			state.loadingStatus = 'not loaded';
		},
		refreshStatus(state) {
			state.loadingStatus = 'not loaded';
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(authenticateGoogle.pending, (state: AuthState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(authenticateGoogle.fulfilled, (state: AuthState, action) => {
				state.loadingStatus = 'loaded';
				state.session = action.payload;
				state.isLogin = true;
			})
			.addCase(authenticateGoogle.rejected, (state: AuthState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});

		builder
			.addCase(authenticateApple.pending, (state: AuthState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(authenticateApple.fulfilled, (state: AuthState, action) => {
				state.loadingStatus = 'loaded';
				state.session = action.payload;
				state.isLogin = true;
			})
			.addCase(authenticateApple.rejected, (state: AuthState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});

		builder
			.addCase(authenticateEmail.pending, (state: AuthState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(authenticateEmail.fulfilled, (state: AuthState, action) => {
				state.loadingStatus = 'loaded';
				state.session = action.payload;
				state.isLogin = true;
			})
			.addCase(authenticateEmail.rejected, (state: AuthState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});

		builder
			.addCase(refreshSession.pending, (state: AuthState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(refreshSession.fulfilled, (state: AuthState, action) => {
				state.loadingStatus = 'loaded';
				state.session = action.payload;
				state.isLogin = true;
			})
			.addCase(refreshSession.rejected, (state: AuthState, action) => {
				state.loadingStatus = 'not loaded';
				state.error = action.error.message;
				state.session = null;
				state.isLogin = false;
			});

		builder
			.addCase(checkLoginRequest.pending, (state: AuthState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(checkLoginRequest.fulfilled, (state: AuthState, action) => {
				state.loadingStatus = 'loaded';
				if (action.payload !== null) {
					state.session = action.payload;
					state.isLogin = true;
				}
			})
			.addCase(checkLoginRequest.rejected, (state: AuthState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

/*
 * Export reducer for store configuration.
 */
export const authReducer = authSlice.reducer;

export const authActions = {
	...authSlice.actions,
	authenticateGoogle,
	authenticateApple,
	authenticateEmail,
	refreshSession,
	createQRLogin,
	checkLoginRequest,
	logOut
};

export const getAuthState = (rootState: { [AUTH_FEATURE_KEY]: AuthState }): AuthState => rootState[AUTH_FEATURE_KEY];

export const selectAllAuth = createSelector(getAuthState, (state: AuthState) => state);

export const selectAuthIsLoaded = createSelector(getAuthState, (state: AuthState) => state.loadingStatus === 'loaded');

export const selectIsLogin = createSelector(getAuthState, (state: AuthState) => state.isLogin);

export const selectSession = createSelector(getAuthState, (state: AuthState) => state.session);
