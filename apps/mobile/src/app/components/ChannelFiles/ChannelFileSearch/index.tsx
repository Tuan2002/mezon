import { debounce, Icons } from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';
import { style } from './styles';

type fileSearchProps = {
	onSearchTextChange?: (text: string) => void;
};

const ChannelFileSearch = ({ onSearchTextChange }: fileSearchProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const searchInputRef = useRef(null);
	const [searchText, setSearchText] = useState<string>('');
	const { t } = useTranslation(['channelMenu']);

	const clearTextInput = () => {
		if (searchInputRef?.current) {
			searchInputRef.current.clear();
			setSearchText('');
			onSearchTextChange('');
		}
	};

	const typingSearchDebounce = debounce((text) => {
		setSearchText(text);
		onSearchTextChange(text);
	}, 500);

	return (
		<View style={styles.searchFiles}>
			<Icons.MagnifyingIcon height={size.s_20} width={size.s_20} color={themeValue.text} />
			<TextInput
				ref={searchInputRef}
				placeholder={t('menu.thread.searchFiles')}
				placeholderTextColor={themeValue.text}
				style={styles.searchInput}
				onChangeText={(text) => typingSearchDebounce(text)}
			/>
			{!!searchText?.length && (
				<Pressable onPress={clearTextInput}>
					<Icons.CircleXIcon height={size.s_20} width={size.s_20} color={themeValue.text} />
				</Pressable>
			)}
		</View>
	);
};

export default React.memo(ChannelFileSearch);
