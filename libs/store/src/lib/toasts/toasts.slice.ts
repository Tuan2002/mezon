import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sleep } from '../helpers';
import { Toast, ToastPayload } from './types';

export const TOASTS_FEATURE_KEY = 'toasts';

// Create an adapter for the toasts
const toastsAdapter = createEntityAdapter<Toast>();

const initialState = {
	...toastsAdapter.getInitialState(),
	toastErrorStatus: false
};
const addToast = createAsyncThunk(
	'toasts/addToast',
	async (payload: ToastPayload, thunkAPI) => {
		const id = payload?.id || Date.now().toString();

		const newToast: Toast = {
			id,
			message: payload.message,
			position: payload.position || 'top-right',
			autoClose: payload.autoClose ?? 3000,
			hideProgressBar: payload.hideProgressBar || false,
			closeOnClick: payload.closeOnClick || true,
			pauseOnHover: payload.pauseOnHover || true,
			draggable: payload.draggable || true,
			theme: payload.theme || 'light',
			type: payload.type || 'info'
		};

		thunkAPI.dispatch(toastsSlice.actions.addOneToast(newToast));

		await sleep(3000);

		thunkAPI.dispatch(toastsSlice.actions.removeToast(id));
	},
	{
		condition: (toast, { getState }) => {
			const toasts = selectToasts(getState() as { toasts: typeof initialState });
			if (toasts.length >= 5) {
				return false;
			}

			// If the toast is a duplicate, don't add it
			if (toasts.find((t) => t.message === toast.message)) {
				return false;
			}
		}
	}
);

// Create the slice
export const toastsSlice = createSlice({
	name: TOASTS_FEATURE_KEY,
	initialState,
	reducers: {
		addOneToast: toastsAdapter.addOne,
		removeToast: (state, action: PayloadAction<string>) => {
			toastsAdapter.removeOne(state, action.payload);
		},
		clearToasts: (state) => {
			toastsAdapter.removeAll(state);
		},
		setErrorToastStatus: (state, action: PayloadAction<boolean>) => {
			state.toastErrorStatus = action.payload;
		}
	}
});

export const { addOneToast, removeToast, clearToasts, setErrorToastStatus } = toastsSlice.actions;

export const toastActions = {
	addToast,
	removeToast,
	clearToasts,
	setErrorToastStatus
};

// Create selectors using the adapter's getSelectors method
export const { selectAll: selectToasts, selectById: selectToastById } = toastsAdapter.getSelectors(
	(state: { toasts: typeof initialState }) => state.toasts
);
export const selectToastErrorStatus = createSelector(
	[(state: { toasts: typeof initialState }) => state.toasts],
	(toastsState) => toastsState.toastErrorStatus
);
export const toastsReducer = toastsSlice.reducer;
