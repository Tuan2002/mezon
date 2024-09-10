import { IChannel, IChannelMember, LoadingStatus, RemoveChannelUsers } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/browser';
import memoize from 'memoizee';
import { AddClanUserEvent, ChannelPresenceEvent, ChannelType, StatusPresenceEvent } from 'mezon-js';
import { ChannelUserListChannelUser } from 'mezon-js/dist/api.gen';
import { USERS_CLANS_FEATURE_KEY, UsersClanState } from '../clanMembers/clan.members';
import { DirectEntity, getDirectState } from '../direct/direct.slice';
import { MezonValueContext, ensureSession, ensureSocket, getMezonCtx } from '../helpers';

const CHANNEL_MEMBERS_CACHED_TIME = 1000 * 60 * 3;
export const CHANNEL_MEMBERS_FEATURE_KEY = 'channelMembers';

/*
 * Update these interfaces according to your requirements.
 */
export interface ChannelMembersEntity extends IChannelMember {
	id: string; // Primary ID
	name?: string;
}

export interface ChannelMemberAvatar {
	avatar: string;
	name: string;
}

export interface ChannelMembersState extends EntityState<ChannelMembersEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	currentChannelId?: string | null;
	followingUserIds?: string[];
	onlineStatusUser: Record<string, boolean>;
	customStatusUser: Record<string, string>;
	toFollowUserIds: string[];
	memberChannels: Record<
		string,
		EntityState<ChannelMembersEntity, string> & {
			id: string;
		}
	>;
}

export const mapUserIdToEntity = (userId: string, username: string, online: boolean) => {
	return { username: username, id: userId, online };
};

export interface ChannelMemberRootState {
	[CHANNEL_MEMBERS_FEATURE_KEY]: ChannelMembersState;
}

export const channelMembersAdapter = createEntityAdapter<ChannelMembersEntity>();

const fetchChannelMembersCached = memoize(
	async (mezon: MezonValueContext, clanId: string, channelId: string, channelType: ChannelType) => {
		const response = await mezon.client.listChannelUsers(mezon.session, clanId, channelId, channelType, 1, 2000, '');
		return { ...response, time: Date.now() };
	},
	{
		promise: true,
		maxAge: CHANNEL_MEMBERS_CACHED_TIME,
		normalizer: (args) => {
			return args[1] + args[2] + args[3] + args[0].session.username;
		}
	}
);

type fetchChannelMembersPayload = {
	clanId: string;
	channelId: string;
	noCache?: boolean;
	channelType: ChannelType;
	repace?: boolean;
};

export const fetchChannelMembers = createAsyncThunk(
	'channelMembers/fetchChannelMembers',
	async ({ clanId, channelId, noCache, channelType, repace = false }: fetchChannelMembersPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));

		if (noCache) {
			fetchChannelMembersCached.clear(mezon, clanId, channelId, channelType);
		}

		const response = await fetchChannelMembersCached(mezon, clanId, channelId, channelType);
		// 		old logic: if (Date.now() - response.time < 100) {
		if (!response.channel_users) {
			return [];
		}
		if (repace) {
			thunkAPI.dispatch(channelMembersActions.removeUserByChannel(channelId));
		}

		//TODO:remove
		// thunkAPI.dispatch(channelMembersActions.setManyCustomStatusUser(customStatusInit));

		thunkAPI.dispatch(channelMembersActions.setMemberChannels({ channelId: channelId, members: response.channel_users }));
		return response.channel_users;
	}
);

export const fetchChannelMembersPresence = createAsyncThunk(
	'channelMembers/fetchChannelMembersPresence',
	async (channelPresence: ChannelPresenceEvent, thunkAPI) => {
		if (channelPresence.joins.length > 0) {
			const joinUser = channelPresence.joins[0];
			const userId = joinUser.user_id;
			const channelId = channelPresence.channel_id;
			const state = thunkAPI.getState() as ChannelMemberRootState;
			const existingMember = state[CHANNEL_MEMBERS_FEATURE_KEY].memberChannels[channelId]?.ids?.findIndex((item) => item === userId);
			if (!existingMember) {
				thunkAPI.dispatch(channelMembersActions.addNewMember(channelPresence));
				thunkAPI.dispatch(channelMembersActions.setStatusUser({ userId, status: true }));
				thunkAPI.dispatch(channelMembersActions.setCustomStatusUser({ userId, customStatus: joinUser.status ?? '' }));
			}
		}
	}
);

