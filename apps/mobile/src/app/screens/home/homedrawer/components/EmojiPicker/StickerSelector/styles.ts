import { Colors, Metrics, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
	content: {
		height: (Metrics.screenWidth - size.s_6 * size.s_10) / 5,
		width: (Metrics.screenWidth - size.s_6 * size.s_10) / 5,
		borderRadius: 10,
		overflow: 'hidden',
		backgroundColor: Colors.black,
	},

	btnEmo: {
		width: 30,
		height: 30,
		borderRadius: 50,
		overflow: 'hidden',
		backgroundColor: Colors.black,
	},

	btnWrap: {
		display: 'flex',
		flexDirection: 'row',
		gap: size.s_10,
		marginTop: size.s_10,
	},

	session: {},

	sessionTitle: {
		fontSize: size.medium,
		color: Colors.tertiary,
		fontWeight: '600',
		textTransform: 'capitalize',
		marginTop: size.s_20,
		marginBottom: size.s_10,
	},

	sessionContent: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: size.s_10,
		justifyContent: 'space-between',
		alignItems: 'center',
	},
});

export default styles;
