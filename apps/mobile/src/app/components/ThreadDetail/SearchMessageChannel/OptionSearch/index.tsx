import { NittroIcon } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { Text, View } from 'react-native';
import { style } from './OptionSearch.styles';

type Option = { option: { title: string; content: string; value: string } };
const OptionSearch = ({ option }: Option) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	return (
		<View style={styles.wrapperOption}>
			<View style={styles.content}>
				<Text numberOfLines={1} ellipsizeMode="tail" style={styles.textOption}>
					{option?.title}
				</Text>
				<Text numberOfLines={1} ellipsizeMode="tail" style={styles.textOption}>
					{option?.content}
				</Text>
			</View>
			<NittroIcon />
		</View>
	);
};

export default OptionSearch;
