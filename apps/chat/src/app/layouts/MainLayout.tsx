import { ChatContext, ChatContextProvider, useGifsStickersEmoji } from '@mezon/core';
import { reactionActions } from '@mezon/store';
import { MezonSuspense, SocketStatus, useMezon } from '@mezon/transport';
import { SubPanelName } from '@mezon/utils';
import { useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';

const GlobalEventListener = () => {
	const { socketStatus } = useMezon();
	const { handleReconnect } = useContext(ChatContext);
	const navigate = useNavigate();

	useEffect(() => {
		const handleNavigateToPath = (_: unknown, path: string) => {
			navigate(path);
		};

		window.electron?.on('navigate-to-path', handleNavigateToPath);

		return () => {
			window.electron?.removeListener('navigate-to-path', handleNavigateToPath);
		};
	}, [navigate]);

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				if (socketStatus.current === SocketStatus.CONNECT_FAILURE) {
					handleReconnect('Socket disconnected, attempting to reconnect...');
				}
			}
		};
		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [handleReconnect, socketStatus]);

	return null;
};

const MainLayout = () => {
	const dispatch = useDispatch();
	const { setSubPanelActive } = useGifsStickersEmoji();
	const handleClickingOutside = () => {
		setSubPanelActive(SubPanelName.NONE);
		dispatch(reactionActions.setUserReactionPanelState(false));
	};
	return (
		<div
			id="main-layout"
			onClick={handleClickingOutside}
			onContextMenu={(event: React.MouseEvent) => {
				event.preventDefault();
			}}
		>
			<Outlet />
			<GlobalEventListener />
		</div>
	);
};

const MainLayoutWrapper = () => {
	return (
		<MezonSuspense>
			<ChatContextProvider>
				<MainLayout />
			</ChatContextProvider>
		</MezonSuspense>
	);
};

export default MainLayoutWrapper;
