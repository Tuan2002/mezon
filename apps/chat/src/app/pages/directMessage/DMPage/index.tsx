import {
	ChannelList,
	ChannelTopbar,
	FooterProfile,
	MemberList,
	ServerHeader,
	DirectMessageBox,
	DmTopbar,
	MemberListGroupChat,
} from '@mezon/components';
import { useAppNavigation, useAppParams, useChatChannel } from '@mezon/core';
import { RootState, selectDefaultChannelIdByClanId, selectDmGroupCurrent } from '@mezon/store';
import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import ChannelMessages from '../../channel/ChanneMessages';
import { ChannelTypeEnum, IChannel } from '@mezon/utils';

export function DirectMessage() {
	const isSending = useSelector((state: RootState) => state.messages.isSending);

	const { serverId, directId, type } = useAppParams();
	const defaultChannelId = useSelector(selectDefaultChannelIdByClanId(serverId || ''));
	const { navigate } = useAppNavigation();

	useEffect(() => {
		if (defaultChannelId) {
			navigate(`./${defaultChannelId}`);
		}
	}, [defaultChannelId, navigate]);
	const { messages } = useChatChannel(directId ?? '');

	const messagesContainerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
		}
	}, [isSending, [], messages]);


	return (
		<div className="flex flex-col flex-1 shrink min-w-0 bg-bgSecondary h-[100%]">
			<DmTopbar dmGroupId={directId} />
			<div className="flex h-heightWithoutTopBar flex-row ">
				<div className="flex flex-col flex-1 w-full h-full">
					<div className="overflow-y-auto bg-[#1E1E1E]  max-h-heightMessageViewChat h-heightMessageViewChat" ref={messagesContainerRef}>
						{<ChannelMessages channelId={directId ?? ''} />}
					</div>
					<div className="flex-shrink-0 flex flex-col bg-[#1E1E1E] h-auto">
						<DirectMessageBox directParamId={directId ?? ''} />
					</div>
				</div>
				{Number(type) === ChannelTypeEnum.GROUP_CHAT && (
					<div className="w-[268px] bg-bgSurface  lg:flex hidden">
						<MemberListGroupChat directMessageId={directId} />
					</div>
				)}
			</div>
		</div>
	);
}
