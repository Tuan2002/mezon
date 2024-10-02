import { useTheme } from '@mezon/mobile-ui';
import { ETokenMessage, IExtendedMessage, getSrcEmoji } from '@mezon/utils';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { style } from './styles';

interface ElementToken {
	s?: number;
	e?: number;
	kindOf: ETokenMessage;
	emojiid?: string;
}

type IEmojiMarkup = {
	shortname: string;
	emojiid: string;
};

export const DmListItemLastMessage = React.memo((props: { content: IExtendedMessage }) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { t, ej = [] } = props.content || {};
	const emojis = Array.isArray(ej) ? ej.map((item) => ({ ...item, kindOf: ETokenMessage.EMOJIS })) : [];
	const elements: ElementToken[] = [...emojis].sort((a, b) => (a.s ?? 0) - (b.s ?? 0));
	const splitEmojisRegex = /([^)\s]*\))/g;
	const emojiUrlRegex = /\((.*?)\)/;

	const EmojiMarkup = ({ shortname, emojiid }: IEmojiMarkup) => {
		const srcEmoji = getSrcEmoji(emojiid);

		if (!srcEmoji) {
			return shortname;
		}
		return `[${shortname}](${srcEmoji})`;
	};

	let lastIndex = 0;
	const formatEmojiInText = useMemo(() => {
		let formattedContent = '';
		elements.forEach((element) => {
			const s = element.s ?? 0;
			const e = element.e ?? 0;

			console.log('>last ', lastIndex, s);

			const contentInElement = t?.substring?.(s, e);
			if (lastIndex < s) {
				formattedContent += t?.slice?.(lastIndex, s)?.toString() ?? '';
			}
			if (element.kindOf === ETokenMessage.EMOJIS) {
				formattedContent += EmojiMarkup({ shortname: contentInElement, emojiid: element.emojiid });
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
			lastIndex = e;
		});
		if (lastIndex < t?.length) {
			formattedContent += t?.slice?.(lastIndex)?.toString();
		}
		return formattedContent;
	}, []);

	const convertTextToEmoji = () => {
		const parts = formatEmojiInText.split(splitEmojisRegex);
		return parts.map((item) => {
			if (splitEmojisRegex.test(item)) {
				const url = item.match(emojiUrlRegex);
				return (
					<FastImage
						style={styles.emoji}
						source={{
							uri: url?.[1]
						}}
					/>
				);
			}
			return <Text style={styles.message}>{item}</Text>;
		});
	};

	return <View style={styles.dmMessageContainer}>{convertTextToEmoji()}</View>;
});
