import { GifStickerEmojiPopup, Icons } from '@mezon/components';
import { useApp, useGifsStickersEmoji, useThreads } from '@mezon/core';
import {
	selectCloseMenu,
	selectCurrentChannel,
	selectIdMessageRefReaction,
	selectPositionEmojiButtonSmile,
	selectReactionTopState,
	selectStatusMenu,
} from '@mezon/store';
import { EmojiPlaces, SubPanelName } from '@mezon/utils';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';

const ChannelLayout = () => {
	const currentChannel = useSelector(selectCurrentChannel);
	const isChannelVoice = currentChannel?.type === ChannelType.CHANNEL_TYPE_VOICE;
	const reactionTopState = useSelector(selectReactionTopState);
	const idMessageRefReaction = useSelector(selectIdMessageRefReaction);
	const { subPanelActive } = useGifsStickersEmoji();
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);
	const { isShowCreateThread } = useThreads();
	const { isShowMemberList } = useApp();
	const positionOfSmileButton = useSelector(selectPositionEmojiButtonSmile);

	const HEIGHT_EMOJI_PANEL = 457;
	const WIDTH_EMOJI_PANEL = 500;
	const distanceToBottom = window.innerHeight - positionOfSmileButton.bottom;
	const distanceToRight = window.innerWidth - positionOfSmileButton.right;
	let topPositionEmojiPanel: string;

	if (distanceToBottom < HEIGHT_EMOJI_PANEL) {
		topPositionEmojiPanel = 'auto';
	} else if (positionOfSmileButton.top < 100) {
		topPositionEmojiPanel = `${positionOfSmileButton.top}px`;
	} else {
		topPositionEmojiPanel = `${positionOfSmileButton.top - 100}px`;
	}

	return (
		<div
			className="flex flex-col flex-1 shrink min-w-0 bg-transparent h-[100%] overflow-visible"
		>
			{isChannelVoice ? <ChannelLayoutVoice /> :
			<>
			<div className={`flex flex-row ${closeMenu ? 'h-heightWithoutTopBarMobile' : 'h-heightWithoutTopBar'}`}>
				<Outlet />
			</div>
			{subPanelActive === SubPanelName.EMOJI_REACTION_RIGHT && (
				<div
					id="emojiPicker"
					className={`fixed size-[500px] max-sm:hidden right-1 ${closeMenu && !statusMenu && 'w-[370px]'} ${reactionTopState ? 'top-20' : 'bottom-20'} ${isShowCreateThread && 'ssm:right-[650px]'} ${isShowMemberList && 'ssm:right-[420px]'} ${!isShowCreateThread && !isShowMemberList && 'ssm:right-44'}`}
				>
					<div className="mb-0 z-10 h-full">
						<GifStickerEmojiPopup
							messageEmojiId={idMessageRefReaction}
							mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
							emojiAction={EmojiPlaces.EMOJI_REACTION}
						/>
					</div>
				</div>
			)}
			{subPanelActive === SubPanelName.EMOJI_REACTION_BOTTOM && (
				<div
					className="fixed max-sm:hidden"
					style={{
						top: topPositionEmojiPanel,
						bottom: distanceToBottom < HEIGHT_EMOJI_PANEL ? '0' : 'auto',
						left:
							distanceToRight < WIDTH_EMOJI_PANEL
								? `${positionOfSmileButton.left - WIDTH_EMOJI_PANEL}px`
								: `${positionOfSmileButton.right}px`,
					}}
				>
					<div className="mb-0 z-10 h-full">
						<GifStickerEmojiPopup
							messageEmojiId={idMessageRefReaction}
							mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
							emojiAction={EmojiPlaces.EMOJI_REACTION}
						/>
					</div>
				</div>
			)}
			</>}
		</div>
	);
};

export default ChannelLayout;

const ChannelLayoutVoice = () =>{
	return(
		<div className="bg-black h-full flex flex-col font-semibold">
			<p className='flex-1 flex justify-center items-center'>You've popped out the player to another tab.</p>
			<div className="relative justify-center items-center gap-x-5 w-full bottom-5 flex h-[50px]">
				<button className="size-[50px] rounded-full bg-red-500 hover:bg-red-950">
					<Icons.PhoneOff defaultSize="rotate-[138deg] m-auto" />
				</button>
			</div>
		</div>
	)
}
