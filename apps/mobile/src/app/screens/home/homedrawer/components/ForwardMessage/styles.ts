import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	btn: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.bgViolet,
		paddingVertical: 10,
		borderRadius: 50,
		marginHorizontal: size.s_10,
		marginBottom: size.s_18
	},
	btnText: {
		color: Colors.white,
	},
	memberAvatar: {
		height: size.s_34,
		width: size.s_34,
		borderRadius: 50,
    backgroundColor: Colors.bgGrayDark
	},
	groupAvatar: {
		backgroundColor: Colors.orange,
		width: size.s_34,
		height: size.s_34,
		borderRadius: 50,
		justifyContent: 'center',
		alignItems: 'center'
	},
});
