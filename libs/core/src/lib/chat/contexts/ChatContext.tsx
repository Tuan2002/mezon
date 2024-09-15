import {
	channelMembers,
	channelMembersActions,
	channelMetaActions,
	channelsActions,
	channelsSlice,
	clansSlice,
	directActions,
	directMetaActions,
	directSlice,
	eventManagementActions,
	fetchChannelMembers,
	fetchDirectMessage,
	fetchListFriends,
	fetchMessages,
	friendsActions,
	listChannelsByUserActions,
	mapMessageChannelToEntity,
	mapNotificationToEntity,
	mapReactionToEntity,
	messagesActions,
	notificationActions,
	pinMessageActions,
	reactionActions,
	selectChannelsByClanId,
	selectCurrentChannel,
	selectCurrentChannelId,
	selectCurrentClanId,
	selectDmGroupCurrentId,
	selectModeResponsive,
	toastActions,
	useAppDispatch,
	useAppSelector,
	usersClanActions,
	voiceActions
} from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { ModeResponsive, NotificationCode } from '@mezon/utils';
import debounce from 'lodash.debounce';
import {
	AddClanUserEvent,
	ChannelCreatedEvent,
	ChannelDeletedEvent,
	ChannelMessage,
	ChannelPresenceEvent,
	ChannelStreamMode,
	ChannelType,
	ChannelUpdatedEvent,
	ClanDeletedEvent,
	ClanProfileUpdatedEvent,
	CustomStatusEvent,
	LastPinMessageEvent,
	MessageTypingEvent,
	Notification,
	Socket,
	StatusPresenceEvent,
	StreamPresenceEvent,
	UserChannelAddedEvent,
	UserChannelRemovedEvent,
	UserClanRemovedEvent,
	VoiceJoinedEvent,
	VoiceLeavedEvent
} from 'mezon-js';
import { ApiCreateEventRequest, ApiMessageReaction } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAppParams } from '../../app/hooks/useAppParams';
import { useAuth } from '../../auth/hooks/useAuth';
import { useSeenMessagePool } from '../hooks/useSeenMessagePool';

type ChatContextProviderProps = {
	children: React.ReactNode;
};

export type ChatContextValue = {
	setCallbackEventFn: (socket: Socket) => void;
};

const ChatContext = React.createContext<ChatContextValue>({} as ChatContextValue);

