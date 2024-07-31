import { IEmojiOnMessage, ILinkOnMessage, ILinkVoiceRoomOnMessage, IMarkdownOnMessage } from '@mezon/utils';
import { useEffect, useState } from 'react';

const useProcessedContent = (inputText: string) => {
	const [emojiList, setEmojiList] = useState<IEmojiOnMessage[]>([]);
	const [linkList, setLinkList] = useState<ILinkOnMessage[]>([]);
	const [markdownList, setMarkdownList] = useState<IMarkdownOnMessage[]>([]);
	const [voiceLinkRoomList, setVoiceLinkRoomList] = useState<ILinkVoiceRoomOnMessage[]>([]);

	useEffect(() => {
		const processInput = () => {
			const { emojis, links, markdowns, voiceRooms } = processText(inputText);
			setEmojiList(emojis);
			setLinkList(links);
			setMarkdownList(markdowns);
			setVoiceLinkRoomList(voiceRooms);
		};

		processInput();
	}, [inputText]);
	return { emojiList, linkList, markdownList, inputText, voiceLinkRoomList };
};

export default useProcessedContent;

const processText = (inputString: string) => {
	const emojis: IEmojiOnMessage[] = [];
	const links: ILinkOnMessage[] = [];
	const markdowns: IMarkdownOnMessage[] = [];
	const voiceRooms: ILinkVoiceRoomOnMessage[] = [];

	const singleBacktick: string = '`';
	const tripleBacktick: string = '```';
	const httpPrefix: string = 'http';
	const googleMeetPrefix: string = 'https://meet.google.com/';

	let i = 0;
	while (i < inputString.length) {
		if (inputString[i] === ':') {
			// Emoji processing
			const startIndex = i;
			i++;
			let shortname = '';
			while (i < inputString.length && inputString[i] !== ':') {
				shortname += inputString[i];
				i++;
			}
			if (i < inputString.length && inputString[i] === ':') {
				const endIndex = i + 1;
				const preCharFour = inputString.substring(startIndex - 4, startIndex);
				const preCharFive = inputString.substring(startIndex - 5, startIndex);
				if (preCharFour !== 'http' && preCharFive !== 'https') {
					emojis.push({
						shortname: `:${shortname}:`,
						startIndex: startIndex,
						endIndex: endIndex,
					});
				}
				i++;
			}
		} else if (inputString.startsWith(httpPrefix, i)) {
			// Link processing
			const startIndex = i;
			i += httpPrefix.length;
			while (i < inputString.length && ![' ', '\n', '\r', '\t'].includes(inputString[i])) {
				i++;
			}
			const endIndex = i;
			const link = inputString.substring(startIndex, endIndex);

			if (link.startsWith(googleMeetPrefix)) {
				voiceRooms.push({
					voiceLink: link,
					startIndex,
					endIndex,
				});
			} else {
				links.push({
					link,
					startIndex,
					endIndex,
				});
			}
		} else if (inputString.substring(i, i + tripleBacktick.length) === tripleBacktick) {
			// Triple backtick markdown processing
			const startIndex = i;
			i += tripleBacktick.length;
			let markdown = '';
			while (i < inputString.length && inputString.substring(i, i + tripleBacktick.length) !== tripleBacktick) {
				markdown += inputString[i];
				i++;
			}
			if (i < inputString.length && inputString.substring(i, i + tripleBacktick.length) === tripleBacktick) {
				i += tripleBacktick.length;
				const endIndex = i;
				if (markdown.trim().length > 0) {
					markdowns.push({ type: 'triple', markdown: `\`\`\`${markdown}\`\`\``, startIndex, endIndex });
				}
			}
		} else if (inputString[i] === singleBacktick) {
			// Single backtick markdown processing
			const startIndex = i;
			i++;
			let markdown = '';
			while (i < inputString.length && inputString[i] !== singleBacktick) {
				markdown += inputString[i];
				i++;
			}
			if (i < inputString.length && inputString[i] === singleBacktick) {
				const endIndex = i + 1;
				const nextChar = inputString[endIndex];
				if (!markdown.includes('``') && markdown.trim().length > 0 && nextChar !== singleBacktick) {
					markdowns.push({ type: 'single', markdown: `\`${markdown}\``, startIndex, endIndex });
				}
				i++;
			}
		} else {
			i++;
		}
	}

	return { emojis, links, markdowns, voiceRooms };
};
