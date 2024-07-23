import { ChannelStreamMode } from 'mezon-js';
import { memo, useMemo } from 'react';
import { ChannelHashtag, EmojiMarkup, MarkdownContent, MentionUser, PlainText } from '../../components';

type MessageLineProps = {
	line: string;
	messageId?: string;
	mode?: number;
	content?: any;
};

interface RenderContentProps {
	data: any;
	mode: number;
}

// TODO: refactor component for message lines
const RenderContent = memo(({ data, mode }: RenderContentProps) => {
	const { t, mentions = [], hashtags = [], emojis = [], links = [], markdowns = [] } = data;
	const elements = [...mentions, ...hashtags, ...emojis, ...links, ...markdowns].sort((a, b) => a.startIndex - b.startIndex);
	let lastIndex = 0;

	const content = useMemo(() => {
		const tempContent: React.ReactNode[] = [];

		elements.forEach((element, index) => {
			const { startIndex, endIndex, channelId, channelLable, username, shortname, markdown, link } = element;

			if (lastIndex < startIndex) {
				tempContent.push(<PlainText text={t.slice(lastIndex, startIndex)} />);
			}

			if (channelId && channelLable) {
				tempContent.push(<ChannelHashtag key={`${index}${startIndex}${channelId}`} channelHastagId={`<#${channelId}>`} />);
			}
			if (username) {
				tempContent.push(<MentionUser key={`${index}${startIndex}${username}`} tagName={username} mode={mode} />);
			}
			if (shortname) {
				tempContent.push(<EmojiMarkup key={`${index}${startIndex}${shortname}`} emojiSyntax={shortname} onlyEmoji={false} />);
			}

			if (markdown || link) {
				tempContent.push(<MarkdownContent key={`${index}${startIndex}${markdown}`} content={markdown} />);
			}
			lastIndex = endIndex;
		});

		if (lastIndex < t.length) {
			tempContent.push(<PlainText text={t.slice(lastIndex)} />);
		}

		return tempContent;
	}, [elements, t, mode]);
	return <div>{content}</div>;
});

const MessageLine = ({ mode, content }: MessageLineProps) => {
	return (
		<div>
			<RenderContent data={content} mode={mode ?? ChannelStreamMode.STREAM_MODE_CHANNEL} />
		</div>
	);
};

export default memo(MessageLine);
