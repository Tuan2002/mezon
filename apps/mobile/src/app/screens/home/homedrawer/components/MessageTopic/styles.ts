import { Attributes, Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';
export const style = (colors: Attributes) =>
	StyleSheet.create({
		fakeBox: {
			height: size.s_30,
			width: size.s_30,
			justifyContent: 'center',
			alignItems: 'center',
			borderRadius: size.s_10
		},
		dateMessageBox: {
			fontSize: size.small,
			color: Colors.gray72
		},
		repliesText: {
			fontSize: size.s_14,
			color: colors.textLink
		}
	});
