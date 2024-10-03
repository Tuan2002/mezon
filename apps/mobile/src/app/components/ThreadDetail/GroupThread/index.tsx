import { Block, size, useTheme } from '@mezon/mobile-ui';
import { Text, View } from 'react-native';
import { style } from './GroupThread.style';

type GroupThreadsProps = {
	title: string;
	children: React.ReactNode;
};
const GroupThread = ({ title, children }: GroupThreadsProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	return (
		<View>
			<Block marginTop={size.s_10}>
				<Text style={styles.title}>{title}</Text>
				<View style={styles.groupThread}>{children}</View>
			</Block>
		</View>
	);
};

export default GroupThread;
