import { GifStickerEmojiPopup, MessageBox, ReplyMessageBox, UserMentionList } from '@mezon/components';
import { useChatSending, useGifsStickersEmoji } from '@mezon/core';
import { selectIdMessageRefReaction, selectIsShowMemberList } from '@mezon/store';
import { EmojiPlaces, IMessageSendPayload, SubPanelName, ThreadValue } from '@mezon/utils';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useThrottledCallback } from 'use-debounce';

export type ChannelMessageBoxProps = {
	channelId: string;
	clanId?: string;
	mode: number;
};

export function ChannelMessageBox({ channelId, clanId, mode }: Readonly<ChannelMessageBoxProps>) {
	const { sendMessage, sendMessageTyping } = useChatSending({ channelId, mode });
	const isShowMemberList = useSelector(selectIsShowMemberList);
	const { subPanelActive } = useGifsStickersEmoji();
	const [classNamePopup] = useState<string>(`fixed bottom-[66px] z-10 max-sm:hidden bl ${isShowMemberList ? 'right-64' : 'right-4'}`);
	const [isEmojiOnChat, setIsEmojiOnChat] = useState<boolean>(false);
	const [emojiAction, setEmojiAction] = useState<EmojiPlaces>(EmojiPlaces.EMOJI_REACTION_NONE);
	const idMessageRefReaction = useSelector(selectIdMessageRefReaction);

	const handleSend = useCallback(
		(
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
			value?: ThreadValue,
			anonymous?: boolean,
			mentionEveryone?: boolean,
		) => {
			sendMessage(content, mentions, attachments, references, anonymous, mentionEveryone);
		},
		[sendMessage],
	);

	const handleTyping = useCallback(() => {
		sendMessageTyping();
	}, [sendMessageTyping]);
	const handleTypingDebounced = useThrottledCallback(handleTyping, 1000);

	useEffect(() => {
		if (
			subPanelActive !== SubPanelName.NONE &&
			subPanelActive !== SubPanelName.EMOJI_REACTION_RIGHT &&
			subPanelActive !== SubPanelName.EMOJI_REACTION_BOTTOM
		) {
			setIsEmojiOnChat(true);
		} else {
			setIsEmojiOnChat(false);
		}
	}, [subPanelActive]);

	useEffect(() => {
		if (
			(subPanelActive === SubPanelName.EMOJI_REACTION_RIGHT && window.innerWidth < 640) ||
			(subPanelActive === SubPanelName.EMOJI_REACTION_BOTTOM && window.innerWidth < 640)
		) {
			setIsEmojiOnChat(true);
		}
	}, [subPanelActive]);

	useEffect(() => {
		if (subPanelActive === SubPanelName.EMOJI) {
			setEmojiAction(EmojiPlaces.EMOJI_EDITOR);
		}
		if (subPanelActive === SubPanelName.EMOJI_REACTION_RIGHT || subPanelActive === SubPanelName.EMOJI_REACTION_BOTTOM) {
			setEmojiAction(EmojiPlaces.EMOJI_REACTION);
		}
	}, [subPanelActive]);

	return (
		<div className="mx-2 relative " role="button" aria-hidden>
			{isEmojiOnChat && (
				<div
					className={classNamePopup}
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					<GifStickerEmojiPopup />
				</div>
			)}
			<ReplyMessageBox />
			<MessageBox
				listMentions={UserMentionList({ channelID: channelId })}
				onSend={handleSend}
				onTyping={handleTypingDebounced}
				currentChannelId={channelId}
				currentClanId={clanId}
				mode={mode}
			/>
			{isEmojiOnChat && (
				<div
					className={`relative h-[300px]  overflow-y-scroll w-full hidden max-sm:block animate-slideUp`}
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					<GifStickerEmojiPopup emojiAction={emojiAction} mode={mode} messageEmojiId={idMessageRefReaction} />
				</div>
			)}
		</div>
	);
}

ChannelMessageBox.Skeleton = () => {
	return (
		<div>
			<MessageBox.Skeleton />
		</div>
	);
};