export const updateStatusUser = createAsyncThunk('channelMembers/fetchUserStatus', async (statusPresence: StatusPresenceEvent, thunkAPI) => {
	if (statusPresence?.leaves?.length) {
		for (const leave of statusPresence.leaves) {
			const userId = leave.user_id;
			thunkAPI.dispatch(channelMembersActions.setStatusUser({ userId, status: false }));
			thunkAPI.dispatch(channelMembersActions.setCustomStatusUser({ userId, customStatus: leave.status }));
		}
	}
	if (statusPresence?.joins?.length) {
		for (const join of statusPresence.joins) {
			const userId = join.user_id;
			thunkAPI.dispatch(channelMembersActions.setStatusUser({ userId, status: true }));
			thunkAPI.dispatch(channelMembersActions.setCustomStatusUser({ userId, customStatus: join.status }));
		}
	}
});

export const removeMemberChannel = createAsyncThunk(
	'channelMembers/removeChannelUser',
	async ({ channelId, userIds, kickMember = true }: RemoveChannelUsers & { kickMember?: boolean }, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			const response = await mezon.client.removeChannelUsers(mezon.session, channelId, userIds);
			if (!response) {
				return;
			}
			if (kickMember) {
				await thunkAPI.dispatch(
					fetchChannelMembers({ clanId: '', channelId: channelId, noCache: true, channelType: ChannelType.CHANNEL_TYPE_TEXT })
				);
				return;
			}

			return true;
		} catch (error) {
			return thunkAPI.rejectWithValue([]);
		}
	}
);

type UpdateCustomStatus = {
	clanId: string;
	customStatus: string;
};

export const updateCustomStatus = createAsyncThunk(
	'channelMembers/updateCustomStatusUser',
	async ({ clanId, customStatus }: UpdateCustomStatus, thunkAPI) => {
		try {
			const mezon = await ensureSocket(getMezonCtx(thunkAPI));
			const response = await mezon.socketRef.current?.writeCustomStatus(clanId, customStatus);
			if (response) {
				return response;
			}
		} catch (e) {
			Sentry.captureException(e);
			console.error('Error updating custom status user', e);
		}
	}
);

export const initialChannelMembersState: ChannelMembersState = channelMembersAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	onlineStatusUser: {},
	toFollowUserIds: [],
	customStatusUser: {},
	memberChannels: {}
});

export type StatusUserArgs = {
	userId: string;
	status: boolean;
};

export type CustomStatusUserArgs = {
	userId: string;
	customStatus: string;
};

