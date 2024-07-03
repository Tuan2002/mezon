import { Colors, size, verticalScale } from '@mezon/mobile-ui';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';

const SplashScreen = () => {
	return (
		<View style={styles.centeredView}>
			<Flow size={size.s_34 * 2} color={Colors.bgViolet} />
		</View>
	);
};

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.7)',
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
	},
	modalView: {
		backgroundColor: Colors.black,
		borderRadius: verticalScale(20),
		padding: verticalScale(20),
		alignItems: 'center',
		elevation: 5,
	},
});

export default SplashScreen;
