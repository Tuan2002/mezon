import { ELoadMoreDirection, IBeforeRenderCb } from '@mezon/chat-scroll';
import { MessageContextMenuProvider, MessageWithUser } from '@mezon/components';
import { LoadMoreDirection, useContainerHeight, useCurrentInbox, useIdleRender, useScrollHooks } from '@mezon/core';
import {
	MessagesEntity,
	messagesActions,
	pinMessageActions,
	selectAllAccount,
	selectAllChannelMemberIds,
	selectAllRoleIds,
	selectCurrentChannelId,
	selectDataReferences,
	selectFirstMessageOfCurrentTopic,
	selectHasMoreBottomByChannelId,
	selectHasMoreMessageByChannelId,
	selectIdMessageToJump,
	selectIsJumpingToPresent,
	selectIsMessageIdExist,
	selectIsViewingOlderMessagesByChannelId,
	selectJumpPinMessageId,
	selectLastMessageByChannelId,
	selectMessageEntitiesByChannelId,
	selectMessageIdsByChannelId,
	selectMessageIsLoading,
	selectMessageNotified,
	selectTheme,
	selectUnreadMessageIdByChannelId,
	useAppDispatch,
	useAppSelector
} from '@mezon/store';
import { Direction_Mode, convertInitialMessageOfTopic, toggleDisableHover } from '@mezon/utils';
import classNames from 'classnames';
import { ChannelMessage as ChannelMessageType, ChannelType } from 'mezon-js';
import { ApiMessageRef } from 'mezon-js/api.gen';
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ChannelMessage, MemorizedChannelMessage } from './ChannelMessage';

const SCROLL_THRESHOLD = 500; // 500px

type ChannelMessagesProps = {
	clanId: string;
	channelId: string;
	type: ChannelType;
	channelLabel?: string;
	avatarDM?: string;
	mode: number;
	userName?: string;
	userIdsFromThreadBox?: string[];
	isThreadBox?: boolean;
	isTopicBox?: boolean;
	topicId?: string;
};

const MESSAGE_LIST_SLICE = 50;
const MESSAGE_ANIMATION_DURATION = 500;
const BOTTOM_THRESHOLD = 50;
const BOTTOM_FOCUS_MARGIN = 20;

