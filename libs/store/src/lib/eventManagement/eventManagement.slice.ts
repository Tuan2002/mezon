import { captureSentryError } from '@mezon/logger';
import { EEventStatus, IEventManagement, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ApiEventManagement, ApiUpdateEventRequest } from 'mezon-js/api.gen';
import { MezonValueContext, ensureSession, getMezonCtx } from '../helpers';
import { memoizeAndTrack } from '../memoize';

export const EVENT_MANAGEMENT_FEATURE_KEY = 'eventmanagement';

export interface EventManagementEntity extends IEventManagement {
	id: string;
	status?: string;
}

export const eventManagementAdapter = createEntityAdapter<EventManagementEntity>();

const EVENT_MANAGEMENT_CACHED_TIME = 1000 * 60 * 3;
const fetchEventManagementCached = memoizeAndTrack((mezon: MezonValueContext, clanId: string) => mezon.client.listEvents(mezon.session, clanId), {
	promise: true,
	maxAge: EVENT_MANAGEMENT_CACHED_TIME,
	normalizer: (args) => {
		return args[1] + args[0].session.username;
	}
});

export const mapEventManagementToEntity = (eventRes: ApiEventManagement, clanId?: string) => {
	return { ...eventRes, id: eventRes.id || '' };
};

type fetchEventManagementPayload = {
	clanId: string;
	noCache?: boolean;
};

export const fetchEventManagement = createAsyncThunk(
	'eventManagement/fetchEventManagement',
	async ({ clanId, noCache }: fetchEventManagementPayload, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));

			if (noCache) {
				fetchEventManagementCached.clear(mezon, clanId);
			}

			const response = await fetchEventManagementCached(mezon, clanId);

			if (!response.events) {
				return [];
			}

			const events = response.events.map((eventRes) => mapEventManagementToEntity(eventRes, clanId));
			return events;
		} catch (error) {
			captureSentryError(error, 'eventManagement/fetchEventManagement');
			return thunkAPI.rejectWithValue(error);
		}
	}
);

type CreateEventManagementpayload = {
	clan_id: string;
	channel_id: string;
	address: string;
	title: string;
	start_time: string;
	end_time: string;
	description: string;
	logo: string;
};

export type UpdateEventManagementPayload = {
	event_id: string;
	clan_id: string;
	channel_id: string;
	address: string;
	title: string;
	start_time: string;
	end_time: string;
	description: string;
	logo: string;
};

export type EventManagementOnGogoing = {
	address: string;
	channel_id: string;
	clan_id: string;
	description: string;
	end_time: Date;
	event_id: string;
	event_status: string;
	logo: string;
	start_time: Date;
	title: string;
};

export const fetchCreateEventManagement = createAsyncThunk(
	'CreatEventManagement/fetchCreateEventManagement',
	async ({ clan_id, channel_id, address, title, start_time, end_time, description, logo }: CreateEventManagementpayload, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			const body = {
				clan_id: clan_id,
				channel_id: channel_id || '',
				address: address || '',
				title: title,
				start_time: start_time,
				end_time: end_time,
				description: description || '',
				logo: logo || ''
			};
			const response = await mezon.client.createEvent(mezon.session, body);
			if (response) {
				thunkAPI.dispatch(fetchEventManagement({ clanId: clan_id, noCache: true }));
			} else {
				return thunkAPI.rejectWithValue([]);
			}
			return response;
		} catch (error) {
			captureSentryError(error, 'CreatEventManagement/fetchCreateEventManagement');
			return thunkAPI.rejectWithValue(error);
		}
	}
);

type fetchDeleteEventManagementPayload = {
	eventID: string;
	clanId: string;
};

