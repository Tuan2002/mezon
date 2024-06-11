import { GifStickerEmojiPopup, ReactionBottom, UserReactionPanel } from '@mezon/components';
import { useChatReaction, useEmojiSuggestion, useGifsStickersEmoji, useReference } from '@mezon/core';
import { selectDataReactionGetFromMessage } from '@mezon/store';
import {
	EmojiDataOptionals,
	IMessageWithUser,
	SenderInfoOptionals,
	SubPanelName,
	calculateTotalCount,
	getSrcEmoji,
	updateEmojiReactionData,
} from '@mezon/utils';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

type MessageReactionProps = {
	message: IMessageWithUser;
	currentChannelId: string;
	mode: number;
};

// TODO: refactor component for message lines
const MessageReaction: React.FC<MessageReactionProps> = ({ currentChannelId, message, mode }) => {
	const {
		userId,
		reactionMessageDispatch,
		reactionBottomState,
		setUserReactionPanelState,
		userReactionPanelState,
		reactionBottomStateResponsive,
		dataReactionServerAndSocket,
	} = useChatReaction();

	const { idMessageRefReaction, setIdReferenceMessageReaction } = useReference();
	const smileButtonRef = useRef<HTMLDivElement | null>(null);
	const [showIconSmile, setShowIconSmile] = useState<boolean>(true);
	const { emojiListPNG } = useEmojiSuggestion();
	const reactDataFirstGetFromMessage = useSelector(selectDataReactionGetFromMessage);
	const [dataReactionCombine, setDataReactionCombine] = useState<EmojiDataOptionals[]>([]);
	useEffect(() => {
		setDataReactionCombine(updateEmojiReactionData([...reactDataFirstGetFromMessage, ...dataReactionServerAndSocket]));
	}, [reactDataFirstGetFromMessage, dataReactionServerAndSocket]);

	async function reactOnExistEmoji(
		id: string,
		mode: number,
		messageId: string,
		emoji: string,
		count: number,
		message_sender_id: string,
		action_delete: boolean,
	) {
		await reactionMessageDispatch('', mode ?? 2, messageId ?? '', emoji ?? '', 1, message_sender_id ?? '', false);
	}

	const checkMessageToMatchMessageRef = (message: IMessageWithUser) => {
		if (message.id === idMessageRefReaction) {
			return true;
		} else {
			return false;
		}
	};

	// For user reaction panel
	const [emojiShowUserReaction, setEmojiShowUserReaction] = useState<EmojiDataOptionals>();
	const checkEmojiToMatchWithEmojiHover = (emoji: EmojiDataOptionals) => {
		if (emoji.emoji === emojiShowUserReaction?.emoji) {
			return true;
		} else {
			return false;
		}
	};
	// Check position sender panel && emoji panel
	const childRef = useRef<(HTMLDivElement | null)[]>([]);
	const parentDiv = useRef<HTMLDivElement | null>(null);
	const contentDiv = useRef<HTMLDivElement | null>(null);

	const [hoverEmoji, setHoverEmoji] = useState<EmojiDataOptionals>();
	const [showSenderPanelIn1s, setShowSenderPanelIn1s] = useState(true);
	const { setSubPanelActive, subPanelActive } = useGifsStickersEmoji();

	const handleOnEnterEmoji = (emojiParam: EmojiDataOptionals) => {
		setHoverEmoji(emojiParam);
		setUserReactionPanelState(true);
		setIdReferenceMessageReaction(message.id);
		setEmojiShowUserReaction(emojiParam);
		setShowSenderPanelIn1s(true);
		setShowIconSmile(true);
		// checkPositionSenderPanel(emojiParam);
	};

	const handleOnleaveEmoji = () => {
		if (subPanelActive === SubPanelName.NONE) {
			return setShowIconSmile(false);
		}
	};

	useEffect(() => {
		if (subPanelActive === SubPanelName.NONE) {
			return setShowIconSmile(false);
		}
		if (subPanelActive === SubPanelName.EMOJI_REACTION_BOTTOM) {
			return setShowIconSmile(true);
		}
	}, [subPanelActive]);

	const PANEL_SENDER_WIDTH = 300;

	const [posToRight, setPosToRight] = useState<boolean>(false);

	const emojiIndexMap: { [key: string]: number } = {};
	dataReactionCombine &&
		dataReactionCombine.forEach((emoji: EmojiDataOptionals, index: number) => {
			if (emoji.id !== undefined) {
				emojiIndexMap[emoji.id] = index;
			}
		});

	const [leftChildRef, setLeftChildRef] = useState(0);
	const [widthContent, setWidthContent] = useState(0);
	const [leftContent, setLeftContent] = useState(0);

	useEffect(() => {
		if (hoverEmoji) {
			checkPositionSenderPanel(hoverEmoji);
		}
	}, [hoverEmoji]);

	useEffect(() => {
		if (
			(leftChildRef + PANEL_SENDER_WIDTH > leftContent && widthContent > leftChildRef + PANEL_SENDER_WIDTH) ||
			(leftChildRef === 0 && leftContent === 0 && widthContent === 0)
		) {
			return setPosToRight(false);
		} else if (leftChildRef + PANEL_SENDER_WIDTH < leftContent || widthContent < leftChildRef + PANEL_SENDER_WIDTH) {
			return setPosToRight(true);
		}
	}, [leftChildRef, widthContent, leftContent, window.innerWidth]);

	const checkPositionSenderPanel = (emoji: EmojiDataOptionals) => {
		if (!parentDiv.current || !childRef.current || !contentDiv.current || emoji.id === undefined) return;
		const parentRect = parentDiv.current.getBoundingClientRect();
		const index = emojiIndexMap[emoji.id];
		if (index === undefined) return;
		const childElement = childRef.current[index];
		if (!childElement) return;
		const leftChildRect = childElement.getBoundingClientRect().left;
		const widthContentDiv = contentDiv.current.getBoundingClientRect().right;
		const leftContentDiv = contentDiv.current.getBoundingClientRect().left + 56;
		setLeftChildRef(leftChildRect);
		setWidthContent(widthContentDiv);
		setLeftContent(leftContentDiv);
	};

	// For button smile
	const lastPositionEmoji = (emoji: EmojiDataOptionals, message: IMessageWithUser) => {
		const filterMessage =
			dataReactionCombine && dataReactionCombine.filter((emojiFilter: EmojiDataOptionals) => emojiFilter.message_id === message.id);
		const indexEmoji = filterMessage.indexOf(emoji);
		if (indexEmoji === filterMessage.length - 1) {
			return true;
		} else {
			return false;
		}
	};

	// work in mobile
	useEffect(() => {
		if (showSenderPanelIn1s) {
			const timer = setTimeout(() => {
				setShowSenderPanelIn1s(false);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [showSenderPanelIn1s]);

	return (
		<div ref={contentDiv} className="relative">
			{checkMessageToMatchMessageRef(message) && reactionBottomState && reactionBottomStateResponsive && (
				<div className={`w-fit md:hidden z-30 absolute bottom-0 block`}>
					<div className="scale-75 transform mb-0 z-20">
						<GifStickerEmojiPopup messageEmojiId={message.id} mode={mode} />
					</div>
				</div>
			)}

			<div ref={parentDiv} className="flex flex-wrap  gap-2 whitespace-pre-wrap ml-14">
				{hoverEmoji && showSenderPanelIn1s && (
					<div className="hidden max-sm:block max-sm:-top-[0] absolute">
						{checkMessageToMatchMessageRef(message) && checkEmojiToMatchWithEmojiHover(hoverEmoji) && emojiShowUserReaction && (
							<UserReactionPanel emojiShowPanel={emojiShowUserReaction} mode={mode} message={message} />
						)}
					</div>
				)}

				{dataReactionCombine
					.filter((emojiFilter: EmojiDataOptionals) => emojiFilter.message_id === message.id)
					?.map((emoji: EmojiDataOptionals, index: number) => {
						const userSender = emoji.senders.find((sender: SenderInfoOptionals) => sender.sender_id === userId);
						const checkID = emoji.message_id === message.id;
						const totalCount = calculateTotalCount(emoji.senders);
						return (
							<Fragment key={`${index + message.id}`}>
								{checkID && totalCount > 0 && (
									<div
										ref={(element) => (childRef.current[index] = element)}
										className={` justify-center items-center relative
									${userSender?.count && userSender.count > 0 ? 'dark:bg-[#373A54] bg-gray-200 border-blue-600 border' : 'dark:bg-[#2B2D31] bg-bgLightMode border-[#313338]'}
									rounded-md w-fit min-w-12 gap-3 h-6 flex flex-row  items-center cursor-pointer`}
										onClick={() =>
											reactOnExistEmoji(emoji.id ?? '', mode, message.id ?? '', emoji.emoji ?? '', 1, userId ?? '', false)
										}
										onMouseEnter={() => {
											handleOnEnterEmoji(emoji);
										}}
										onMouseLeave={() => {
											handleOnleaveEmoji();
										}}
									>
										<span className=" absolute left-[5px] ">
											{' '}
											<img src={getSrcEmoji(emoji.emoji ?? '', emojiListPNG)} className="w-4 h-4"></img>{' '}
										</span>

										<div className="text-[13px] top-[2px] ml-5 absolute justify-center text-center cursor-pointer dark:text-white text-black">
											<p>{totalCount}</p>
										</div>

										{checkMessageToMatchMessageRef(message) && showIconSmile && lastPositionEmoji(emoji, message) && (
											<ReactionBottom smileButtonRef={smileButtonRef} message={message} />
										)}

										{checkMessageToMatchMessageRef(message) &&
											userReactionPanelState &&
											checkEmojiToMatchWithEmojiHover(emoji) &&
											emojiShowUserReaction && (
												<div className="max-sm:hidden z-50">
													<UserReactionPanel
														moveToRight={posToRight}
														emojiShowPanel={emojiShowUserReaction}
														mode={mode}
														message={message}
													/>
												</div>
											)}
									</div>
								)}
							</Fragment>
						);
					})}
			</div>
		</div>
	);
};

export default MessageReaction;
