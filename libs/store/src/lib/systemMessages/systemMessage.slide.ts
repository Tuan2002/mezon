import { IPSystemMessage, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { ApiSystemMessage, ApiSystemMessageRequest, ApiSystemMessagesList, MezonUpdateSystemMessageBody } from 'mezon-js/api.gen';
import { ensureSession, getMezonCtx } from '../helpers';

export const SYSTEM_MESSAGE_FEATURE_KEY = 'systemMessages';

export interface SystemMessageEntity extends IPSystemMessage {
	id: string;
}

export interface SystemMessageState extends EntityState<SystemMessageEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	jumpSystemMessageId: string;
}

const systemMessageAdapter = createEntityAdapter<SystemMessageEntity>();

export const initialSystemMessageState: SystemMessageState = systemMessageAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	jumpSystemMessageId: ''
});

export const fetchSystemMessages = createAsyncThunk('systemMessages/fetchSystemMessages', async (_, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	const response: ApiSystemMessagesList = await mezon.client.getSystemMessagesList(mezon.session);
	return response.system_messages_list;
});

export const fetchSystemMessageByClanId = createAsyncThunk('systemMessages/fetchSystemMessageByClanId', async (clanId: string, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	const response: ApiSystemMessage = await mezon.client.getSystemMessageByClanId(mezon.session, clanId);
	return response;
});

export const createSystemMessage = createAsyncThunk('systemMessages/createSystemMessage', async (newMessage: ApiSystemMessageRequest, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	const response: ApiSystemMessage = await mezon.client.createSystemMessage(mezon.session, newMessage);
	return response;
});

export const updateSystemMessage = createAsyncThunk(
	'systemMessages/updateSystemMessage',
	async ({ clanId, newMessage }: { clanId: string; newMessage: MezonUpdateSystemMessageBody }, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response: ApiSystemMessage = await mezon.client.updateSystemMessage(mezon.session, clanId, newMessage);
		return response;
	}
);

export const deleteSystemMessage = createAsyncThunk('systemMessages/deleteSystemMessage', async (clanId: string, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	await mezon.client.deleteSystemMessage(mezon.session, clanId);
	thunkAPI.dispatch(fetchSystemMessages());
});

export const systemMessageSlice = createSlice({
	name: 'systemMessages',
	initialState: initialSystemMessageState,
	reducers: {
		add: systemMessageAdapter.addOne,
		addMany: systemMessageAdapter.addMany,
		remove: systemMessageAdapter.removeOne
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchSystemMessages.pending, (state: SystemMessageState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchSystemMessages.fulfilled, (state: SystemMessageState, action: PayloadAction<any>) => {
				systemMessageAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchSystemMessages.rejected, (state: SystemMessageState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message ?? null;
			})
			.addCase(fetchSystemMessageByClanId.fulfilled, (state: SystemMessageState, action: PayloadAction<any>) => {
				systemMessageAdapter.upsertOne(state, action.payload);
			})
			.addCase(createSystemMessage.fulfilled, (state: SystemMessageState, action: PayloadAction<any>) => {
				const payload = action.payload;
				if (payload?.id) {
					systemMessageAdapter.addOne(state, payload);
				}
			})
			.addCase(updateSystemMessage.fulfilled, (state: SystemMessageState, action: PayloadAction<any>) => {
				const payload = action.payload;
				if (payload?.id) {
					systemMessageAdapter.upsertOne(state, payload);
				}
			})
			.addCase(deleteSystemMessage.fulfilled, (state: SystemMessageState, action: PayloadAction<any>) => {
				systemMessageAdapter.removeOne(state, action.payload);
			});
	}
});

export const systemMessageReducer = systemMessageSlice.reducer;

export const { selectAll: selectAllSystemMessages, selectById: selectSystemMessageById } = systemMessageAdapter.getSelectors(
	(state: { systemMessages: SystemMessageState }) => state.systemMessages
);
