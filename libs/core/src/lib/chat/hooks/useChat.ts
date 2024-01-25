import React, { useMemo } from 'react';
import { useChannels } from './useChannels';
import { useChannelMembers } from './useChannelMembers';
import { useMessages } from './useMessages';
import { useThreads } from './useThreads';
import { useSelector } from 'react-redux';
import {
  selectChannelsEntities,
  selectCurrentChannel,
  selectCurrentChannelId,
  selectCurrentClanId,
  clansActions,
  channelsActions,
  messagesActions,
  selectCurrentClan,
  selectClansEntities,
  useAppDispatch,
  ClansEntity,
  selectAllClans,
  selectAllCategories,
  selectAllAccount,
} from '@mezon/store';
import { ICategoryChannel, IChannel, IMessage } from '@mezon/utils';
import { useMezon } from '@mezon/transport';
import { checkMessageSendingAction } from '@mezon/store';
import {
  ApiInviteUserRes,
  ApiLinkInviteUser,
} from 'vendors/mezon-js/packages/mezon-js/dist/api.gen';

export function useChat() {
  const { clientRef, sessionRef, socketRef, channelRef } = useMezon();
  const { channels } = useChannels();
  // const { clans } = useClans();
  const { threads } = useThreads();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ChannelsEntities = useSelector(selectChannelsEntities);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const chanEntities = useSelector(selectClansEntities);
  const clans = useSelector(selectAllClans);
  const currentClan = useSelector(selectCurrentClan);
  const currentChanel = useSelector(selectCurrentChannel);
  const currentChannelId = useSelector(selectCurrentChannelId);
  const currentClanId = useSelector(selectCurrentClanId);
  const categories = useSelector(selectAllCategories);
  const { messages } = useMessages({ channelId: currentChannelId });
  const { members } = useChannelMembers({ channelId: currentChannelId });
  const { userProfile } = useSelector(selectAllAccount);

  const client = clientRef.current;

  const dispatch = useAppDispatch();

  const categorizedChannels = React.useMemo(() => {
    const results = categories.map((category) => {
      const categoryChannels = channels.filter(
        (channel) => channel && channel?.category_id === category.id,
      ) as IChannel[];
      return {
        ...category,
        channels: categoryChannels,
      };
    });

    return results as ICategoryChannel[];
  }, [channels, categories]);

  const changeCurrentChannel = React.useCallback(
    async (channelId: string) => {
      await dispatch(channelsActions.joinChanel(channelId));
    },
    [dispatch],
  );

  const changeCurrentClan = React.useCallback(
    async (clanId: string) => {
      await dispatch(clansActions.changeCurrentClan(clanId));
    },
    [dispatch],
  );

  const createClans = React.useCallback(
    async (name: string, logoUrl: string) => {
      const action = await dispatch(
        clansActions.createClan({ clan_name: name, logo: logoUrl }),
      );
      const payload = action.payload as ClansEntity;
      if (payload && payload.clan_id) {
        changeCurrentClan(payload.clan_id);
      }
      return payload;
    },
    [changeCurrentClan, dispatch],
  );

  const createLinkInviteUser = React.useCallback(
    async (clan_id: string, channel_id: string, expiry_time: number) => {
      const action = await dispatch(
        clansActions.createLinkInviteUser({
          clan_id: clan_id,
          channel_id: channel_id,
          expiry_time: expiry_time,
        }),
      );
      const payload = action.payload as ApiLinkInviteUser;
      return payload;
    },
    [dispatch],
  );

  const inviteUser = React.useCallback(
    async (invite_id: string) => {
      const action = await dispatch(
        clansActions.inviteUser({ inviteId: invite_id }),
      );
      const payload = action.payload as ApiInviteUserRes;
      return payload;
    },
    [dispatch],
  );

  const sendMessage = React.useCallback(
    async (message: IMessage) => {
      // TODO: send message to server using nakama client
      const session = sessionRef.current;
      const client = clientRef.current;
      const socket = socketRef.current;
      const channel = channelRef.current;

      if (!client || !session || !socket || !channel || !currentClanId) {
        console.log(client, session, socket, channel, currentClanId);
        throw new Error('Client is not initialized');
      }

      const payload = {
        ...message,
        id: Math.random().toString(),
        date: new Date().toLocaleString(),
        user: {
          name: userProfile?.user?.username || '',
          username: session.username || '',
          id: 'myself',
          avatarSm:
            userProfile?.user?.avatar_url ||
            'https://cdn.pixabay.com/photo/2016/11/18/23/38/child-1837375_640.png',
        },
      };
      if (!payload.channel_id) {
        payload.channel_id = currentChannelId || '';
      }
      dispatch(messagesActions.add(payload));
      const ack = await socket.writeChatMessage(
        currentClanId,
        channel.id,
        payload,
      );
      ack && dispatch(checkMessageSendingAction());
    },
    [
      channelRef,
      clientRef,
      currentChannelId,
      currentClanId,
      dispatch,
      sessionRef,
      socketRef,
      userProfile?.user?.avatar_url,
      userProfile?.user?.username,
    ],
  );

  return useMemo(
    () => ({
      client,
      channels,
      messages,
      clans,
      threads,
      categorizedChannels,
      members,
      currentClan,
      currentChanel,
      userProfile,
      sendMessage,
      changeCurrentClan,
      changeCurrentChannel,
      createClans,
      createLinkInviteUser,
      inviteUser,
      currentClanId
    }),
    [
      client,
      channels,
      messages,
      clans,
      threads,
      categorizedChannels,
      members,
      currentClan,
      currentChanel,
      userProfile,
      sendMessage,
      changeCurrentClan,
      changeCurrentChannel,
      createClans,
      createLinkInviteUser,
      inviteUser,
      currentClanId
    ],
  );
}