function ChannelMessages({
	clanId,
	channelId,
	channelLabel,
	avatarDM,
	userName,
	mode,
	userIdsFromThreadBox,
	isThreadBox = false,
	isTopicBox,
	topicId
}: ChannelMessagesProps) {
	const appearanceTheme = useSelector(selectTheme);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const currentInbox = useCurrentInbox();
	const messageIds = useAppSelector((state) => selectMessageIdsByChannelId(state, channelId));
	const idMessageNotified = useSelector(selectMessageNotified);
	const isJumpingToPresent = useSelector(selectIsJumpingToPresent(channelId));
	const isViewOlderMessage = useSelector(selectIsViewingOlderMessagesByChannelId(channelId));
	const isFetching = useSelector(selectMessageIsLoading);
	const hasMoreTop = useSelector(selectHasMoreMessageByChannelId(channelId));
	const hasMoreBottom = useSelector(selectHasMoreBottomByChannelId(channelId));
	const lastMessage = useAppSelector((state) => selectLastMessageByChannelId(state, channelId));
	const userId = useSelector(selectAllAccount)?.user?.id;
	const getMemberIds = useAppSelector((state) => selectAllChannelMemberIds(state, currentInbox?.channel_id as string));
	const allUserIdsInChannel = isThreadBox ? userIdsFromThreadBox : getMemberIds;
	const allRolesInClan = useSelector(selectAllRoleIds);
	const dataReferences = useSelector(selectDataReferences(channelId ?? ''));
	const lastMessageId = lastMessage?.id;
	const lastMessageUnreadId = useAppSelector((state) => selectUnreadMessageIdByChannelId(state, channelId as string));
	const userActiveScroll = useRef<boolean>(false);
	const dispatch = useAppDispatch();
	const chatRef = useRef<HTMLDivElement | null>(null);

	const isFetchingRef = useRef<boolean>(false);
	const hasMoreTopRef = useRef<boolean>(false);
	const hasMoreBottomRef = useRef<boolean>(false);

	useEffect(() => {
		userActiveScroll.current = false;
	}, [channelId]);

	useEffect(() => {
		isFetchingRef.current = isFetching;
	}, [isFetching]);

	useEffect(() => {
		hasMoreTopRef.current = hasMoreTop;
	}, [hasMoreTop]);

	useEffect(() => {
		hasMoreBottomRef.current = hasMoreBottom;
	}, [hasMoreBottom]);

	const loadMoreMessage = useCallback(
		async (direction: ELoadMoreDirection, cb?: IBeforeRenderCb) => {
			if (isFetchingRef.current) {
				return;
			}

			if (direction === ELoadMoreDirection.bottom && !hasMoreBottomRef.current) {
				dispatch(messagesActions.setViewingOlder({ channelId, status: false }));
				return;
			}

			if (direction === ELoadMoreDirection.top && !hasMoreTopRef.current) {
				return;
			}

			if (typeof cb === 'function') {
				cb();
			}

			if (direction === ELoadMoreDirection.bottom) {
				//load more in topic
				if (isTopicBox) {
					await dispatch(
						messagesActions.loadMoreMessage({
							clanId,
							channelId: currentChannelId as string,
							direction: Direction_Mode.AFTER_TIMESTAMP,
							topicId
						})
					);
					return true;
				}
				await dispatch(messagesActions.loadMoreMessage({ clanId, channelId, direction: Direction_Mode.AFTER_TIMESTAMP }));
				dispatch(messagesActions.setViewingOlder({ channelId, status: true }));
				return true;
			}

			//load more in topic
			if (isTopicBox) {
				await dispatch(
					messagesActions.loadMoreMessage({
						clanId,
						channelId: currentChannelId as string,
						direction: Direction_Mode.BEFORE_TIMESTAMP,
						topicId
					})
				);
				return true;
			}

			await dispatch(messagesActions.loadMoreMessage({ clanId, channelId, direction: Direction_Mode.BEFORE_TIMESTAMP }));

			return true;
		},
		[isTopicBox, dispatch, clanId, channelId, currentChannelId, topicId]
	);

	const getChatScrollBottomOffset = useCallback(() => {
		const element = chatRef.current;
		if (!element) {
			return 0;
		}
		return Math.abs(element?.scrollHeight - element?.clientHeight - element?.scrollTop);
	}, []);

	const isLoadMore = useRef<boolean>(false);
	const currentScrollDirection = useRef<ELoadMoreDirection | null>(null);

	// maintain scroll position
	const firsRowCached = useRef<string>('');
	const lastRowCached = useRef<string>('');

	const handleOnChange = useCallback(
		async (direction: LoadMoreDirection) => {
			if (!userActiveScroll.current) return;
			if (isLoadMore.current || !chatRef.current?.scrollHeight) return;
			switch (direction) {
				case LoadMoreDirection.Backwards:
					currentScrollDirection.current = ELoadMoreDirection.top;
					isLoadMore.current = true;
					firsRowCached.current = messageIds[1];
					await loadMoreMessage(ELoadMoreDirection.top);
					setTimeout(() => {
						isLoadMore.current = false;
					}, 1000);
					return;

					break;
				case LoadMoreDirection.Forwards:
					currentScrollDirection.current = ELoadMoreDirection.bottom;
					isLoadMore.current = true;
					lastRowCached.current = messageIds[messageIds.length - 1];
					await loadMoreMessage(ELoadMoreDirection.bottom);
					setTimeout(() => {
						isLoadMore.current = false;
					}, 100);
					break;
			}
		},
		[loadMoreMessage, messageIds]
	);

	const scrollToLastMessage = useCallback(() => {
		return new Promise((rs) => {
			if (isLoadMore.current) return rs(true);
			chatRef.current && (chatRef.current.scrollTop = chatRef.current.scrollHeight);
			rs(true);
		});
	}, []);

	useEffect(() => {
		if (dataReferences?.message_ref_id && getChatScrollBottomOffset() <= 100) {
			scrollToLastMessage();
		}
	}, [dataReferences, lastMessage, scrollToLastMessage, getChatScrollBottomOffset]);

	// Jump to present when user is jumping to present
	useEffect(() => {
		if (isJumpingToPresent) {
			scrollToLastMessage().then(() => {
				dispatch(messagesActions.setIsJumpingToPresent({ channelId, status: false }));
			});
		}
	}, [dispatch, isJumpingToPresent, channelId, scrollToLastMessage]);

	// Handle scroll to bottom when user on the bottom and received new message
	useEffect(() => {
		if (isViewOlderMessage) {
			return;
		}

		const isNearAtBottom = getChatScrollBottomOffset() <= 100;

		if (userId === lastMessage?.sender_id || isNearAtBottom) {
			scrollToLastMessage();
			return;
		}
	}, [userId, messageIds.length, isViewOlderMessage, scrollToLastMessage, getChatScrollBottomOffset]);

	const shouldRender = useIdleRender();
	if (!shouldRender) return null;

	return (
		<MessageContextMenuProvider channelId={channelId} allUserIdsInChannel={allUserIdsInChannel as string[]} allRolesInClan={allRolesInClan}>
			<ChatMessageList
				key={channelId}
				messageIds={messageIds}
				chatRef={chatRef}
				userActiveScroll={userActiveScroll}
				appearanceTheme={appearanceTheme}
				lastMessageId={lastMessageId as string}
				dataReferences={dataReferences}
				idMessageNotified={idMessageNotified}
				lastMessageUnreadId={lastMessageUnreadId as string}
				avatarDM={avatarDM}
				userName={userName}
				channelId={channelId}
				mode={mode}
				channelLabel={channelLabel}
				onChange={handleOnChange}
				isLoadMore={isLoadMore}
				firsRowCached={firsRowCached}
				lastRowCached={lastRowCached}
				currentScrollDirection={currentScrollDirection}
				isTopic={isTopicBox}
			/>
		</MessageContextMenuProvider>
	);
}

