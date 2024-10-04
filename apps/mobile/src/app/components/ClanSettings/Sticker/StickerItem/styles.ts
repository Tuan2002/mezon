import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			backgroundColor: colors.primary,
			borderBottomColor: colors.border,
			borderBottomWidth: 1
		},
		flexRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: size.s_14
		},

		text: {
			color: colors.textStrong
		},

		close: {
			height: '100%',
			padding: size.s_10,
			justifyContent: 'center',
			alignItems: 'center'
		}
	});
