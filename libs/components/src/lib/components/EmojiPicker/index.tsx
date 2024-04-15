import { useChatReaction, useEmojiSuggestion, useGifsStickersEmoji, useReference } from '@mezon/core';
import { EmojiPlaces, IMessageWithUser, SubPanelName } from '@mezon/utils';
import EmojiPicker, { EmojiClickData, EmojiStyle, SuggestionMode, Theme } from 'emoji-picker-react';
import { ChannelStreamMode } from 'mezon-js';

export type EmojiPickerOptions = {
	messageEmoji?: IMessageWithUser;
	emojiAction?: EmojiPlaces;
	mode?: number;
	emojiExist?: string;
};

function EmojiPickerComp(props: EmojiPickerOptions) {
	const { reactionMessageDispatch, setReactionRightState, setReactionBottomState, setReactionPlaceActive, setUserReactionPanelState } =
		useChatReaction();
	const { setReferenceMessage } = useReference();
	const { setEmojiSuggestion } = useEmojiSuggestion();
	const { setSubPanelActive } = useGifsStickersEmoji();
	const handleEmojiSelect = async (emojiData: EmojiClickData, event: MouseEvent) => {
		if (props.emojiAction === EmojiPlaces.EMOJI_REACTION || props.emojiAction === EmojiPlaces.EMOJI_REACTION_BOTTOM) {
			await reactionMessageDispatch(
				'',
				props.mode ?? ChannelStreamMode.STREAM_MODE_CHANNEL,
				props.messageEmoji?.id ?? '',
				emojiData.emoji,
				1,
				props.messageEmoji?.sender_id ?? '',
				false,
			);
			event.stopPropagation();
			setReactionRightState(false);
			setReactionBottomState(false);
			setReactionPlaceActive(EmojiPlaces.EMOJI_REACTION_NONE);
			setReferenceMessage(null);
			setUserReactionPanelState(false);
		} else if (props.emojiAction === EmojiPlaces.EMOJI_EDITOR) {
			setEmojiSuggestion(emojiData.emoji);
			event.stopPropagation();
			setSubPanelActive(SubPanelName.NONE);
		}
	};

	return (
		<>
			<div onClick={(event) => event.stopPropagation()} className="z-20">
				<EmojiPicker
					suggestedEmojisMode={SuggestionMode.FREQUENT}
					onEmojiClick={handleEmojiSelect}
					width={500}
					theme={Theme.DARK}
					height={458}
					emojiStyle={EmojiStyle.NATIVE}
				/>
			</div>
		</>
	);
}

export default EmojiPickerComp;
