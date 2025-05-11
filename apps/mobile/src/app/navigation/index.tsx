import i18n from '@mezon/translations';
import { CreateMezonClientOptions, MezonContextProvider } from '@mezon/transport';
import * as Sentry from '@sentry/react-native';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
// import codePush from 'react-native-code-push';
import 'react-native-svg';
import RootNavigation from './RootNavigator';

const reactNavigationIntegration = Sentry.reactNavigationIntegration();

Sentry.init({
	dsn: process.env.NX_MOBILE_SENTRY_DSN,
	tracesSampleRate: 1.0,
	enabled: !__DEV__,
	integrations: [reactNavigationIntegration]
});

// const codePushOptions = {
// 	checkFrequency: codePush.CheckFrequency.MANUAL,
// 	installMode: codePush.InstallMode.IMMEDIATE,
// 	mandatoryInstallMode: codePush.InstallMode.IMMEDIATE
// };

const mezon: CreateMezonClientOptions = {
	host: process.env.NX_CHAT_APP_API_HOST as string,
	key: process.env.NX_CHAT_APP_API_KEY as string,
	port: process.env.NX_CHAT_APP_API_PORT as string,
	ssl: process.env.NX_CHAT_APP_API_SECURE === 'true'
};

const App = (props) => {
	return (
		<I18nextProvider i18n={i18n}>
			<MezonContextProvider mezon={mezon} connect={true} isFromMobile={true}>
				<RootNavigation {...props} />
			</MezonContextProvider>
		</I18nextProvider>
	);
};

export default App;
