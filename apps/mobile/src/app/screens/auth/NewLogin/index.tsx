import { useAuth } from '@mezon/core';
import { useTheme } from '@mezon/mobile-ui';
import { appActions, useAppDispatch } from '@mezon/store-mobile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { Platform, View } from 'react-native';
import Toast from 'react-native-toast-message';
import WebView from 'react-native-webview';
import StatusBarHeight from '../../../components/StatusBarHeight/StatusBarHeight';
import useTabletLandscape from '../../../hooks/useTabletLandscape';
import { generateCodeChallenge, generateCodeVerifier } from '../../../utils/helpers';
import { style } from './styles';

const NewLoginScreen = () => {
	const { themeValue } = useTheme();
	const isTabletLandscape = useTabletLandscape();
	const styles = style(themeValue, isTabletLandscape);
	const OAUTH2_AUTHORIZE_URL = process.env.NX_CHAT_APP_OAUTH2_AUTHORIZE_URL;
	const CLIENT_ID = process.env.NX_CHAT_APP_OAUTH2_CLIENT_ID;
	const REDIRECT_URI = encodeURIComponent(process.env.NX_CHAT_APP_OAUTH2_REDIRECT_URI as string);
	const RESPONSE_TYPE = process.env.NX_CHAT_APP_OAUTH2_RESPONSE_TYPE;
	const SCOPE = process.env.NX_CHAT_APP_OAUTH2_SCOPE;
	const CODE_CHALLENGE_METHOD = process.env.NX_CHAT_APP_OAUTH2_CODE_CHALLENGE_METHOD;
	const STATE = useMemo(() => {
		const randomState = Math.random().toString(36).substring(2, 15);
		AsyncStorage.setItem('oauth_state', randomState);
		return randomState;
	}, []);
	const [authUri, setAuthUri] = useState(null);
	const { loginByEmail } = useAuth();
	const dispatch = useAppDispatch();

	useEffect(() => {
		const codeVerifier = generateCodeVerifier();
		const codeChallenge = generateCodeChallenge(codeVerifier);
		AsyncStorage.setItem('code_verifier', codeVerifier);

		const authUrl = `${OAUTH2_AUTHORIZE_URL}?client_id=${CLIENT_ID}&prompt=consent&response_type=${RESPONSE_TYPE}&scope=${SCOPE}&redirect_uri=${REDIRECT_URI}&code_challenge=${codeChallenge}&code_challenge_method=${CODE_CHALLENGE_METHOD}&state=${STATE}`;
		setAuthUri(authUrl);
	}, []);

	const handleShouldNavigationStateChange = (newNavState) => {
		if (newNavState?.url?.includes('code') && newNavState?.url?.includes('state')) {
			const code = new URLSearchParams(newNavState?.url?.split('?')[1]).get('code');
			const state = new URLSearchParams(newNavState?.url?.split('?')[1]).get('state');
			if (code) {
				AsyncStorage.getItem('oauth_state').then(async (storedState) => {
					if (state === storedState) {
						dispatch(appActions.setLoadingMainMobile(true));
						try {
							const res = await loginByEmail(code);
							if (res === 'Invalid session') {
								if (Platform.OS === 'android') {
									Toast.show({
										type: 'error',
										text1: 'Login Failed',
										text2: 'Invalid email or password'
									});
								}
							}
						} catch (error) {
							dispatch(appActions.setLoadingMainMobile(false));
						}
					} else {
						// todo: handle error or ignore
					}
				});
				return false;
			}
		}
		return true;
	};

	return (
		<View style={styles.supperContainer}>
			<StatusBarHeight />
			{authUri && (
				<View style={styles.webView}>
					<WebView source={{ uri: authUri }} onShouldStartLoadWithRequest={handleShouldNavigationStateChange} startInLoadingState={true} />
				</View>
			)}
		</View>
	);
};

export default NewLoginScreen;
