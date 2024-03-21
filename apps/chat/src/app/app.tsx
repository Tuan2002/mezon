import { MezonStoreProvider, initStore } from '@mezon/store';
import { CreateMezonClientOptions, CreateVoiceClientOptions, MezonContextProvider, useMezon } from '@mezon/transport';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { RouterProvider } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { StrictMode, useEffect, useMemo } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WebFont from 'webfontloader';
import './app.module.scss';
import { preloadedState } from './mock/state';
import { routes } from './routes/index';
import React from 'react';

const GOOGLE_CLIENT_ID = '1089303247801-qp0lhju8efratqkuk2murphealgdcseu.apps.googleusercontent.com';

const mezon: CreateMezonClientOptions = {
	host: process.env.NX_CHAT_APP_API_HOST as string,
	port: process.env.NX_CHAT_APP_API_PORT as string,
	key: process.env.NX_CHAT_APP_API_KEY as string,
	ssl: process.env.NX_CHAT_APP_API_SECURE === 'true',
};

export function App() {
	const mezon = useMezon();
	const { store, persistor } = useMemo(() => {
		return initStore(mezon, preloadedState);
	}, [mezon]);
	if (!store) {
		return <>loading...</>;
	}
	return (
		<MezonStoreProvider store={store} loading={null} persistor={persistor}>
			<RouterProvider router={routes} />
		</MezonStoreProvider>
	);
}

function AppWrapper() {
	useEffect(() => {
		WebFont.load({
			google: {
				families: ['Manrope'],
			},
		});
	}, []);

	return (
		<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
			<MezonContextProvider mezon={mezon} connect={true}>
					<StrictMode><App /></StrictMode>
					<ToastContainer
						position="top-right"
						autoClose={2200}
						hideProgressBar={false}
						newestOnTop={false}
						closeOnClick
						rtl={false}
						pauseOnFocusLoss
						draggable
						pauseOnHover
						theme="light"
					/>
			</MezonContextProvider>
		</GoogleOAuthProvider>
	);
}

export default AppWrapper;
