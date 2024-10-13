import { useAppNavigation, useEscapeKeyClose, useOnClickOutside, usePermissionChecker, useReference, useThreads } from '@mezon/core';
import { searchMessagesActions, selectCurrentChannel, selectTheme, threadsActions, useAppDispatch } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { EOverriddenPermission } from '@mezon/utils';
import { Button } from 'flowbite-react';
import { RefObject, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import EmptyThread from './EmptyThread';
import GroupThreads from './GroupThreads';
import SearchThread from './SearchThread';
import ThreadItem from './ThreadItem';

type ThreadsProps = {
	onClose: () => void;
	rootRef?: RefObject<HTMLElement>;
};

const ThreadModal = ({ onClose, rootRef }: ThreadsProps) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { toChannelPage } = useAppNavigation();
	const {
		setIsShowCreateThread,
		threadChannel,
		threadChannelOld,
		threadChannelOnline,
		publicThreadNotJoined,
		threadWithRecentMessage,
		threadWithOldMessage
	} = useThreads();
	const { setOpenThreadMessageState } = useReference();
	const currentChannel = useSelector(selectCurrentChannel);

	const appearanceTheme = useSelector(selectTheme);
	const [canManageThread] = usePermissionChecker([EOverriddenPermission.manageThread], currentChannel?.id ?? '');

	const handleCreateThread = () => {
		setOpenThreadMessageState(false);
		if (currentChannel && currentChannel?.parrent_id !== '0') {
			navigate(toChannelPage(currentChannel.parrent_id as string, currentChannel.clan_id as string));
		}
		onClose();
		setIsShowCreateThread(true, currentChannel?.parrent_id !== '0' ? currentChannel?.parrent_id : currentChannel.channel_id);
		dispatch(threadsActions.setNameThreadError(''));
		dispatch(threadsActions.setMessageThreadError(''));
		dispatch(searchMessagesActions.setIsSearchMessage({ channelId: currentChannel?.channel_id as string, isSearchMessage: false }));
	};

	const modalRef = useRef<HTMLDivElement>(null);
	useEscapeKeyClose(modalRef, onClose);
	useOnClickOutside(modalRef, onClose, rootRef);

	const handleJoinToThread = useCallback(() => {
		console.log('joining to thread');
	}, []);

	return (
		<div
			ref={modalRef}
			tabIndex={-1}
			className="absolute top-8 right-0 rounded-md dark:shadow-shadowBorder shadow-shadowInbox z-[99999999] animate-scale_up origin-top-right"
		>
			<div className="flex flex-col rounded-md min-h-[400px] md:w-[480px] max-h-[80vh] lg:w-[540px]  shadow-sm overflow-hidden">
				<div className="dark:bg-bgTertiary bg-bgLightTertiary flex flex-row items-center justify-between p-[16px] h-12">
					<div className="flex flex-row items-center border-r-[1px] dark:border-r-[#6A6A6A] border-r-[#E1E1E1] pr-[16px] gap-4">
						<Icons.ThreadIcon />
						<span className="text-base font-semibold cursor-default dark:text-white text-black">Threads</span>
					</div>
					<SearchThread />
					{canManageThread && (
						<div className="flex flex-row items-center gap-4">
							<Button
								onClick={handleCreateThread}
								size="sm"
								className="h-6 rounded focus:ring-transparent bg-bgSelectItem dark:bg-bgSelectItem hover:!bg-bgSelectItemHover items-center"
							>
								Create
							</Button>
							<button onClick={onClose}>
								<Icons.Close defaultSize="w-4 h-4 dark:text-[#CBD5E0] text-colorTextLightMode" />
							</button>
						</div>
					)}
				</div>
				<div
					className={`flex flex-col dark:bg-bgSecondary bg-bgLightSecondary px-[16px] min-h-full flex-1 overflow-y-auto ${appearanceTheme === 'light' ? 'customSmallScrollLightMode' : 'thread-scroll'}`}
				>
					{threadWithRecentMessage.length > 0 && (
						<GroupThreads title={`${threadWithRecentMessage.length} joined threads`}>
							{threadWithRecentMessage.map((thread) => (
								<ThreadItem thread={thread} key={thread.id} setIsShowThread={onClose} />
							))}
						</GroupThreads>
					)}

					{publicThreadNotJoined.length > 0 && (
						<GroupThreads title={`${publicThreadNotJoined.length} other active threads`}>
							{publicThreadNotJoined.map((thread) => (
								<ThreadItem
									isGroupPublic={true}
									onClickToJoiningThread={handleJoinToThread}
									thread={thread}
									key={thread.id}
									setIsShowThread={onClose}
								/>
							))}
						</GroupThreads>
					)}

					{threadWithOldMessage.length > 0 && (
						<GroupThreads title={`${threadWithOldMessage.length} archived threads`}>
							{threadWithOldMessage.map((thread) => (
								<ThreadItem thread={thread} key={thread.id} setIsShowThread={onClose} />
							))}
						</GroupThreads>
					)}
					{threadChannel.length === 0 && <EmptyThread onClick={handleCreateThread} />}
				</div>
			</div>
		</div>
	);
};

export default ThreadModal;