const ChatContextProvider: React.FC<ChatContextProviderProps> = ({ children }) => {
	const { socketRef, reconnect } = useMezon();
	const { userId } = useAuth();
	const currentChannel = useSelector(selectCurrentChannel);
	const { directId, channelId, clanId } = useAppParams();
	const { initWorker, unInitWorker } = useSeenMessagePool();
	const dispatch = useAppDispatch();
	const currentClanId = useSelector(selectCurrentClanId);
	const currentDirectId = useSelector(selectDmGroupCurrentId);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const modeResponsive = useSelector(selectModeResponsive);
	const channels = useAppSelector(selectChannelsByClanId(clanId as string));
	const navigate = useNavigate();

	const clanIdActive = useMemo(() => {
		if (clanId !== undefined || currentClanId) {
			return currentClanId;
		} else {
			return '0';
		}
	}, [clanId, currentClanId]);

	const onvoicejoined = useCallback(
		(voice: VoiceJoinedEvent) => {
			if (voice) {
				dispatch(
					voiceActions.add({
						...voice
					})
				);
			}
		},
		[dispatch]
	);

	const onvoiceleaved = useCallback(
		(voice: VoiceLeavedEvent) => {
			dispatch(voiceActions.remove(voice.id));
		},
		[dispatch]
	);

	const onchannelmessage = useCallback(
		async (message: ChannelMessage) => {
			const senderId = message.sender_id;
			const timestamp = Date.now() / 1000;
			const mess = mapMessageChannelToEntity(message);
			mess.isMe = senderId === userId;
			const isMobile = directId === undefined && channelId === undefined;

			mess.isCurrentChannel = message.channel_id === directId || (isMobile && message.channel_id === currentDirectId);

			if ((directId === undefined && !isMobile) || (isMobile && !currentDirectId)) {
				const idToCompare = !isMobile ? channelId : currentChannelId;
				mess.isCurrentChannel = message.channel_id === idToCompare;
			}
			dispatch(messagesActions.addNewMessage(mess));
			if (mess.mode === ChannelStreamMode.STREAM_MODE_DM || mess.mode === ChannelStreamMode.STREAM_MODE_GROUP) {
				dispatch(directActions.openDirectMessage({ channelId: message.channel_id, clanId: message.clan_id || '' }));
				dispatch(directMetaActions.updateDMSocket(message));
				dispatch(directMetaActions.setDirectLastSentTimestamp({ channelId: message.channel_id, timestamp }));
				dispatch(directMetaActions.setCountMessUnread({ channelId: message.channel_id }));
			} else {
				dispatch(channelMetaActions.setChannelLastSentTimestamp({ channelId: message.channel_id, timestamp }));
			}
			dispatch(listChannelsByUserActions.updateLastSentTime({ channelId: message.channel_id }));
			dispatch(notificationActions.setIsMessageRead(true));
			// remove: setChannelLastSentTimestamp for fix re-render currentChannel when receive new message
			// dispatch(channelsActions.updateChannelThreadSocket({ ...message, timestamp }));
		},
		[userId, directId, currentDirectId, dispatch, channelId, currentChannelId]
	);

	const onchannelpresence = useCallback(
		(channelPresence: ChannelPresenceEvent) => {
			dispatch(channelMembersActions.fetchChannelMembersPresence(channelPresence));
		},
		[dispatch]
	);

	const onstreampresence = useCallback(
		(channelStreamPresence: StreamPresenceEvent) => {
			if (channelStreamPresence.joins.length > 0) {
				const onlineStatus = channelStreamPresence.joins.map((join) => {
					return { userId: join.user_id, status: true };
				});
				dispatch(usersClanActions.setManyStatusUser(onlineStatus));
			}
			if (channelStreamPresence.leaves.length > 0) {
				const offlineStatus = channelStreamPresence.leaves.map((leave) => {
					return { userId: leave.user_id, status: false };
				});
				dispatch(usersClanActions.setManyStatusUser(offlineStatus));
			}
		},
		[dispatch]
	);

	const onstatuspresence = useCallback(
		(statusPresence: StatusPresenceEvent) => {
			dispatch(channelMembersActions.updateStatusUser(statusPresence));
		},
		[dispatch]
	);

	const onnotification = useCallback(
		async (notification: Notification) => {
			if (currentChannel?.channel_id !== (notification as any).channel_id && (notification as any).clan_id !== '0') {
				dispatch(notificationActions.add(mapNotificationToEntity(notification)));
				dispatch(notificationActions.setNotiListUnread(mapNotificationToEntity(notification)));
				dispatch(notificationActions.setStatusNoti());
			}
			if (currentChannel?.channel_id === (notification as any).channel_id) {
				const timestamp = Date.now() / 1000;
				dispatch(channelMetaActions.setChannelLastSeenTimestamp({ channelId: (notification as any).channel_id, timestamp: timestamp }));
			}

			if (notification.code === NotificationCode.FRIEND_REQUEST || notification.code === NotificationCode.FRIEND_ACCEPT) {
				dispatch(toastActions.addToast({ message: notification.subject, type: 'info', id: 'ACTION_FRIEND' }));
				dispatch(friendsActions.fetchListFriends({ noCache: true }));
			}
		},
		[currentChannel?.channel_id, dispatch]
	);

	const onpinmessage = useCallback(
		(pin: LastPinMessageEvent) => {
			if (pin.operation === 1) {
				dispatch(pinMessageActions.fetchChannelPinMessages({ channelId: currentChannel?.channel_id ?? '', noCache: true }));
			}
			if (pin.operation === 0) {
				dispatch(channelMetaActions.setChannelLastSeenPinMessage({ channelId: pin.channel_id, lastSeenPinMess: pin.message_id }));
			}
		},
		[currentChannel?.channel_id, dispatch]
	);

	const onuserchannelremoved = useCallback(
		(user: UserChannelRemovedEvent) => {
			user?.user_ids.forEach((userID: any) => {
				if (userID === userId) {
					if (channelId === user.channel_id) {
						navigate(`/chat/clans/${clanId}`);
					}
					if (directId === user.channel_id) {
						navigate(`/chat/direct/friends`);
					}
					dispatch(directSlice.actions.removeByDirectID(user.channel_id));
					dispatch(channelsSlice.actions.removeByChannelID(user.channel_id));
					dispatch(listChannelsByUserActions.fetchListChannelsByUser());
				} else {
					dispatch(channelMembers.actions.remove({ userId: userID, channelId: user.channel_id }));
					if (user.channel_type === ChannelType.CHANNEL_TYPE_GROUP) {
						dispatch(fetchDirectMessage({ noCache: true }));
						dispatch(
							fetchChannelMembers({
								clanId: '',
								channelId: directId || '',
								noCache: true,
								channelType: ChannelType.CHANNEL_TYPE_GROUP
							})
						);
					}
				}
			});
		},
		[channelId, clanId, dispatch, navigate, userId, directId]
	);
	const onuserclanremoved = useCallback(
		(user: UserClanRemovedEvent) => {
			user?.user_ids.forEach((id: any) => {
				if (id === userId) {
					if (clanId === user.clan_id) {
						navigate(`/chat/direct/friends`);
					}
					dispatch(clansSlice.actions.removeByClanID(user.clan_id));
					dispatch(listChannelsByUserActions.fetchListChannelsByUser());
				} else {
					dispatch(
						channelMembers.actions.removeUserByUserIdAndClan({
							userId: id,
							channelIds: channels.map((item) => item.id),
							clanId: user.clan_id
						})
					);
					dispatch(usersClanActions.remove(id));
				}
			});
		},
		[userId, clanId, navigate, dispatch]
	);

	const onuserchanneladded = useCallback(
		(userAdds: UserChannelAddedEvent) => {
			const user = userAdds.users.find((user: any) => user.user_id === userId);
			if (user) {
				if (userAdds.channel_type === ChannelType.CHANNEL_TYPE_DM || userAdds.channel_type === ChannelType.CHANNEL_TYPE_GROUP) {
					dispatch(fetchDirectMessage({ noCache: true }));
					dispatch(fetchMessages({ channelId: userAdds?.channel_id, noCache: false, isFetchingLatestMessages: false }));
				}
				if (userAdds.channel_type === ChannelType.CHANNEL_TYPE_TEXT) {
					dispatch(channelsActions.fetchChannels({ clanId: userAdds.clan_id, noCache: true }));
					dispatch(listChannelsByUserActions.fetchListChannelsByUser());
				}
				if (userAdds.channel_type !== ChannelType.CHANNEL_TYPE_VOICE) {
					dispatch(
						channelsActions.joinChat({
							clanId: userAdds.clan_id,
							parentId: userAdds.parent_id,
							channelId: userAdds.channel_id,
							channelType: userAdds.channel_type,
							isPublic: userAdds.is_public,
							isParentPublic: userAdds.is_parent_public
						})
					);
				}
			} else {
				if (clanIdActive === userAdds.clan_id) {
					const members = userAdds?.users
						.filter((user) => user?.user_id)
						.map((user) => ({
							id: user.user_id,
							user: {
								...user,
								avatar_url: user.avatar,
								id: user.user_id,
								about_me: user.about_me,
								display_name: user.display_name,
								metadata: user.custom_status,
								username: user.username,
								create_time: new Date(user.create_time_second * 1000).toISOString()
							}
						}));
					dispatch(usersClanActions.upsertMany(members));
				}

				dispatch(
					channelMembersActions.fetchChannelMembers({
						clanId: userAdds.clan_id || '',
						channelId: userAdds.channel_id,
						noCache: true,
						channelType: userAdds.channel_type
					})
				);
				if (userAdds.channel_type === ChannelType.CHANNEL_TYPE_GROUP || userAdds.channel_type === ChannelType.CHANNEL_TYPE_GROUP) {
					dispatch(fetchDirectMessage({ noCache: true }));
					dispatch(fetchListFriends({ noCache: true }));
				}
			}
		},
		[userId, dispatch]
	);

	const onuserclanadded = useCallback(
		(userJoinClan: AddClanUserEvent) => {
			if (modeResponsive === ModeResponsive.MODE_DM || currentChannel?.channel_private) {
				return;
			}
			// dispatch(listChannelsByUserActions.fetchListChannelsByUser());
			if (userJoinClan?.user && clanIdActive === userJoinClan.clan_id) {
				const createTime = new Date(userJoinClan.user.create_time_second * 1000).toISOString();
				dispatch(
					usersClanActions.add({
						...userJoinClan,
						id: userJoinClan.user.user_id,
						user: {
							...userJoinClan.user,
							avatar_url: userJoinClan.user.avatar,
							id: userJoinClan.user.user_id,
							about_me: userJoinClan.user.about_me,
							display_name: userJoinClan.user.display_name,
							metadata: userJoinClan.user.custom_status,
							username: userJoinClan.user.username,
							create_time: createTime
						}
					})
				);
			}
		},
		[clanIdActive, currentChannel?.channel_private, dispatch]
	);

	const onclanprofileupdated = useCallback(
		(ClanProfileUpdates: ClanProfileUpdatedEvent) => {
			dispatch(
				usersClanActions.updateUserChannel({
					userId: ClanProfileUpdates.user_id,
					clanId: ClanProfileUpdates.clan_id,
					clanNick: ClanProfileUpdates.clan_nick,
					clanAvt: ClanProfileUpdates.clan_avatar
				})
			);
			dispatch(
				messagesActions.updateUserMessage({
					userId: ClanProfileUpdates.user_id,
					clanId: ClanProfileUpdates.clan_id,
					clanNick: ClanProfileUpdates.clan_nick,
					clanAvt: ClanProfileUpdates.clan_avatar
				})
			);
			dispatch(
				usersClanActions.updateUserClan({
					userId: ClanProfileUpdates.user_id,
					clanNick: ClanProfileUpdates.clan_nick,
					clanAvt: ClanProfileUpdates.clan_avatar
				})
			);
		},
		[dispatch]
	);

	const oncustomstatus = useCallback(
		(statusEvent: CustomStatusEvent) => {
			dispatch(channelMembersActions.setCustomStatusUser({ userId: statusEvent.user_id, customStatus: statusEvent.status }));
		},
		[dispatch]
	);

	const onerror = useCallback(
		(event: unknown) => {
			dispatch(toastActions.addToast({ message: 'Socket connection failed', type: 'error', id: 'SOCKET_CONNECTION_ERROR' }));
		},
		[dispatch]
	);

	const onmessagetyping = useCallback(
		(e: MessageTypingEvent) => {
			dispatch(
				messagesActions.updateTypingUsers({
					channelId: e.channel_id,
					userId: e.sender_id,
					isTyping: true
				})
			);
		},
		[dispatch, userId]
	);

	const onmessagereaction = useCallback(
		(e: ApiMessageReaction) => {
			console.log('------');
			console.log('e - Reaction:', e);
			if (e.count > 0) {
				dispatch(reactionActions.setReactionDataSocket(mapReactionToEntity(e)));
			}
		},
		[dispatch]
	);

	const onchannelcreated = useCallback(
		(channelCreated: ChannelCreatedEvent) => {
			if (channelCreated && channelCreated.channel_private === 0) {
				dispatch(channelsActions.createChannelSocket(channelCreated));
				dispatch(listChannelsByUserActions.fetchListChannelsByUser());
				if (channelCreated.channel_type !== ChannelType.CHANNEL_TYPE_VOICE) {
					dispatch(
						channelsActions.joinChat({
							clanId: channelCreated.clan_id,
							parentId: channelCreated.parent_id,
							channelId: channelCreated.channel_id,
							channelType: channelCreated.channel_type,
							isPublic: !channelCreated.channel_private,
							isParentPublic: channelCreated.is_parent_public
						})
					);
				}
			}
		},
		[dispatch]
	);

	const onclandeleted = useCallback(
		(clanDelete: ClanDeletedEvent) => {
			dispatch(listChannelsByUserActions.fetchListChannelsByUser());
			if (clanDelete.deletor !== userId && currentClanId === clanDelete.clan_id) {
				navigate(`/chat/direct/friends`);
				dispatch(clansSlice.actions.removeByClanID(clanDelete.clan_id));
				dispatch(listChannelsByUserActions.fetchListChannelsByUser());
			}
		},
		[currentClanId, dispatch, navigate, userId]
	);

	const onchanneldeleted = useCallback(
		(channelDeleted: ChannelDeletedEvent) => {
			if (channelDeleted) {
				dispatch(channelsActions.deleteChannelSocket(channelDeleted));
				dispatch(listChannelsByUserActions.fetchListChannelsByUser());
			}
		},
		[dispatch]
	);

	const onchannelupdated = useCallback(
		(channelUpdated: ChannelUpdatedEvent) => {
			if (channelUpdated.is_error) {
				return dispatch(channelsActions.deleteChannel({ channelId: channelUpdated.channel_id, clanId: channelUpdated.clan_id as string }));
			}
			if (channelUpdated) {
				if (channelUpdated.channel_label === '') {
					dispatch(channelsActions.updateChannelPrivateSocket(channelUpdated));
					if (channelUpdated.creator_id !== userId) {
						dispatch(channelsActions.fetchChannels({ clanId: channelUpdated.clan_id, noCache: true }));
						dispatch(listChannelsByUserActions.fetchListChannelsByUser());
					}
				} else {
					dispatch(channelsActions.updateChannelSocket(channelUpdated));
				}
			}
		},
		[dispatch, userId]
	);

	const oneventcreated = useCallback(
		(eventCreatedEvent: ApiCreateEventRequest) => {
			dispatch(eventManagementActions.updateStatusEvent(eventCreatedEvent));
		},
		[dispatch]
	);

	const setCallbackEventFn = React.useCallback(
		(socket: Socket) => {
			socket.onvoicejoined = onvoicejoined;

			socket.onvoiceleaved = onvoiceleaved;

			socket.onchannelmessage = onchannelmessage;

			socket.onchannelpresence = onchannelpresence;

			socket.onstreampresence = onstreampresence;

			socket.ondisconnect = ondisconnect;

			socket.onerror = onerror;

			socket.onmessagetyping = onmessagetyping;

			socket.onmessagereaction = onmessagereaction;

			socket.onnotification = onnotification;

			socket.onpinmessage = onpinmessage;

			socket.onuserchannelremoved = onuserchannelremoved;

			socket.onuserclanremoved = onuserclanremoved;

			socket.onclandeleted = onclandeleted;

			socket.onuserchanneladded = onuserchanneladded;

			socket.onuserclanadded = onuserclanadded;

			socket.onclanprofileupdated = onclanprofileupdated;

			socket.oncustomstatus = oncustomstatus;

			socket.onstatuspresence = onstatuspresence;

			socket.onchannelcreated = onchannelcreated;

			socket.onchanneldeleted = onchanneldeleted;

			socket.onchannelupdated = onchannelupdated;

			socket.oneventcreated = oneventcreated;

			socket.onheartbeattimeout = onHeartbeatTimeout;
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			onchannelcreated,
			onchanneldeleted,
			onchannelmessage,
			onchannelpresence,
			onchannelupdated,
			onerror,
			onmessagereaction,
			onmessagetyping,
			onnotification,
			onpinmessage,
			onuserchannelremoved,
			onuserclanremoved,
			onclandeleted,
			onuserchanneladded,
			onuserclanadded,
			onclanprofileupdated,
			oncustomstatus,
			onstatuspresence,
			onvoicejoined,
			onvoiceleaved,
			oneventcreated
		]
	);

	const handleReconnect = useCallback(
		async (socketType: string) => {
			dispatch(toastActions.addToast({ message: socketType, type: 'error', id: 'SOCKET_CONNECTION_ERROR' }));
			const errorMessage = 'Cannot reconnect to the socket. Please restart the app.';
			try {
				const socket = await reconnect(clanIdActive ?? '');
				if (!socket) {
					dispatch(toastActions.addToast({ message: errorMessage, type: 'error', id: 'SOCKET_CONNECTION_NULL' }));
					return;
				}
				setCallbackEventFn(socket as Socket);
			} catch (error) {
				dispatch(toastActions.addToast({ message: errorMessage, type: 'warning', id: 'SOCKET_CONNECTION_WARN' }));
			}
		},
		[dispatch, clanIdActive, reconnect, setCallbackEventFn]
	);

	const ondisconnect = useCallback(
		debounce(() => {
			handleReconnect('Socket disconnected');
		}, 300),
		[handleReconnect]
	);

	const onHeartbeatTimeout = useCallback(
		debounce(() => {
			handleReconnect('Socket hearbeat timeout');
		}, 300),
		[handleReconnect]
	);

	useEffect(() => {
		const socket = socketRef.current;
		if (!socket) return;
		setCallbackEventFn(socket);

		return () => {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onchannelmessage = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onchannelpresence = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onnotification = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onnotification = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onpinmessage = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.oncustomstatus = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onstatuspresence = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.ondisconnect = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onuserchannelremoved = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onuserclanremoved = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onclandeleted = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onuserchanneladded = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onuserclanadded = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onclanprofileupdated = () => {};
		};
	}, [
		onchannelmessage,
		onchannelpresence,
		ondisconnect,
		onmessagetyping,
		onmessagereaction,
		onnotification,
		onpinmessage,
		onuserchannelremoved,
		onuserclanremoved,
		onclandeleted,
		onuserchanneladded,
		onuserclanadded,
		onclanprofileupdated,
		oncustomstatus,
		onstatuspresence,
		socketRef,
		onvoicejoined,
		onvoiceleaved,
		onerror,
		onchannelcreated,
		onchanneldeleted,
		onchannelupdated,
		onHeartbeatTimeout,
		oneventcreated,
		setCallbackEventFn
	]);

	useEffect(() => {
		initWorker();
		return () => {
			unInitWorker();
		};
	}, [initWorker, unInitWorker]);

	const value = React.useMemo<ChatContextValue>(
		() => ({
			// add logic code
			setCallbackEventFn
		}),
		[setCallbackEventFn]
	);

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

const ChatContextConsumer = ChatContext.Consumer;

export { ChatContext, ChatContextConsumer, ChatContextProvider };
