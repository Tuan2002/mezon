import { Attributes, Colors } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) => StyleSheet.create({
	closeIcon: {
		color: Colors.white,
	},
	container: {
		flex: 1,
		backgroundColor: colors.primary,
	},
	bgDefault: {
		backgroundColor: colors.secondary,
	},
	fill: {
		flex: 1,
	},
	headerWrapper: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingTop: 70,
		paddingBottom: 15,
		paddingHorizontal: 10,
		backgroundColor: colors.secondary,
	},
	headerContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	textTitle: {
		color: colors.textStrong,
		fontSize: 20,
		marginLeft: 10,
	},
	confirm: {
		color: colors.textStrong,
		fontSize: 18,
		marginLeft: 10,
	},
});
