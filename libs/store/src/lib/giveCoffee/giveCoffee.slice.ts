import { captureSentryError } from '@mezon/logger';
import { AMOUNT_TOKEN, IMessageWithUser, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ApiGiveCoffeeEvent } from 'mezon-js/api.gen';
import { ApiTokenSentEvent } from 'mezon-js/dist/api.gen';
import { ensureSession, getMezonCtx } from '../helpers';
import { toastActions } from '../toasts/toasts.slice';

export const GIVE_COFEE = 'giveCoffee';
export const TOKEN_SUCCESS_STATUS = 'SUCCESS';
export const TOKEN_FAILED_STATUS = 'FAILED';

export interface GiveCoffeeEntity {
	id: string; // Primary ID
}

export interface ISendTokenDetailType extends ApiTokenSentEvent {
	receiver_name?: string;
}
export interface GiveCoffeeState extends EntityState<GiveCoffeeEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	showModalSendToken: boolean;
	showGiveCoffeeModal: boolean;
	giveCoffeeMessage: IMessageWithUser | null;
	tokenSocket: Record<string, ApiGiveCoffeeEvent>;
	tokenUpdate: Record<string, number>;
	infoSendToken: ISendTokenDetailType | null;
	sendTokenEvent: {
		tokenEvent: ApiTokenSentEvent;
		status: string;
	} | null;
}

export const giveCoffeeAdapter = createEntityAdapter<GiveCoffeeEntity>();

export const updateGiveCoffee = createAsyncThunk(
	'giveCoffee/updateGiveCoffee',
	async ({ channel_id, clan_id, message_ref_id, receiver_id, sender_id, token_count }: ApiGiveCoffeeEvent, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			const response =
				token_count === AMOUNT_TOKEN.TEN_TOKENS
					? await mezon.client.givecoffee(mezon.session, {
							channel_id,
							clan_id,
							message_ref_id,
							receiver_id,
							sender_id,
							token_count
						})
					: await mezon.client.sendToken(mezon.session, {
							receiver_id,
							amount: (token_count ?? AMOUNT_TOKEN.TEN_TOKENS) * 1000,
							note: `Give coffee action`
						});
			if (!response) {
				return thunkAPI.rejectWithValue([]);
			}
			return response;
		} catch (error) {
			captureSentryError(error, 'giveCoffee/updateGiveCoffee');
			return thunkAPI.rejectWithValue(error);
		}
	}
);

export const initialGiveCoffeeState: GiveCoffeeState = giveCoffeeAdapter.getInitialState({
	loadingStatus: 'not loaded',
	clans: [],
	error: null,
	showModalSendToken: false,
	showGiveCoffeeModal: false,
	giveCoffeeMessage: null,
	tokenSocket: {},
	tokenUpdate: {},
	infoSendToken: null,
	sendTokenEvent: null
});

export const sendToken = createAsyncThunk('token/sendToken', async (tokenEvent: ApiTokenSentEvent, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.sendToken(mezon.session, {
			receiver_id: tokenEvent.receiver_id,
			amount: tokenEvent.amount,
			note: tokenEvent.note,
			extra_attribute: tokenEvent.extra_attribute
		});

		if (response) {
			thunkAPI.dispatch(toastActions.addToast({ message: 'Funds Transferred', type: 'success' }));
			thunkAPI.dispatch(giveCoffeeActions.updateTokenUser({ tokenEvent }));
			return response;
		} else {
			thunkAPI.dispatch(toastActions.addToast({ message: 'An error occurred, please try again', type: 'error' }));
		}
	} catch (error) {
		captureSentryError(error, 'token/sendToken');
		return thunkAPI.rejectWithValue(error);
	}
});

export const giveCoffeeSlice = createSlice({
	name: GIVE_COFEE,
	initialState: initialGiveCoffeeState,
	reducers: {
		add: giveCoffeeAdapter.addOne,
		remove: giveCoffeeAdapter.removeOne,
		setShowModalSendToken: (state, action: PayloadAction<boolean>) => {
			state.showModalSendToken = action.payload;
		},
		setShowGiveCoffeeModal: (state, action: PayloadAction<boolean>) => {
			state.showGiveCoffeeModal = action.payload;
		},
		setGiveCoffeeMessage: (state, action: PayloadAction<IMessageWithUser | null>) => {
			state.giveCoffeeMessage = action.payload;
		},
		setInfoSendToken: (state, action: PayloadAction<ISendTokenDetailType | null>) => {
			state.infoSendToken = action.payload;
		},
		setSendTokenEvent: (state, action) => {
			state.sendTokenEvent = action.payload;
		},
		updateTokenUser: (state, action: PayloadAction<{ tokenEvent: ApiTokenSentEvent }>) => {
			const { tokenEvent } = action.payload;
			const userId = tokenEvent.sender_id;
			if (!userId) return;
			state.tokenUpdate[userId] = state.tokenUpdate[userId] ?? 0;
			state.tokenSocket[userId] = tokenEvent ?? {};

			if (userId === tokenEvent.sender_id) {
				state.tokenUpdate[userId] -= tokenEvent.amount || 0;
			}
		},
		handleSocketToken: (state, action: PayloadAction<{ currentUserId: string; tokenEvent: ApiTokenSentEvent }>) => {
			const { currentUserId, tokenEvent } = action.payload;
			if (!currentUserId) return;
			if (currentUserId !== tokenEvent.receiver_id) return;

			state.tokenUpdate[currentUserId] = state.tokenUpdate[currentUserId] ?? 0;
			state.tokenSocket[currentUserId] = tokenEvent ?? {};

			if (currentUserId === tokenEvent.receiver_id) {
				state.tokenUpdate[currentUserId] += tokenEvent.amount || 0;
			}
		}
	}
});

/*
 * Export reducer for store configuration.
 */
export const giveCoffeeReducer = giveCoffeeSlice.reducer;

/*
 * Export action creators to be dispatched. For use with the `useDispatch` hook.
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(clansActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const giveCoffeeActions = {
	...giveCoffeeSlice.actions,
	updateGiveCoffee,
	sendToken
};

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllClans);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
export const getCoffeeState = (rootState: { [GIVE_COFEE]: GiveCoffeeState }): GiveCoffeeState => rootState[GIVE_COFEE];

export const selectShowModalSendToken = createSelector(getCoffeeState, (state) => state.showModalSendToken);

export const selectShowGiveCoffeeModal = createSelector(getCoffeeState, (state) => state.showGiveCoffeeModal);

export const selectGiveCoffeeMessage = createSelector(getCoffeeState, (state) => state.giveCoffeeMessage);

export const selectInfoSendToken = createSelector(getCoffeeState, (state) => state.infoSendToken);

export const selectSendTokenEvent = createSelector(getCoffeeState, (state) => state.sendTokenEvent);

export const selectUpdateToken = (userId: string) =>
	createSelector(getCoffeeState, (state) => {
		const tokenUpdate = state?.tokenUpdate || {};
		const tokenValue = tokenUpdate[userId];
		return typeof tokenValue === 'number' && !isNaN(tokenValue) ? tokenValue : 0;
	});
export const selectTokenSocket = (userId: string) =>
	createSelector(getCoffeeState, (state) => {
		const tokenSocket = state?.tokenSocket || {};
		return tokenSocket[userId];
	});
