import { useEmojiSuggestion } from '@mezon/core';
import { MentionDataProps } from '@mezon/utils';
import { FC } from 'react';
import { Pressable } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import SuggestItem from './SuggestItem';
import { useMemo } from 'react';

export interface MentionSuggestionsProps {
	suggestions: MentionDataProps[];
	keyword?: string;
	onSelect: (user: MentionDataProps) => void;
}

const Suggestions: FC<MentionSuggestionsProps> = ({ keyword, onSelect, suggestions = [] }) => {
	
	const formattedMentionList = useMemo(() => {
		if (keyword === null || !suggestions.length) {
			return [];
		}

		const mentionSearchText = keyword?.toLocaleLowerCase();

		const filterMatchedMentions = (mentionData: MentionDataProps) => {
			return mentionData?.display.toLocaleLowerCase().includes(mentionSearchText)
		}
		
		const sortDisplayNameFunction = (a, b) => {
			const indexA = a.display.indexOf(mentionSearchText);
			const indexB = b.display.indexOf(mentionSearchText);
		  
			if (indexA === -1 && indexB === -1) {
			  return a.display.localeCompare(b.display);
			}
			if (indexA === -1) return 1;
			if (indexB === -1) return -1;
			if (indexA === indexB) {
			  return a.display.localeCompare(b.display);
			}

			return indexA - indexB;
		};

		return suggestions
			.filter(filterMatchedMentions)
		  	.sort(sortDisplayNameFunction)
			.map((item) => ({
				...item,
				name: item.display,
			}))
	}, [keyword, suggestions])

	if (keyword == null) {
		return null;
	}

	const handleSuggestionPress = (user: MentionDataProps) => {
		onSelect(user as MentionDataProps);
	};
	return (
		<FlatList
			style={{ maxHeight: 200 }}
			data={formattedMentionList}
			renderItem={({ item }) => (
				<Pressable onPress={() => handleSuggestionPress(item)}>
					<SuggestItem isDisplayDefaultAvatar={true} name={item.display ?? ''} avatarUrl={item.avatarUrl} subText="" />
				</Pressable>
			)}
			keyExtractor={(_, index) => index.toString()}
			onEndReachedThreshold={0.1}
			keyboardShouldPersistTaps="handled"
		/>
	);
};

export type ChannelsMention = {
	id: string;
	display: string;
	subText: string;
	name?: string;
};

export interface MentionHashtagSuggestionsProps {
	readonly listChannelsMention?: ChannelsMention[];
	keyword?: string;
	onSelect: (user: MentionDataProps) => void;
}

const HashtagSuggestions: FC<MentionHashtagSuggestionsProps> = ({ keyword, onSelect, listChannelsMention }) => {
	if (keyword == null) {
		return null;
	}
	listChannelsMention = listChannelsMention.map((item) => ({
		...item,
		name: item.display,
	}));

	const handleSuggestionPress = (channel: ChannelsMention) => {
		onSelect(channel);
	};

	return (
		<FlatList
			style={{ maxHeight: 200 }}
			data={listChannelsMention?.filter((item) => item?.name.toLocaleLowerCase().includes(keyword?.toLocaleLowerCase()))}
			renderItem={({ item }) => (
				<Pressable onPress={() => handleSuggestionPress(item)}>
					<SuggestItem isDisplayDefaultAvatar={false} name={item.display ?? ''} symbol="#" subText={(item as ChannelsMention).subText} />
				</Pressable>
			)}
			keyExtractor={(_, index) => index.toString()}
			onEndReachedThreshold={0.1}
			keyboardShouldPersistTaps="handled"
		/>
	);
};

export interface IEmojiSuggestionProps {
	keyword?: string;
	onSelect: (emoji: IEmoji) => void;
}

export type IEmoji = {
	src: string;
	shortname: string;
	category: string;
	id: string;
	name: string;
};

const EmojiSuggestion: FC<IEmojiSuggestionProps> = ({ keyword, onSelect }) => {
	const { emojiListPNG } = useEmojiSuggestion();
	let emojiData = [];
	if (!keyword) {
		return;
	}
	emojiData = emojiListPNG.map((emoji) => ({
		...emoji,
		name: emoji?.shortname,
		id: emoji?.shortname,
		display: emoji?.shortname,
	}));

	const handleEmojiSuggestionPress = (emoji: IEmoji) => {
		onSelect(emoji);
	};

	return (
		<FlatList
			style={{ maxHeight: 200 }}
			data={emojiData?.filter((emoji) => emoji?.shortname && emoji?.shortname?.indexOf(keyword?.toLowerCase()) > -1)?.slice(0, 20)}
			renderItem={({ item }) => (
				<Pressable onPress={() => handleEmojiSuggestionPress(item)}>
					<SuggestItem isDisplayDefaultAvatar={false} name={item?.display ?? ''} />
				</Pressable>
			)}
			keyExtractor={(_, index) => index.toString()}
			onEndReachedThreshold={0.1}
			keyboardShouldPersistTaps="handled"
		/>
	);
};

export { EmojiSuggestion, HashtagSuggestions, Suggestions };
