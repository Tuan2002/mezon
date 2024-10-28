import { size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	wrapper: {
		flex: 1
	},
	backHeader: {
		position: 'absolute',
		top: size.s_10,
		width: size.s_50,
		height: size.s_50,
		alignItems: 'center',
		justifyContent: 'center',
		left: size.s_10,
		padding: size.s_10,
		zIndex: 10
	},
	footer: {
		backgroundColor: '#00000090',
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		padding: '10%',
		height: '20%',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center'
	},
	mainOverlay: {
		flex: 1,
		width: '100%',
		height: '100%',
		top: 0,
		left: 0,
		alignSelf: 'center',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.2)'
	},
	overlay: {
		backgroundColor: 'rgba(0,0,0,0.2)',
		width: '100%',
		height: '100%',
		top: 0,
		left: 0,
		alignSelf: 'center',
		justifyContent: 'center',
		alignItems: 'center'
	},
	overlayCenter: {
		width: '100%',
		height: size.s_60 * 4,
		alignSelf: 'center',
		justifyContent: 'center',
		flexDirection: 'row'
	},
	overlayCenterSub: {
		backgroundColor: 'rgba(0,0,0,0.2)',
		width: '100%',
		height: '100%'
	},
	squareMain: {
		width: size.s_60 * 4,
		height: size.s_60 * 4,
		zIndex: 10
	},
	square: {
		width: size.s_60 * 4,
		height: size.s_60 * 4,
		borderWidth: size.s_4,
		borderRadius: size.s_6,
		borderColor: 'white',
		backgroundColor: 'transparent',
		zIndex: 1,
		alignSelf: 'center'
	},
	popupLogin: {
		position: 'absolute',
		flex: 1,
		width: '100%',
		height: '100%',
		top: 0,
		left: 0,
		alignSelf: 'center',
		justifyContent: 'center',
		alignItems: 'center'
	},
	popupLoginSub: {
		backgroundColor: '#1c1d22',
		width: '90%',
		paddingVertical: size.s_50,
		paddingHorizontal: size.s_10,
		borderRadius: size.s_10,
		alignItems: 'center',
		justifyContent: 'center'
	},
	title: {
		color: '#ededed',
		fontSize: size.s_24,
		fontWeight: 'bold',
		paddingBottom: size.s_6,
		marginTop: size.s_30
	},
	subTitle: {
		color: '#ff5757',
		fontSize: size.s_14,
		marginBottom: size.s_30
	},
	button: {
		backgroundColor: '#2c0afa',
		padding: size.s_10,
		borderRadius: size.s_6,
		width: '90%',
		alignItems: 'center',
		justifyContent: 'center',
		marginVertical: size.s_4
	},
	buttonText: {
		color: '#ededed',
		fontSize: size.s_14,
		fontWeight: '600',
		paddingBottom: size.s_6
	},
	iconLogin: {
		width: size.s_50 * 2,
		height: size.s_50 * 2,
	}
});
