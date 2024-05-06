import { RootState } from '@mezon/store-mobile';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import Button from '../../components/Auth/Button';
import FooterAuth from '../../components/Auth/FooterAuth';
import GoogleLogin from '../../components/Auth/GoogleLogin';
import TextInputUser from '../../components/Auth/TextInput';
import LoadingModal from '../../components/LoadingModal';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import { size } from '../../themes/Fonts';
const LoginSchema = Yup.object().shape({
	email: Yup.string().email('Invalid email').required('Please enter your email'),
	password: Yup.string()
		.min(8, 'Confiem password musr be 8 characters long.')
		.required('Please enter your password')
		.matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$%^&*-]).{8,}$/, 'Must contain minimum 8 characters, at least one uppercase letter'),
});
const LoginScreen = () => {
	const navigation = useNavigation();
	const isLoading = useSelector((state: RootState) => state.auth.loadingStatus);

	return (
		<View style={styles.container}>
			{/* header */}
			<View style={styles.headerContainer}>
				<Text style={styles.headerTitle}>WELCOME BACK</Text>
				<Text style={styles.headerContent}>So glad to meet you again!</Text>
			</View>
			<GoogleLogin />
			<Text style={styles.orText}>Or</Text>
			{/* body */}
			<Formik
				initialValues={{
					email: '',
					password: '',
				}}
				validationSchema={LoginSchema}
				onSubmit={() => Alert.alert('Email or password not correct')}
			>
				{({ errors, touched, values, handleSubmit, handleChange, setFieldTouched, isValid }) => (
					<>
						{/* email */}
						<TextInputUser
							label="Email or phone"
							value={values.email}
							onChangeText={handleChange('email')}
							placeholder="Email or phone"
							onBlur={() => setFieldTouched('email')}
							touched={touched.email}
							error={errors.email}
							isPass={false}
						/>

						{/* password */}
						<TextInputUser
							label="Password"
							value={values.password}
							onChangeText={handleChange('password')}
							placeholder="Password"
							onBlur={() => setFieldTouched('password')}
							touched={touched.password}
							error={errors.password}
							isPass={true}
						/>
						{/* button  */}
						<Button disabled={!isValid} onPress={handleSubmit} isValid={isValid} title={'Sign in'} />
					</>
				)}
			</Formik>
			<FooterAuth content={'Need an account?'} onPress={() => navigation.navigate(APP_SCREEN.REGISTER as never)} title={'Register'} />
			<LoadingModal isVisible={isLoading === 'loading'} />
		</View>
	);
};

export default LoginScreen;

const styles = StyleSheet.create({
	InputText: {
		fontSize: 18,
		textAlignVertical: 'center',
		padding: 0,
		color: '#FFFFFF',
		flex: 1,
	},
	container: {
		flex: 1,
		backgroundColor: '#151515',
		justifyContent: 'center',
	},
	headerContainer: {
		alignItems: 'center',
		paddingVertical: 10,
		paddingHorizontal: 20,
	},
	headerTitle: {
		fontSize: size.s_34,
		textAlign: 'center',
		fontWeight: 'bold',
		color: '#FFFFFF',
	},
	headerContent: {
		fontSize: size.s_14,
		lineHeight: 20 * 1.4,
		textAlign: 'center',
		color: '#CCCCCC',
	},
	orText: {
		fontSize: size.s_12,
		lineHeight: 15 * 1.4,
		color: '#AEAEAE',
		marginLeft: 5,
		alignSelf: 'center',
		paddingTop: 10,
	},
});