export const updateEventManagement = createAsyncThunk(
	'updateEventManagement/updateEventManagement',
	async ({ event_id, clan_id, channel_id, address, title, start_time, end_time, description, logo }: UpdateEventManagementPayload, thunkAPI) => {
		try {
			const body: ApiUpdateEventRequest = {
				address: address,
				channel_id: channel_id,
				event_id: event_id,
				description: description,
				end_time: end_time,
				logo: logo,
				start_time: start_time,
				title: title,
				clan_id: clan_id
			};

			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			const response = await mezon.client.updateEvent(mezon.session, event_id, body);
			if (response) {
				thunkAPI.dispatch(fetchEventManagement({ clanId: body.clan_id || '', noCache: true }));
			}
		} catch (error) {
			captureSentryError(error, 'updateEventManagement/updateEventManagement');
			return thunkAPI.rejectWithValue(error);
		}
	}
);

export const fetchDeleteEventManagement = createAsyncThunk(
	'deleteEventManagement/fetchDeleteEventManagement',
	async (body: fetchDeleteEventManagementPayload, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			const response = await mezon.client.deleteEvent(mezon.session, body.eventID, body.clanId);
			if (response) {
				thunkAPI.dispatch(fetchEventManagement({ clanId: body.clanId, noCache: true }));
			}
		} catch (error) {
			captureSentryError(error, 'deleteEventManagement/fetchDeleteEventManagement');
			return thunkAPI.rejectWithValue(error);
		}
	}
);

export interface EventManagementState extends EntityState<EventManagementEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	chooseEvent: EventManagementEntity | null;
	ongoingEvent: EventManagementOnGogoing | null;
}

export const initialEventManagementState: EventManagementState = eventManagementAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	chooseEvent: null,
	ongoingEvent: null
});

export const eventManagementSlice = createSlice({
	name: EVENT_MANAGEMENT_FEATURE_KEY,
	initialState: initialEventManagementState,
	reducers: {
		add: eventManagementAdapter.addOne,
		addMany: eventManagementAdapter.addMany,
		remove: eventManagementAdapter.removeOne,
		clearEntities: (state) => {
			eventManagementAdapter.removeAll(state);
		},
		setChooseEvent: (state, action) => {
			state.chooseEvent = action.payload;
		},
		updateStatusEvent: (state, action) => {
			eventManagementAdapter.updateOne(state, {
				id: action.payload.event_id,
				changes: {
					status: action.payload.event_status
				}
			});

			if (action.payload.event_status === EEventStatus.COMPLETED && state.ongoingEvent?.event_id === action.payload.event_id) {
				state.ongoingEvent = null;
			}
		},
		clearOngoingEvent: (state, action) => {
			state.ongoingEvent = null;
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchEventManagement.pending, (state: EventManagementState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchEventManagement.fulfilled, (state: EventManagementState, action: PayloadAction<any>) => {
				eventManagementAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchEventManagement.rejected, (state: EventManagementState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

export const eventManagementReducer = eventManagementSlice.reducer;

export const eventManagementActions = {
	...eventManagementSlice.actions,
	fetchEventManagement,
	fetchCreateEventManagement,
	fetchDeleteEventManagement,
	updateEventManagement
};

const { selectAll, selectEntities } = eventManagementAdapter.getSelectors();

export const getEventManagementState = (rootState: { [EVENT_MANAGEMENT_FEATURE_KEY]: EventManagementState }): EventManagementState =>
	rootState[EVENT_MANAGEMENT_FEATURE_KEY];

export const selectAllEventManagement = createSelector(getEventManagementState, selectAll);

export const selectEventManagementEntities = createSelector(getEventManagementState, selectEntities);

export const selectNumberEvent = createSelector(selectAllEventManagement, (events) => events.length);

export const selectChooseEvent = createSelector(getEventManagementState, (state) => state.chooseEvent);

export const selectOngoingEvent = createSelector(getEventManagementState, (state) => state.ongoingEvent);

export const selectEventById = (eventId: string) =>
	createSelector(getEventManagementState, (state) => {
		const entities = selectEventManagementEntities({ eventmanagement: state });
		return entities[eventId] || null;
	});
