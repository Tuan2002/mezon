import { useCategory } from '@mezon/core';
import { EOptionOverridesType, Icons } from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, TextInput } from 'react-native';
import CategoryChannelItem from '../CategoryChannelItem';
import { style } from './NotificationOverrides.styles';

const NotificationOverrides = () => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { categorizedChannels } = useCategory();
	const [searchText, setSearchText] = useState<string>('');

	const options = useMemo(() => {
		if (!categorizedChannels?.length) return [];
		return categorizedChannels?.flatMap((category) => [
			{
				id: category.id,
				label: category.category_name,
				title: 'category',
				type: EOptionOverridesType.Category,
			},
			...category.channels
				.filter((channel) => channel.type !== 4)
				.map((channel) => ({
					id: channel.id,
					label: channel.channel_label,
					title: 'channel',
					type: EOptionOverridesType.Channel,
				})),
		]);
	}, [categorizedChannels]);

	const [filteredOptions, setFilteredOptions] = useState(options);

	const onTextChange = (searchText: string) => {
		const filtered = options?.filter((option) => option?.label?.toLowerCase()?.includes(searchText?.toLowerCase()));
		setFilteredOptions(filtered);
		setSearchText(searchText);
	};

	return (
		<SafeAreaView>
			<Block backgroundColor={themeValue.primary} width={'100%'} height={'100%'}>
				<Block
					paddingHorizontal={size.s_20}
					paddingVertical={size.s_10}
					borderTopColor={themeValue.border}
					borderBottomColor={themeValue.border}
					borderWidth={1}
				>
					<Block
						backgroundColor={themeValue.tertiary}
						flexDirection="row"
						alignItems="center"
						justifyContent="space-between"
						borderRadius={size.s_6}
						paddingHorizontal={size.s_10}
						paddingVertical={size.s_4}
					>
						<TextInput
							placeholderTextColor={themeValue.textDisabled}
							placeholder={'Search'}
							style={styles.input}
							value={searchText}
							onChangeText={onTextChange}
						/>
						<Icons.MagnifyingIcon width={20} height={20} color={themeValue.text} />
					</Block>
				</Block>
				<ScrollView>
					{(filteredOptions?.length > 0)
						? filteredOptions?.map((item) => (
								<CategoryChannelItem
									categoryLabel={item?.label}
									typePreviousIcon={item?.type}
									expandable={true}
									key={item?.id}
									stylesItem={styles.categoryItem}
									data={item}
									categoryChannelId={item?.id}
								/>
							))
						: null}
				</ScrollView>
			</Block>
		</SafeAreaView>
	);
};

export default NotificationOverrides;
