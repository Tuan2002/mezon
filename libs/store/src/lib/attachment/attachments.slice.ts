import { LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ApiChannelAttachment } from 'mezon-js/dist/api.gen';
import { ensureSession, getMezonCtx } from '../helpers';

export const ATTACHMENT_FEATURE_KEY = 'attachments';

export type IChannelAttachment = {
	filename?: string;
	filesize?: string;
	filetype?: string;
	id?: string;
	uploader?: string;
	url?: string;
	channelId?: string;
	clanId?: string;
};

/*
 * Update these interfaces according to your requirements.
 */
export interface AttachmentEntity extends IChannelAttachment {
	id: string; // Primary ID
}

export interface AttachmentState extends EntityState<AttachmentEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
}

export const attachmentAdapter = createEntityAdapter<AttachmentEntity>();

type fetchChannelAttachmentsPayload = {
	clanId: string;
	channelId: string;
};

export const mapChannelAttachmentsToEntity = (attachmentRes: ApiChannelAttachment, channelId?: string, clanId?: string) => {
	return { ...attachmentRes, id: attachmentRes.id || '', channelId, clanId };
};

export const fetchChannelAttachments = createAsyncThunk(
	'attachment/fetchChannelAttachments',
	async ({ clanId, channelId }: fetchChannelAttachmentsPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.listChannelAttachments(mezon.session, channelId, clanId, '');
		if (!response.attachments) {
			return thunkAPI.rejectWithValue([]);
		}

		const attachments = response.attachments.map((attachmentRes) => mapChannelAttachmentsToEntity(attachmentRes, channelId, clanId));
		return attachments;
	},
);

export const initialAttachmentState: AttachmentState = attachmentAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
});

export const attachmentSlice = createSlice({
	name: ATTACHMENT_FEATURE_KEY,
	initialState: initialAttachmentState,
	reducers: {
		add: attachmentAdapter.addOne,
		addMany: attachmentAdapter.addMany,
		remove: attachmentAdapter.removeOne,
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchChannelAttachments.pending, (state: AttachmentState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchChannelAttachments.fulfilled, (state: AttachmentState, action: PayloadAction<any>) => {
				attachmentAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchChannelAttachments.rejected, (state: AttachmentState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});

/*
 * Export reducer for store configuration.
 */
export const attachmentReducer = attachmentSlice.reducer;

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
 *   dispatch(usersActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const attachmentActions = {
	...attachmentSlice.actions,
	fetchChannelAttachments,
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
 * const entities = useSelector(selectAllUsers);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = attachmentAdapter.getSelectors();

export const getAttachmentState = (rootState: { [ATTACHMENT_FEATURE_KEY]: AttachmentState }): AttachmentState => rootState[ATTACHMENT_FEATURE_KEY];

export const selectAllAttachment = createSelector(getAttachmentState, selectAll);

export const selectAttachmentEntities = createSelector(getAttachmentState, selectEntities);

export const selectAttachmentPhoto = () =>
	createSelector(selectAllAttachment, (attachments) => attachments.filter((att) => att.filetype == 'image/png' || att.filetype == 'image/jpeg'));
