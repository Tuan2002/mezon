import { ChannelsEntity, selectChannelsEntities } from '@mezon/store';
import {
	IEmojiOnMessage,
	IExtendedMessage,
	IHashtagOnMessage,
	ILinkOnMessage,
	ILinkVoiceRoomOnMessage,
	IMarkdownOnMessage,
	IMentionOnMessage,
	convertMarkdown,
} from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { memo, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ChannelHashtag, EmojiMarkup, MarkdownContent, MentionUser, PlainText } from '../../components';

type MessageLineProps = {
	mode?: number;
	content?: IExtendedMessage;
	onClickToMessage?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	isOnlyContainEmoji?: boolean;
	isSearchMessage?: boolean;

	isJumMessageEnabled: boolean;
	isSingleLine: boolean;
};

const MessageLine = ({
	mode,
	content,
	isJumMessageEnabled,
	onClickToMessage,
	isOnlyContainEmoji,
	isSearchMessage,
	isSingleLine,
}: MessageLineProps) => {
	const allChannels = useSelector(selectChannelsEntities);
	const allChannelVoice = Object.values(allChannels).flat();
	const [maxWidth, setMaxWidth] = useState(window.innerWidth - 600);

	useEffect(() => {
		const handleResize = () => {
			setMaxWidth(window.innerWidth - 600);
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);
	return (
		<div
			onClick={!isJumMessageEnabled ? onClickToMessage : () => {}}
			className={`${!isJumMessageEnabled ? '' : 'cursor-pointer'} flex flex-row ${isSingleLine ? 'mt-1' : ''} items-center`}
		>
			<RenderContent
				isOnlyContainEmoji={isOnlyContainEmoji}
				isJumMessageEnabled={isJumMessageEnabled}
				isSingleLine={isSingleLine}
				data={content as IExtendedMessage}
				mode={mode ?? ChannelStreamMode.STREAM_MODE_CHANNEL}
				allChannelVoice={allChannelVoice}
				isSearchMessage={isSearchMessage}
				parentWidth={maxWidth}
			/>
		</div>
	);
};

export default memo(MessageLine);

interface RenderContentProps {
	data: IExtendedMessage;
	mode: number;
	allChannelVoice?: ChannelsEntity[];
	isOnlyContainEmoji?: boolean;
	isSearchMessage?: boolean;
	isSingleLine: boolean;
	isJumMessageEnabled: boolean;
	parentWidth?: number;
}
type MessageElementToken = IMentionOnMessage | IHashtagOnMessage | IEmojiOnMessage | ILinkOnMessage | IMarkdownOnMessage | ILinkVoiceRoomOnMessage;

const isMentionOnMessageUser = (element: MessageElementToken): element is IMentionOnMessage => (element as IMentionOnMessage).user_id !== undefined;

const isMentionOnMessageRole = (element: MessageElementToken): element is IMentionOnMessage => (element as IMentionOnMessage).role_id !== undefined;

const isHashtagOnMessage = (element: MessageElementToken): element is IHashtagOnMessage => (element as IHashtagOnMessage).channelid !== undefined;

const isEmojiOnMessage = (element: MessageElementToken): element is IEmojiOnMessage => (element as IEmojiOnMessage).emojiid !== undefined;

const isLinkOnMessage = (element: MessageElementToken): element is ILinkOnMessage => (element as ILinkOnMessage).lk !== undefined;

const isMarkdownOnMessage = (element: MessageElementToken): element is IMarkdownOnMessage => (element as IMarkdownOnMessage).mk !== undefined;

const isLinkVoiceRoomOnMessage = (element: MessageElementToken): element is ILinkVoiceRoomOnMessage =>
	(element as ILinkVoiceRoomOnMessage).vk !== undefined;

// TODO: refactor component for message lines
const RenderContent = memo(
	({ data, mode, allChannelVoice, isSearchMessage, isSingleLine, isJumMessageEnabled, parentWidth, isOnlyContainEmoji }: RenderContentProps) => {
		const { t, mentions = [], hg = [], ej = [], mk = [], lk = [], vk = [] } = data;
		const elements = [...mentions, ...hg, ...ej, ...mk, ...lk, ...vk].sort((a, b) => (a.s ?? 0) - (b.s ?? 0));
		let lastindex = 0;
		const content = useMemo(() => {
			const formattedContent: React.ReactNode[] = [];

			elements.forEach((element, index) => {
				const s = element.s ?? 0;
				const e = element.e ?? 0;
				if (lastindex < s) {
					formattedContent.push(
						<PlainText
							isSingleLine={isSingleLine}
							isJumMessageEnabled={isJumMessageEnabled}
							isSearchMessage={isSearchMessage}
							key={`plain-${lastindex}`}
							text={t?.slice(lastindex, s) ?? ''}
						/>,
					);
				}

				if (isHashtagOnMessage(element)) {
					formattedContent.push(
						<ChannelHashtag
							isSingleLine={isSingleLine}
							key={`hashtag-${index}-${s}-${element.channelid}`}
							channelHastagId={`<#${element.channelid}>`}
						/>,
					);
				}

				if (isMentionOnMessageUser(element)) {
					formattedContent.push(
						<MentionUser
							isSingleLine={isSingleLine}
							key={`mentionUser-${index}-${s}-${element.username}-${element.user_id}`}
							tagName={element.username ?? ''}
							tagUserId={element.user_id ?? ''}
							mode={mode}
						/>,
					);
				}

				if (isMentionOnMessageRole(element)) {
					formattedContent.push(
						<MentionUser
							isSingleLine={isSingleLine}
							key={`mentionRole-${index}-${s}-${element.rolename}-${element.role_id}`}
							tagName={element.rolename ?? ''}
							tagUserId={element.role_id ?? ''}
							mode={mode}
						/>,
					);
				}

				if (isEmojiOnMessage(element)) {
					formattedContent.push(
						<EmojiMarkup
							isSingleLine={isSingleLine}
							key={`emoji-${index}-${s}-${element.emojiid}`}
							emojiSyntax={element.shortname ?? ''}
							onlyEmoji={isOnlyContainEmoji ?? false}
							emojiId={element.emojiid ?? ''}
						/>,
					);
				}

				if (isLinkOnMessage(element)) {
					formattedContent.push(<MarkdownContent key={`link-${index}-${s}-${element.lk}`} content={element.lk as string} />);
				}

				if (isLinkVoiceRoomOnMessage(element)) {
					const meetingCode = element.vk?.split('/').pop();
					const voiceChannelFound = allChannelVoice?.find((channel) => channel.meeting_code === meetingCode) || null;
					voiceChannelFound
						? formattedContent.push(
								<ChannelHashtag
									isSingleLine={isSingleLine}
									// isTokenClickable={isTokenClickable}
									key={`voicelink-${index}-${s}-${voiceChannelFound?.channel_id}`}
									channelHastagId={`<#${voiceChannelFound?.channel_id}>`}
								/>,
							)
						: formattedContent.push(<MarkdownContent key={`voicelink-${index}-${s}-${element.vk}`} content={element.vk as string} />);
				}

				if (isMarkdownOnMessage(element)) {
					const converted = element.mk?.startsWith('```') && element.mk?.endsWith('```') ? convertMarkdown(element.mk) : element.mk;
					formattedContent.push(<MarkdownContent key={`markdown-${index}-${s}-${element.mk}`} content={converted as string} />);
				}
				lastindex = e;
			});

			if (t && lastindex < t?.length) {
				formattedContent.push(
					<PlainText
						isSingleLine={isSingleLine}
						isJumMessageEnabled={isJumMessageEnabled}
						isSearchMessage={isSearchMessage}
						key={`plain-${lastindex}-end`}
						text={t.slice(lastindex)}
					/>,
				);
			}

			return formattedContent;
		}, [elements, t, mode]);

		return (
			<div
				style={
					isSingleLine
						? {
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								maxWidth: parentWidth,
								color: isJumMessageEnabled ? '#B4BAC0' : 'white',
							}
						: undefined
				}
				className={`whitespace-pre-line hover:text-[#060607] hover:dark:text-[#E6F3F5] text-[#4E5057]`}
			>
				{content}{' '}
			</div>
		);
	},
);