ChannelMessages.Skeleton = () => {
	if (ChannelMessage.Skeleton) {
		return (
			<>
				{/* <ChannelMessage.Skeleton />
				<ChannelMessage.Skeleton />
				<ChannelMessage.Skeleton />
				<ChannelMessage.Skeleton />
				<ChannelMessage.Skeleton />
				<ChannelMessage.Skeleton /> */}
			</>
		);
	}
};

type ChatMessageListProps = {
	messageIds: string[];
	chatRef: React.RefObject<HTMLDivElement>;
	userActiveScroll: React.MutableRefObject<boolean>;
	appearanceTheme: string;
	lastMessageId: string;
	dataReferences: ApiMessageRef;
	idMessageNotified: string;
	lastMessageUnreadId: string;
	avatarDM?: string;
	userName?: string;
	channelId: string;
	mode: number;
	channelLabel?: string;
	onChange: (direction: LoadMoreDirection) => void;
	isLoadMore: React.MutableRefObject<boolean>;
	firsRowCached: React.MutableRefObject<string>;
	lastRowCached: React.MutableRefObject<string>;
	currentScrollDirection: React.MutableRefObject<ELoadMoreDirection | null>;
	isTopic?: boolean;
};

const ChatMessageList: React.FC<ChatMessageListProps> = memo(
	({
		messageIds,
		chatRef,
		userActiveScroll,
		appearanceTheme,
		lastMessageId,
		dataReferences,
		idMessageNotified,
		lastMessageUnreadId,
		avatarDM,
		userName,
		channelId,
		mode,
		channelLabel,
		onChange,
		isLoadMore,
		firsRowCached,
		lastRowCached,
		currentScrollDirection,
		isTopic
	}) => {
		const dispatch = useAppDispatch();
		const idMessageToJump = useSelector(selectIdMessageToJump);
		const jumpPinMessageId = useSelector(selectJumpPinMessageId);
		const isPinMessageExist = useSelector(selectIsMessageIdExist(channelId, jumpPinMessageId));
		const isMessageExist = useSelector(selectIsMessageIdExist(channelId, idMessageToJump?.id as string));
		const entities = useAppSelector((state) => selectMessageEntitiesByChannelId(state, channelId));
		const firstMsgOfThisTopic = useSelector(selectFirstMessageOfCurrentTopic);

		const [getContainerHeight, prevContainerHeightRef] = useContainerHeight(chatRef, true);

		const isViewportNewest = false;
		const isUnread = true;
		const isReady = true;

		const [isScrollDownNeeded, setIsScrollDownShown] = useState(false);

		const [isNotchShown, setIsNotchShown] = useState<boolean | undefined>();

		const { withHistoryTriggers, backwardsTriggerRef, forwardsTriggerRef, fabTriggerRef } = useScrollHooks(
			'thread',
			chatRef,
			messageIds,
			getContainerHeight,
			isViewportNewest,
			isUnread,
			setIsScrollDownShown,
			setIsNotchShown,
			isReady,
			(event: { direction: LoadMoreDirection }) => {
				onChange(event.direction);
			}
		);

		const listItemElementsRef = useRef<HTMLDivElement[]>();

		const scrollOffsetRef = useRef<number>(0);

		const anchorIdRef = useRef<string>();

		const anchorTopRef = useRef<number>();

		const memoFocusingIdRef = useRef<number>();

		// useSyncEffect(() => {
		// 	memoFocusingIdRef.current = focusingId;
		// }, [focusingId]);

		// Handles updated message list, takes care of scroll repositioning
		// useLayoutEffectWithPrevDeps(
		// 	([prevMessageIds, prevIsViewportNewest]) => {
		// 		const containerHeight = getContainerHeight();
		// 		const prevContainerHeight = prevContainerHeightRef.current;
		// 		prevContainerHeightRef.current = containerHeight;

		// 		// Skip initial resize observer callback
		// 		if (
		// 			messageIds === prevMessageIds &&
		// 			isViewportNewest === prevIsViewportNewest &&
		// 			containerHeight !== prevContainerHeight &&
		// 			prevContainerHeight === undefined
		// 		) {
		// 			return;
		// 		}

		// 		const container = chatRef.current!;
		// 		listItemElementsRef.current = Array.from(container.querySelectorAll<HTMLDivElement>('.message-list-item'));
		// 		const lastItemElement = listItemElementsRef.current[listItemElementsRef.current.length - 1];
		// 		// const firstUnreadElement = memoFirstUnreadIdRef.current
		// 		// 	? container.querySelector<HTMLDivElement>(`#${getMessageHtmlId(memoFirstUnreadIdRef.current)}`)
		// 		// 	: undefined;

		// 		const hasLastMessageChanged =
		// 			messageIds && prevMessageIds && messageIds[messageIds.length - 1] !== prevMessageIds[prevMessageIds.length - 1];
		// 		const hasViewportShifted = messageIds?.[0] !== prevMessageIds?.[0] && messageIds?.length === MESSAGE_LIST_SLICE / 2 + 1;
		// 		const wasMessageAdded = hasLastMessageChanged && !hasViewportShifted;

		// 		// Add extra height when few messages to allow scroll animation
		// 		if (
		// 			isViewportNewest &&
		// 			wasMessageAdded &&
		// 			messageIds &&
		// 			messageIds.length < MESSAGE_LIST_SLICE / 2 &&
		// 			!container.parentElement!.classList.contains('force-messages-scroll') &&
		// 			forceMeasure(() => (container.firstElementChild as HTMLDivElement)!.clientHeight <= container.offsetHeight * 2)
		// 		) {
		// 			// addExtraClass(container.parentElement!, 'force-messages-scroll');
		// 			container.parentElement!.classList.add('force-messages-scroll');

		// 			setTimeout(() => {
		// 				if (container.parentElement) {
		// 					// removeExtraClass(container.parentElement!, 'force-messages-scroll');
		// 					container.parentElement!.classList.remove('force-messages-scroll');
		// 				}
		// 			}, MESSAGE_ANIMATION_DURATION);
		// 		}

		// 		requestForcedReflow(() => {
		// 			const { scrollTop, scrollHeight, offsetHeight } = container;
		// 			const scrollOffset = scrollOffsetRef.current;

		// 			let bottomOffset = scrollOffset - (prevContainerHeight || offsetHeight);
		// 			if (wasMessageAdded) {
		// 				// If two new messages come at once (e.g. when bot responds) then the first message will update `scrollOffset`
		// 				// right away (before animation) which creates inconsistency until the animation completes. To work around that,
		// 				// we calculate `isAtBottom` with a "buffer" of the latest message height (this is approximate).
		// 				const lastItemHeight = lastItemElement ? lastItemElement.offsetHeight : 0;
		// 				bottomOffset -= lastItemHeight;
		// 			}
		// 			const isAtBottom = isViewportNewest && prevIsViewportNewest && bottomOffset <= BOTTOM_THRESHOLD;
		// 			// const isAlreadyFocusing = messageIds && memoFocusingIdRef.current === messageIds[messageIds.length - 1];
		// 			const isAlreadyFocusing = false;

		// 			// Animate incoming message, but if app is in background mode, scroll to the first unread
		// 			if (wasMessageAdded && isAtBottom && !isAlreadyFocusing) {
		// 				// Break out of `forceLayout`
		// 				requestMeasure(() => {
		// 					const shouldScrollToBottom = !isBackgroundModeActive();
		// 					// firstUnreadElement
		// 					// noMessageSendingAnimation

		// 					// animateScroll(
		// 					// 	container,
		// 					// 	shouldScrollToBottom ? lastItemElement! : null!,
		// 					// 	shouldScrollToBottom ? 'end' : 'start',
		// 					// 	BOTTOM_FOCUS_MARGIN,
		// 					// 	undefined,
		// 					// 	undefined,
		// 					// 	undefined
		// 					// );
		// 				});
		// 			}

		// 			const isResized = prevContainerHeight !== undefined && prevContainerHeight !== containerHeight;
		// 			if (isResized && isAnimatingScroll()) {
		// 				return undefined;
		// 			}

		// 			const anchor = anchorIdRef.current && container.querySelector(`#${anchorIdRef.current}`);
		// 			// const unreadDivider =
		// 			// 	!anchor && memoUnreadDividerBeforeIdRef.current && container.querySelector<HTMLDivElement>(`.${UNREAD_DIVIDER_CLASS}`);

		// 			let newScrollTop!: number;
		// 			if (isAtBottom && isResized) {
		// 				newScrollTop = scrollHeight - offsetHeight;
		// 			} else if (anchor) {
		// 				const newAnchorTop = anchor.getBoundingClientRect().top;
		// 				newScrollTop = scrollTop + (newAnchorTop - (anchorTopRef.current || 0));
		// 			} else {
		// 				newScrollTop = scrollHeight - scrollOffset;
		// 			}

		// 			console.log(newScrollTop, 'newScrollTop');

		// 			return () => {
		// 				resetScroll(container, Math.ceil(newScrollTop));
		// 				restartCurrentScrollAnimation();

		// 				scrollOffsetRef.current = Math.max(Math.ceil(scrollHeight - newScrollTop), offsetHeight);

		// 				// if (!memoFocusingIdRef.current) {
		// 				// 	isScrollTopJustUpdatedRef.current = true;

		// 				// 	requestMeasure(() => {
		// 				// 		isScrollTopJustUpdatedRef.current = false;
		// 				// 	});
		// 				// }
		// 			};
		// 		});
		// 		// This should match deps for `useSyncEffect` above
		// 	},
		// 	[messageIds, isViewportNewest, getContainerHeight, prevContainerHeightRef]
		// );

		const convertedFirstMsgOfThisTopic = useMemo(() => {
			if (!firstMsgOfThisTopic?.message) {
				return firstMsgOfThisTopic as MessagesEntity;
			}
			return convertInitialMessageOfTopic(firstMsgOfThisTopic.message as ChannelMessageType);
		}, [firstMsgOfThisTopic]);

		// Initial scroll to bottom
		useLayoutEffect(() => {
			if (chatRef.current && messageIds?.length && !userActiveScroll.current) {
				chatRef.current.scrollTop = chatRef.current.scrollHeight;
			}
		});

		// Handle scroll to specific message (jump/pin)
		const timerRef = useRef<number | null>(null);
		useEffect(() => {
			const clearTimer = () => {
				if (timerRef.current) {
					clearTimeout(timerRef.current);
					timerRef.current = null;
				}
			};

			const scrollToMessage = (messageId: string) => {
				const messageElement = document.getElementById(messageId);
				if (messageElement) {
					userActiveScroll.current = true;
					messageElement.scrollIntoView({ behavior: 'auto', block: 'center' });
				}
			};

			clearTimer();

			if (jumpPinMessageId && isPinMessageExist) {
				scrollToMessage(jumpPinMessageId);
				timerRef.current = window.setTimeout(() => {
					dispatch(pinMessageActions.setJumpPinMessageId(null));
				}, 1000);
			} else if (idMessageToJump && isMessageExist && !jumpPinMessageId) {
				if (idMessageToJump?.navigate) {
					setTimeout(() => {
						scrollToMessage(idMessageToJump.id);
						timerRef.current = window.setTimeout(() => {
							dispatch(messagesActions.setIdMessageToJump(null));
						}, 1000);
					});
				} else {
					scrollToMessage(idMessageToJump.id);
					timerRef.current = window.setTimeout(() => {
						dispatch(messagesActions.setIdMessageToJump(null));
					}, 1000);
				}
			}

			return clearTimer;
		}, [dispatch, jumpPinMessageId, isPinMessageExist, idMessageToJump, isMessageExist]);

		// Cleanup on unmount
		useEffect(() => {
			return () => {
				dispatch(messagesActions.setIdMessageToJump(null));
				dispatch(pinMessageActions.setJumpPinMessageId(null));
			};
		}, [dispatch]);

		const scrollTimeoutId2 = useRef<NodeJS.Timeout | null>(null);
		return (
			<div className="w-full h-full relative messages-container">
				<div
					// onScroll={handleScroll}
					onWheelCapture={() => {
						toggleDisableHover(chatRef.current, scrollTimeoutId2);
						userActiveScroll.current = true;
					}}
					onTouchStart={() => {
						userActiveScroll.current = true;
					}}
					onMouseDown={() => {
						userActiveScroll.current = true;
					}}
					ref={chatRef}
					id="scrollLoading"
					className={classNames([
						'absolute top-0 left-0 bottom-0 right-0',
						'overflow-y-scroll overflow-x-hidden',
						'dark:bg-bgPrimary bg-bgLightPrimary',
						{
							customScrollLightMode: appearanceTheme === 'light'
						}
					])}
				>
					{isTopic && convertedFirstMsgOfThisTopic && (
						<div className="sticky top-0 z-[1] dark:bg-bgPrimary bg-bgLightPrimary">
							<div
								className={`fullBoxText relative group ${convertedFirstMsgOfThisTopic?.references?.[0]?.message_ref_id ? 'pt-3' : ''}`}
							>
								<MessageWithUser
									isTopic={isTopic}
									allowDisplayShortProfile={true}
									message={convertedFirstMsgOfThisTopic}
									mode={mode}
								/>
							</div>
						</div>
					)}
					<div className="w-full">
						{withHistoryTriggers && <div ref={backwardsTriggerRef} key="backwards-trigger" className="backwards-trigger" />}
						{messageIds.map((messageId, index) => {
							const checkMessageTargetToMoved = idMessageToJump?.id === messageId && messageId !== lastMessageId;
							const messageReplyHighlight = (dataReferences?.message_ref_id && dataReferences?.message_ref_id === messageId) || false;

							return (
								<div className="message-list-item" key={messageId} id={messageId}>
									<MemorizedChannelMessage
										index={index}
										message={entities[messageId]}
										previousMessage={entities[messageIds[index - 1]]}
										avatarDM={avatarDM}
										userName={userName}
										messageId={messageId}
										nextMessageId={messageIds[index + 1]}
										channelId={channelId}
										isHighlight={messageId === idMessageNotified}
										mode={mode}
										channelLabel={channelLabel ?? ''}
										isLastSeen={Boolean(messageId === lastMessageUnreadId && messageId !== lastMessageId)}
										checkMessageTargetToMoved={checkMessageTargetToMoved}
										messageReplyHighlight={messageReplyHighlight}
										isTopic={isTopic}
									/>
								</div>
							);
						})}
						{withHistoryTriggers && <div ref={forwardsTriggerRef} key="forwards-trigger" className="forwards-trigger" />}

						<div ref={fabTriggerRef} key="fab-trigger" className="fab-trigger" />
						<div className="h-[20px] w-[1px] pointer-events-none"></div>
					</div>
				</div>
			</div>
		);
	},
	(prev, curr) => {
		return (
			prev.messageIds === curr.messageIds &&
			prev.lastMessageId === curr.lastMessageId &&
			prev.dataReferences === curr.dataReferences &&
			prev.idMessageNotified === curr.idMessageNotified &&
			prev.lastMessageUnreadId === curr.lastMessageUnreadId &&
			prev.appearanceTheme === curr.appearanceTheme
		);
	}
);

const MemoizedChannelMessages = memo(ChannelMessages, (prev, cur) => prev.channelId === cur.channelId) as unknown as typeof ChannelMessages & {
	Skeleton: typeof ChannelMessages.Skeleton;
};

export default MemoizedChannelMessages;

(MemoizedChannelMessages as any).displayName = 'MemoizedChannelMessages';
