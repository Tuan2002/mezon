import { ChannelsEntity, selectAllChannels, selectAllHashtagDm, selectChannelById, selectNumberMemberVoiceChannel, selectTheme } from '@mezon/store';
import { HighlightMatchBold, Icons } from '@mezon/ui';
import { SearchItemProps, getSrcEmoji } from '@mezon/utils';
import { ChannelType, HashtagDm } from 'mezon-js';
import { memo, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { AvatarImage } from '../../AvatarImage/AvatarImage';

type SuggestItemProps = {
	avatarUrl?: string;
	symbol?: string;
	subText?: string;
	valueHightLight?: string;
	subTextStyle?: string;
	showAvatar?: boolean;
	channelId?: string | number;
	isOpenSearchModal?: boolean;
	wrapSuggestItemStyle?: string;
	emojiId?: string;
	display?: string;
	isHightLight?: boolean;
	channel?: SearchItemProps;
};

const SuggestItem = ({
	isOpenSearchModal,
	avatarUrl,
	channelId,
	subText,
	subTextStyle,
	valueHightLight,
	showAvatar,
	wrapSuggestItemStyle,
	emojiId,
	display,
	isHightLight = true,
	channel
}: SuggestItemProps) => {
	const allChannels = useSelector(selectAllChannels);
	const getChannel = allChannels.find((channel) => {
		return channel.channel_id === channelId;
	});

	const { directId } = useParams();
	const commonChannels = useSelector(selectAllHashtagDm);
	const theme = useSelector(selectTheme);
	const [specificChannel, setSpecificChannel] = useState<ChannelsEntity | HashtagDm | null>(null);
	const numberMembersVoice = useSelector(selectNumberMemberVoiceChannel(channelId as string));
	const checkVoiceStatus = useMemo(() => {
		if (channelId !== undefined && numberMembersVoice && specificChannel?.type === ChannelType.CHANNEL_TYPE_VOICE) {
			return numberMembersVoice >= 2;
		}
		return false;
	}, [channelId, numberMembersVoice, specificChannel?.type]);
	const channelIcon = useMemo(() => {
		if (!specificChannel) return null;

		const { channel_private, type, parrent_id } = specificChannel;

		if (type === ChannelType.CHANNEL_TYPE_TEXT && parrent_id === '0') {
			if (!channel_private || channel_private === 0) {
				return <Icons.Hashtag defaultSize="w-5 h-5" />;
			}
			if (channel_private === 1) {
				return <Icons.HashtagLocked defaultSize="w-5 h-5" />;
			}
		}

		if (type === ChannelType.CHANNEL_TYPE_THREAD) {
			if (!channel_private || channel_private === 0) {
				return <Icons.ThreadIcon defaultSize="w-5 h-5 dark:text-[#AEAEAE] text-colorTextLightMode" />;
			}
			if (channel_private === 1) {
				return <Icons.ThreadIconLocker className="w-5 h-5 dark:text-[#AEAEAE] text-colorTextLightMode" />;
			}
		}

		if (type === ChannelType.CHANNEL_TYPE_VOICE) {
			if (!channel_private || channel_private === 0) {
				return <Icons.Speaker defaultSize="w-5 5-5" />;
			}
			return <Icons.SpeakerLocked defaultSize="w-5 h-5" />;
		}

		if (type === ChannelType.CHANNEL_TYPE_STREAMING && (!channel_private || channel_private === 0)) {
			return <Icons.Stream defaultSize="w-5 5-5" />;
		}

		if (type === ChannelType.CHANNEL_TYPE_APP) {
			return <Icons.AppChannelIcon className={'w-5 h-5'} fill={theme} />;
		}

		return null;
	}, [specificChannel, theme]);

	useEffect(() => {
		if (channel) {
			setSpecificChannel(channel);
		} else if (directId && !isOpenSearchModal) {
			commonChannels.map((channel) => {
				if (channel.channel_id === channelId) {
					setSpecificChannel(channel);
				}
			});
		} else {
			allChannels.map((channel) => {
				if (channel.channel_id === channelId) {
					setSpecificChannel(channel);
				}
			});
		}
	}, []);

	return (
		<div className={`flex flex-row items-center h-[24px] ${wrapSuggestItemStyle ?? 'justify-between'}`}>
			<div className="flex flex-row items-center gap-2 py-[3px]">
				{showAvatar && (
					<AvatarImage
						alt={subText || ''}
						userName={subText}
						src={avatarUrl}
						className="size-4"
						classNameText="text-[9px] min-w-5 min-h-5 pt-[3px]"
					/>
				)}
				{emojiId && (
					<img src={getSrcEmoji(emojiId)} alt={getSrcEmoji(emojiId)} style={{ width: '32px', height: '32px', objectFit: 'cover' }} />
				)}
				{channelIcon}

				{display && (
					<span className="text-[15px] font-thin dark:text-white text-textLightTheme one-line">
						{isHightLight ? HighlightMatchBold(display ?? '', valueHightLight ?? '') : display}
					</span>
				)}
				{checkVoiceStatus && <i className="text-[15px] font-thin dark:text-text-zinc-400 text-colorDanger ">(busy)</i>}
			</div>
			<span className={`text-[10px] font-semibold text-[#A1A1AA] one-line ${subTextStyle}`}>
				{getChannel?.type === ChannelType.CHANNEL_TYPE_THREAD ? (
					<RenderChannelLabelForThread channel_id={getChannel?.parrent_id as string} />
				) : (
					<>{HighlightMatchBold(subText ?? '', valueHightLight ?? '')}</>
				)}
			</span>
		</div>
	);
};
const RenderChannelLabelForThread = ({ channel_id }: { channel_id: string }) => {
	const channelParent = useSelector(selectChannelById(channel_id));
	return <>{channelParent?.channel_label || null}</>;
};

export default memo(SuggestItem);
