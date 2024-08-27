import { selectEmojiObjSuggestion } from '@mezon/store';
import { EMarkdownType, IEmojiOnMessage, ILinkOnMessage, ILinkVoiceRoomOnMessage, IMarkdownOnMessage } from '@mezon/utils';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const useProcessedContent = (inputText: string) => {
	const [emojiList, setEmojiList] = useState<IEmojiOnMessage[]>([]);
	const [linkList, setLinkList] = useState<ILinkOnMessage[]>([]);
	const [markdownList, setMarkdownList] = useState<IMarkdownOnMessage[]>([]);
	const [voiceLinkRoomList, setVoiceLinkRoomList] = useState<ILinkVoiceRoomOnMessage[]>([]);
	const emojiObjPicked = useSelector(selectEmojiObjSuggestion);
	const resultString = inputText.replace(/\[|\]/g, '');
	
	useEffect(() => {
		const processInput = () => {
			const { emojis, links, markdowns, voiceRooms } = processText(resultString, emojiObjPicked);
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

const processText = (inputString: string, emojiObjPicked: any) => {
	const emojis: IEmojiOnMessage[] = [];
	const links: ILinkOnMessage[] = [];
	const markdowns: IMarkdownOnMessage[] = [];
	const voiceRooms: ILinkVoiceRoomOnMessage[] = [];

	const singleBacktick = '`';
	const tripleBacktick = '```';
	const httpPrefix = 'http';
	const googleMeetPrefix = 'https://meet.google.com/';

	let i = 0;
	while (i < inputString.length) {
		if (inputString[i] === ':') {
			// Emoji processing
			const startindex = i;
			i++;
			let shortname = '';
			while (i < inputString.length && inputString[i] !== ':') {
				shortname += inputString[i];
				i++;
			}
			if (i < inputString.length && inputString[i] === ':') {
				const endindex = i + 1;
				const preCharFour = inputString.substring(startindex - 4, startindex);
				const preCharFive = inputString.substring(startindex - 5, startindex);
				if (preCharFour !== 'http' && preCharFive !== 'https' && emojiObjPicked?.[`:${shortname}:`]) {
					emojis.push({
						emojiid: emojiObjPicked?.[`:${shortname}:`],
						s: startindex,
						e: endindex,
					});
				}
				i++;
			}
		} else if (inputString.startsWith(httpPrefix, i)) {
			// Link processing
			const startindex = i;
			i += httpPrefix.length;
			while (i < inputString.length && ![' ', '\n', '\r', '\t'].includes(inputString[i])) {
				i++;
			}
			const endindex = i;
			const link = inputString.substring(startindex, endindex);

			if (link.startsWith(googleMeetPrefix)) {
				voiceRooms.push({
					s: startindex,
					e: endindex,
				});
			} else {
				links.push({
					s: startindex,
					e: endindex,
				});
			}
		} else if (inputString.substring(i, i + tripleBacktick.length) === tripleBacktick) {
			// Triple backtick markdown processing
			const startindex = i;
			i += tripleBacktick.length;
			let markdown = '';
			while (i < inputString.length && inputString.substring(i, i + tripleBacktick.length) !== tripleBacktick) {
				markdown += inputString[i];
				i++;
			}
			if (i < inputString.length && inputString.substring(i, i + tripleBacktick.length) === tripleBacktick) {
				i += tripleBacktick.length;
				const endindex = i;
				if (markdown.trim().length > 0) {
					markdowns.push({ type: EMarkdownType.TRIPLE, s: startindex, e: endindex });
				}
			}
		} else if (inputString[i] === singleBacktick) {
			// Single backtick markdown processing
			const startindex = i;
			i++;
			let markdown = '';
			while (i < inputString.length && inputString[i] !== singleBacktick) {
				markdown += inputString[i];
				i++;
			}
			if (i < inputString.length && inputString[i] === singleBacktick) {
				const endindex = i + 1;
				const nextChar = inputString[endindex];
				if (!markdown.includes('``') && markdown.trim().length > 0 && nextChar !== singleBacktick) {
					markdowns.push({ type: EMarkdownType.SINGLE, s: startindex, e: endindex });
				}
				i++;
			}
		} else {
			i++;
		}
	}

	return { emojis, links, markdowns, voiceRooms };
};
