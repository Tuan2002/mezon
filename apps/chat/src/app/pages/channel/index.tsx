import { FileUploadByDnD, MemberList, SearchMessageChannelRender } from '@mezon/components';
import { useDragAndDrop, usePermissionChecker, useSearchMessages, useThreads } from '@mezon/core';
import {
	channelMetaActions,
	channelsActions,
	clansActions,
	selectAppChannelById,
	selectChannelById,
	selectCloseMenu,
	selectCurrentChannel,
	selectFetchChannelStatus,
	selectIsSearchMessage,
	selectIsShowMemberList,
	selectStatusMenu,
	useAppDispatch
} from '@mezon/store';
import { Loading } from '@mezon/ui';
import { EOverriddenPermission, TIME_OFFSET } from '@mezon/utils';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { DragEvent, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { ChannelMedia } from './ChannelMedia';
import { ChannelMessageBox } from './ChannelMessageBox';
import { ChannelTyping } from './ChannelTyping';

function useChannelSeen(channelId: string) {
	const dispatch = useAppDispatch();
	const currentChannel = useSelector(selectChannelById(channelId));
	const statusFetchChannel = useSelector(selectFetchChannelStatus);

	const numberNotification = useMemo(() => {
		return currentChannel.count_mess_unread ? currentChannel.count_mess_unread : 0;
	}, [currentChannel.count_mess_unread]);

	useEffect(() => {
		const timestamp = Date.now() / 1000;
		dispatch(channelMetaActions.setChannelLastSeenTimestamp({ channelId, timestamp: timestamp + TIME_OFFSET }));
	}, [channelId, currentChannel, dispatch, numberNotification]);

	useEffect(() => {
		if (!statusFetchChannel) return;
		const numberNotification = currentChannel.count_mess_unread ? currentChannel.count_mess_unread : 0;
		if (numberNotification && numberNotification > 0) {
			dispatch(channelsActions.updateChannelBadgeCount({ channelId: channelId, count: numberNotification * -1 }));
			dispatch(clansActions.updateClanBadgeCount({ clanId: currentChannel?.clan_id ?? '', count: numberNotification * -1 }));
		}
	}, [currentChannel.id, statusFetchChannel]);
}

const ChannelMainContentText = ({ channelId }: ChannelMainContentProps) => {
	const currentChannel = useSelector(selectChannelById(channelId));
	const isShowMemberList = useSelector(selectIsShowMemberList);
	const [canSendMessage] = usePermissionChecker([EOverriddenPermission.sendMessage], channelId);

	if (!canSendMessage) {
		return (
			<div className="opacity-80 dark:bg-[#34363C] bg-[#F5F6F7] ml-4 mb-4 py-2 pl-2 w-widthInputViewChannelPermission dark:text-[#4E504F] text-[#D5C8C6] rounded one-line">
				You do not have permission to send messages in this channel.
			</div>
		);
	}

	return (
		<div className={`flex-shrink flex flex-col dark:bg-bgPrimary bg-bgLightPrimary h-auto relative ${isShowMemberList ? 'w-full' : 'w-full'}`}>
			{currentChannel ? (
				<ChannelMessageBox clanId={currentChannel?.clan_id} channel={currentChannel} mode={ChannelStreamMode.STREAM_MODE_CHANNEL} />
			) : (
				<ChannelMessageBox.Skeleton />
			)}
			{currentChannel && (
				<ChannelTyping
					channelId={currentChannel?.id}
					mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
					isPublic={currentChannel ? !currentChannel.channel_private : false}
				/>
			)}
		</div>
	);
};

type ChannelMainContentProps = {
	channelId: string;
};

const ChannelMainContent = ({ channelId }: ChannelMainContentProps) => {
	const currentChannel = useSelector(selectChannelById(channelId));
	const { draggingState, setDraggingState } = useDragAndDrop();
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const isSearchMessage = useSelector(selectIsSearchMessage(channelId));
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);
	const isShowMemberList = useSelector(selectIsShowMemberList);
	const { isShowCreateThread, setIsShowCreateThread } = useThreads();
	const appChannel = useSelector(selectAppChannelById(channelId));

	useChannelSeen(currentChannel?.id || '');

	const handleDragEnter = (e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer?.types.includes('Files')) {
			setDraggingState(true);
		}
	};

	useEffect(() => {
		if (isShowMemberList) {
			setIsShowCreateThread(false);
		}
	}, [isShowMemberList, setIsShowCreateThread]);

	return currentChannel.type === ChannelType.CHANNEL_TYPE_APP ? (
		appChannel?.url ? (
			<iframe src={appChannel?.url} className={'w-full h-full'}></iframe>
		) : (
			<div className={'w-full h-full flex items-center justify-center'}>
				<Loading />
			</div>
		)
	) : (
		<>
			{draggingState && <FileUploadByDnD currentId={currentChannel?.channel_id ?? ''} />}
			<div
				className="flex flex-col flex-1 shrink min-w-0 bg-transparent h-[100%] overflow-hidden z-10"
				id="mainChat"
				onDragEnter={handleDragEnter}
			>
				<div className={`flex flex-row ${closeMenu ? 'h-heightWithoutTopBarMobile' : 'h-heightWithoutTopBar'}`}>
					<div
						className={`flex flex-col flex-1 min-w-60 ${isShowMemberList ? 'w-widthMessageViewChat' : isShowCreateThread ? 'w-widthMessageViewChatThread' : isSearchMessage ? 'w-widthSearchMessage' : 'w-widthThumnailAttachment'} h-full ${closeMenu && !statusMenu && isShowMemberList && currentChannel.type !== ChannelType.CHANNEL_TYPE_STREAMING && 'hidden'} z-10`}
					>
						<div
							className={`relative dark:bg-bgPrimary max-w-widthMessageViewChat bg-bgLightPrimary ${closeMenu ? 'h-heightMessageViewChatMobile' : 'h-heightMessageViewChat'}`}
							ref={messagesContainerRef}
						>
							<ChannelMedia currentChannel={currentChannel} key={currentChannel?.channel_id} />
						</div>
						<ChannelMainContentText channelId={currentChannel?.id as string} />
					</div>
					{isShowMemberList && currentChannel.type !== ChannelType.CHANNEL_TYPE_STREAMING && (
						<div
							onContextMenu={(event) => event.preventDefault()}
							className={` dark:bg-bgSecondary bg-bgLightSecondary text-[#84ADFF] relative overflow-y-scroll hide-scrollbar ${currentChannel?.type === ChannelType.CHANNEL_TYPE_VOICE ? 'hidden' : 'flex'} ${closeMenu && !statusMenu && isShowMemberList ? 'w-full' : 'w-widthMemberList'}`}
							id="memberList"
						>
							<div className="w-1 h-full dark:bg-bgPrimary bg-bgLightPrimary"></div>
							<MemberList />
						</div>
					)}
					{isSearchMessage && currentChannel.type !== ChannelType.CHANNEL_TYPE_STREAMING && <SearchMessageChannel />}
				</div>
			</div>
		</>
	);
};

export default function ChannelMain() {
	const currentChannel = useSelector(selectCurrentChannel);

	if (!currentChannel) {
		return null;
	}

	return <ChannelMainContent channelId={currentChannel.id} />;
}

const SearchMessageChannel = () => {
	const { totalResult, currentPage, messageSearchByChannelId } = useSearchMessages();
	return <SearchMessageChannelRender searchMessages={messageSearchByChannelId} currentPage={currentPage} totalResult={totalResult} />;
};
