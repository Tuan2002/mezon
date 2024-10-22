// import { IMessageLine } from '@mezon/utils';
// import { useMemo } from 'react';

// export function useMessageLine(line: string): IMessageLine {
// 	const combinedRegex = /./g;
// 	const emojiRegex = /^:\w+:$/;
// 	const extensionsRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;

// 	const isOnlyEmoji = useMemo(() => {
// 		if (!line?.trim()) {
// 			return false;
// 		}
// 		return emojiRegex.test(line);
// 	}, [line]);

// 	const processMatches = (regex: RegExp, inputLine: string) => {
// 		let lastIndex = 0;
// 		let nonMatchText = inputLine;
// 		const matches = inputLine.match(regex) || [];

// 		const processedMatches = matches.map((match, i) => {
// 			const startIndex = inputLine.indexOf(match, lastIndex);
// 			const endIndex = startIndex + match.length;
// 			const matchedText = inputLine.substring(startIndex, endIndex);
// 			nonMatchText = inputLine.substring(lastIndex, startIndex);
// 			lastIndex = endIndex;
// 			return {
// 				nonMatchText,
// 				matchedText,
// 				startIndex,
// 				endIndex
// 			};
// 		});

// 		if (processedMatches.length === 0) {
// 			return [
// 				{
// 					nonMatchText: nonMatchText,
// 					matchedText: '',
// 					startIndex: 0,
// 					endIndex: 0
// 				}
// 			];
// 		}

// 		if (lastIndex < inputLine.length) {
// 			processedMatches.push({
// 				nonMatchText: inputLine.substring(lastIndex),
// 				matchedText: '',
// 				startIndex: lastIndex,
// 				endIndex: inputLine.length
// 			});
// 		}

// 		return processedMatches;
// 	};

// 	const links = useMemo(() => {
// 		if (!line) {
// 			return [];
// 		}
// 		return processMatches(extensionsRegex, line);
// 	}, [line, extensionsRegex]);

// 	const mentions = useMemo(() => {
// 		if (!line) {
// 			return [];
// 		}
// 		const trimmedLine = line.trim();
// 		if ((trimmedLine.startsWith('```') && trimmedLine.endsWith('```')) || (trimmedLine.startsWith('`') && trimmedLine.endsWith('`'))) {
// 			return [
// 				{
// 					nonMatchText: line,
// 					matchedText: '',
// 					startIndex: 0,
// 					endIndex: line.length
// 				}
// 			];
// 		}

// 		return processMatches(combinedRegex, line);
// 	}, [line, combinedRegex]);

// 	return {
// 		mentions,
// 		isOnlyEmoji,
// 		links
// 	};
// }
