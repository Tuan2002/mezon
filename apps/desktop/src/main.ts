import { BrowserWindow, app, dialog, ipcMain, screen, shell } from 'electron';
import log from 'electron-log/main';
import { autoUpdater } from 'electron-updater';
import fs from 'fs';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import App from './app/app';
import {
	CLOSE_APP,
	DOWNLOAD_FILE,
	DOWN_LOAD_IMAGE,
	IMAGE_WINDOW_TITLE_BAR_ACTION,
	MAXIMIZE_WINDOW,
	MINIMIZE_WINDOW,
	NAVIGATE_TO_URL,
	OPEN_NEW_WINDOW,
	SENDER_ID,
	TITLE_BAR_ACTION,
	UNMAXIMIZE_WINDOW
} from './app/events/constants';
import ElectronEvents from './app/events/electron.events';
import SquirrelEvents from './app/events/squirrel.events';
import { forceQuit } from './app/utils';
import { environment } from './environments/environment';
export type ImageWindowProps = {
	attachmentData: ApiMessageAttachment & { create_time?: string };
	messageId: string;
	mode: ChannelStreamMode;
	attachmentUrl: string;
	currentClanId: string;
	currentChannelId: string;
	currentDmId: string;
	checkListAttachment: boolean;
};

export default class Main {
	static initialize() {
		if (SquirrelEvents.handleEvents()) {
			// squirrel event handled (except first run event) and app will exit in 1000ms, so don't do anything else
			app.quit();
		}
	}

	static bootstrapApp() {
		log.initialize();
		App.main(app, BrowserWindow);
	}

	static bootstrapAppEvents() {
		ElectronEvents.bootstrapElectronEvents();

		// initialize auto updater service
		if (!App.isDevelopmentMode()) {
			// UpdateEvents.initAutoUpdateService();
		}
	}
}

ipcMain.handle(DOWNLOAD_FILE, async (event, { url, defaultFileName }) => {
	let fileExtension = defaultFileName.split('.').pop().toLowerCase();
	if (!fileExtension || !/^[a-z0-9]+$/.test(fileExtension)) {
		const match = url.match(/\.(\w+)(\?.*)?$/);
		fileExtension = match ? match[1].toLowerCase() : '';
	}

	const fileFilter = fileExtension
		? [{ name: `${fileExtension.toUpperCase()} Files`, extensions: [fileExtension] }]
		: [{ name: 'All Files', extensions: ['*'] }];

	const { filePath, canceled } = await dialog.showSaveDialog({
		title: 'Save File',
		defaultPath: defaultFileName,
		buttonLabel: 'Save',
		filters: fileFilter
	});

	if (canceled || !filePath) {
		return null;
	}

	try {
		const response = await fetch(url);
		const buffer = await response.arrayBuffer();
		fs.writeFileSync(filePath, Buffer.from(buffer));

		shell.showItemInFolder(filePath);
		return filePath;
	} catch (error) {
		console.error('Error downloading file:', error);
		throw new Error('Failed to download file');
	}
});

ipcMain.handle(SENDER_ID, () => {
	return environment.senderId;
});

ipcMain.on(NAVIGATE_TO_URL, async (event, path, isSubPath) => {
	if (App.mainWindow) {
		App.mainWindow.webContents.send('navigate-to-path', path);

		if (!App.mainWindow.isVisible()) {
			App.mainWindow.show();
		}
		App.mainWindow.focus();
	}
});

const handleWindowAction = (window: BrowserWindow, action: string) => {
	if (!window || window.isDestroyed()) {
		return;
	}

	switch (action) {
		case MINIMIZE_WINDOW:
			window.minimize();
			break;
		case UNMAXIMIZE_WINDOW:
		case MAXIMIZE_WINDOW:
			if (process.platform === 'darwin') {
				const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
				const windowBounds = window.getBounds();
				const isMaximized = windowBounds.width >= display.workArea.width && windowBounds.height >= display.workArea.height;
				if (isMaximized) {
					const newWidth = Math.floor(display.workArea.width * 0.8);
					const newHeight = Math.floor(display.workArea.height * 0.8);
					const x = Math.floor((display.workArea.width - newWidth) / 2);
					const y = Math.floor((display.workArea.height - newHeight) / 2);
					window.setBounds(
						{
							x,
							y,
							width: newWidth,
							height: newHeight
						},
						false
					);
				} else {
					window.setBounds(
						{
							x: display.workArea.x,
							y: display.workArea.y,
							width: display.workArea.width,
							height: display.workArea.height
						},
						false
					);
				}
			} else {
				if (window.isMaximized()) {
					window.restore();
				} else {
					window.maximize();
				}
			}
			break;
		case CLOSE_APP:
			autoUpdater.checkForUpdates().then((data) => {
				if (!data?.updateInfo) {
					window.close();
				} else {
					forceQuit.enable();
					return autoUpdater.quitAndInstall();
				}
			});
			break;
	}
};

ipcMain.handle(OPEN_NEW_WINDOW, (event, props: any, options?: Electron.BrowserWindowConstructorOptions, params?: Record<string, string>) => {
	const newWindow = App.openImageWindow(props, options, params);

	// Remove the existing listener if it exists
	ipcMain.removeAllListeners(IMAGE_WINDOW_TITLE_BAR_ACTION);

	ipcMain.on(IMAGE_WINDOW_TITLE_BAR_ACTION, (event, action, data) => {
		handleWindowAction(newWindow, action);
	});
});

ipcMain.on(TITLE_BAR_ACTION, (event, action, data) => {
	handleWindowAction(App.mainWindow, action);
});

ipcMain.handle(DOWN_LOAD_IMAGE, (event, action, data) => {
	const win = BrowserWindow.getFocusedWindow();
	const fileURL = action?.payload?.fileURL;
	if (fileURL) {
		win.webContents.downloadURL(fileURL);
	}
});

// handle setup events as quickly as possible
Main.initialize();

// bootstrap app
Main.bootstrapApp();
Main.bootstrapAppEvents();