export const channelMembers = createSlice({
	name: CHANNEL_MEMBERS_FEATURE_KEY,
	initialState: initialChannelMembersState,
	reducers: {
		add: channelMembersAdapter.addOne,
		remove: (state, action: PayloadAction<{ channelId: string; userId: string }>) => {
			const { channelId, userId } = action.payload;
			const channelEntity = state.memberChannels[channelId];
			state.memberChannels[channelId] = channelMembersAdapter.removeOne(channelEntity, userId);
		},
		removeUserByChannel: (state, action: PayloadAction<string>) => {
			const channelId = action.payload;
			const channelEntity = state.memberChannels[channelId];
			channelMembersAdapter.removeAll(channelEntity);
		},

		removeUserByUserIdAndChannelId: (state, action: PayloadAction<{ userId: string; channelId: string }>) => {
			const { userId, channelId } = action.payload;
			const channelEntity = state.memberChannels[channelId];
			channelMembersAdapter.removeOne(channelEntity, userId);
		},

		setManyCustomStatusUser: (state, action: PayloadAction<CustomStatusUserArgs[]>) => {
			for (const i of action.payload) {
				state.customStatusUser[i.userId] = i.customStatus;
			}
		},
		addUserJoinClan: (state, action: PayloadAction<AddClanUserEvent>) => {
			const { user } = action.payload;
			const channelIds = [
				...new Set(
					Object.values(state.memberChannels).map((channelUser) => {
						return channelUser.id;
					})
				)
			];
			channelIds.forEach((channelId) => {
				state.memberChannels[channelId]?.ids?.push(user.user_id);
			});
		},
		setFollowingUserIds: (state: ChannelMembersState, action: PayloadAction<string[]>) => {
			state.followingUserIds = action.payload;
		},
		setStatusUser: (state, action: PayloadAction<StatusUserArgs>) => {
			state.onlineStatusUser[action.payload.userId] = action.payload.status;
		},

		setCustomStatusUser: (state, action: PayloadAction<CustomStatusUserArgs>) => {
			state.customStatusUser[action.payload.userId] = action.payload.customStatus;
		},
		setMemberChannels: (state, action: PayloadAction<{ channelId: string; members: ChannelUserListChannelUser[] }>) => {
			const { channelId, members } = action.payload;
			if (!state.memberChannels[channelId]) {
				state.memberChannels[channelId] = {
					...channelMembersAdapter.getInitialState(),
					id: channelId
				};
			}
			const memberIds = members.map((member) => member.user_id as string);
			state.memberChannels[channelId] = {
				...state.memberChannels[channelId],
				ids: memberIds
			};
		},
		addNewMember: (state, action: PayloadAction<ChannelPresenceEvent>) => {
			const payload = action.payload;
			const userId = payload.joins[0].user_id;
			const channelId = payload.channel_id;
			state.memberChannels[channelId]?.ids?.push(userId);
		},
		removeUserByUserIdAndClan: (state, action: PayloadAction<{ userId: string; channelIds: string[] }>) => {
			const { userId, channelIds } = action.payload;
			channelIds.forEach((channelId) => {
				state.memberChannels[channelId] && channelMembersAdapter.removeOne(state.memberChannels[channelId], userId);
			});
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchChannelMembers.pending, (state: ChannelMembersState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchChannelMembers.fulfilled, (state: ChannelMembersState, action: PayloadAction<ChannelUserListChannelUser[] | null>) => {
				if (action.payload !== null) {
					state.loadingStatus = 'loaded';
				} else {
					state.loadingStatus = 'not loaded';
				}
			})
			.addCase(fetchChannelMembers.rejected, (state: ChannelMembersState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			})
			.addCase(updateCustomStatus.fulfilled, (state: ChannelMembersState, action) => {
				if (action.payload) {
					state.customStatusUser[action.payload?.user_id] = action.payload.status;
				}
			});
	}
});

export const channelMembersReducer = channelMembers.reducer;

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
 *   dispatch(channelMembersActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const channelMembersActions = {
	...channelMembers.actions,
	fetchChannelMembers,
	fetchChannelMembersPresence,
	updateStatusUser,
	removeMemberChannel,
	updateCustomStatus
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
 * const entities = useSelector(fetchChannelMembers);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectEntities } = channelMembersAdapter.getSelectors();

export const getChannelMembersState = (rootState: { [CHANNEL_MEMBERS_FEATURE_KEY]: ChannelMembersState }): ChannelMembersState => {
	return rootState[CHANNEL_MEMBERS_FEATURE_KEY];
};

const getUsersClanState = (rootState: { [USERS_CLANS_FEATURE_KEY]: UsersClanState }): UsersClanState => rootState[USERS_CLANS_FEATURE_KEY];

export const selectAllChannelMembers = createSelector(
	[
		getChannelMembersState,
		getUsersClanState,
		(state, channelId: string) => {
			const isPrivate = state.channels?.entities[channelId]?.channel_private;
			//Todo: addtion parrent channel is private
			return `${channelId},${isPrivate}`;
		}
	],
	(channelMembersState, getUsersClanState, payload) => {
		const [channelId, isPrivate] = payload.split(',');
		const members =
			isPrivate === 'true'
				? (channelMembersState.memberChannels[channelId]?.ids?.map((memberId) => {
						return {
							...getUsersClanState.entities[memberId],
							channelId,
							userChannelId: channelId
						};
					}) as ChannelMembersEntity[]) || []
				: Object.values(getUsersClanState.entities)?.map((member) => ({
						...member,
						channelId,
						userChannelId: channelId
					}));
		return members;
	}
);

export const selectMemberByGoogleId = (googleId: string) =>
	createSelector(getUsersClanState, (members) => {
		return Object.values(members.entities).find((user) => user.user?.google_id === googleId);
	});

export const selectMemberStatus = createSelector(getChannelMembersState, (state) => state.onlineStatusUser);

export const selectCustomUserStatus = createSelector(getChannelMembersState, (state) => state.customStatusUser);

export const selectMemberIdsByChannelId = createSelector(
	[getChannelMembersState, (state, channelId: string) => channelId],
	(getChannelMembersState, channelId) => {
		return getChannelMembersState?.memberChannels[channelId]?.ids || [];
	}
);

export const selectMemberOnlineStatusById = createSelector(
	[getUsersClanState, (state, userId: string) => userId],
	(getUsersClanState, userId) => getUsersClanState.entities[userId]?.user?.online || false
);

export const selectMemberCustomStatusById = createSelector(
	[selectCustomUserStatus, (state, userId: string) => userId],
	(selectCustomUserStatus, userId) => selectCustomUserStatus?.[userId] || ''
);

export const selectChannelMemberByUserIds = createSelector(
	[
		getUsersClanState,
		getDirectState,
		(state, channelId: string, userIds?: string, isDm?: string) => {
			return `${channelId},${userIds},${isDm}`;
		}
	],
	(usersClanState, directs, payload) => {
		const [channelId, userIds, isDm] = payload.split(',');
		const users = isDm ? directs : usersClanState;
		if (!userIds.trim()) return [];
		return userIds.split('/')?.map((userId) => {
			const userInfo = users.entities[isDm ? channelId : userId];
			if (isDm && userInfo) {
				const { usernames, channel_label } = userInfo as DirectEntity;
				return {
					channelId,
					userChannelId: channelId,
					user: {
						...userInfo,
						username: usernames,
						display_name: channel_label
					},
					id: userInfo.id
				} as ChannelMembersEntity;
			}
			return {
				channelId,
				userChannelId: channelId,
				...userInfo,
				id: userInfo?.id
			} as ChannelMembersEntity;
		});
	}
);

export const selectGrouplMembers = createSelector([getDirectState, (state, groupId: string) => groupId], (directs, groupId) => {
	const group = directs.entities[groupId];
	if (!group?.user_id) {
		return [];
	}
	const groupLabels = group.channel_label?.split(',');
	const groupDisplayNames = group.usernames?.split(',');
	return group?.user_id?.map((userId, index) => {
		return {
			channelId: groupId,
			userChannelId: groupId,
			user: {
				...group,
				avatar_url: group.channel_avatar?.[index],
				username: groupLabels?.[index],
				display_name: groupDisplayNames?.[index],
				online: group.is_online?.[index]
			},
			id: userId
		};
	}) as ChannelMembersEntity[];
});

export const selectMemberStatusById = createSelector(
	[
		getUsersClanState,
		getDirectState,
		(state, userId: string) => {
			return `${userId},${state?.direct.currentDirectMessageId}`;
		}
	],
	(usersClanState, directs, payload) => {
		const [userId, currentDirectMessageId] = payload.split(',');
		const user = usersClanState?.entities[userId] || directs.entities[currentDirectMessageId];
		return user?.user?.online || (user as IChannel)?.is_online?.[0] || false;
	}
);
