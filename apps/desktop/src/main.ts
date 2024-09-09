import { BrowserWindow, Notification, app, dialog, ipcMain } from 'electron';
import log from 'electron-log/main';
import { UpdateInfo, autoUpdater } from 'electron-updater';
import { machineId } from 'node-machine-id';
import { join } from 'path';
import { format } from 'url';
import App from './app/app';
import { rendererAppName } from './app/constants';
import { GET_DEVICE_ID, NAVIGATE_TO_URL, SENDER_ID } from './app/events/constants';
import ElectronEvents from './app/events/electron.events';
import SquirrelEvents from './app/events/squirrel.events';
import { environment } from './environments/environment';

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

ipcMain.handle(SENDER_ID, () => {
	return environment.senderId;
});

ipcMain.handle(GET_DEVICE_ID, async () => {
	return await machineId();
});

ipcMain.on(NAVIGATE_TO_URL, async (event, path, isSubPath) => {
	if (App.mainWindow) {
		const baseUrl = join(__dirname, '..', rendererAppName, 'index.html');

		if (path && !isSubPath) {
			App.mainWindow.loadURL(
				format({
					pathname: baseUrl,
					protocol: 'file:',
					slashes: true,
					query: { notificationPath: path }
				})
			);
		}

		if (!App.mainWindow.isVisible()) {
			App.mainWindow.show();
		}
		App.mainWindow.focus();
	}
});

autoUpdater.autoDownload = false;
autoUpdater.logger = log;

autoUpdater.on('checking-for-update', () => {
	// checking for update
});

autoUpdater.on('update-available', (info: UpdateInfo) => {
	const window = App.BrowserWindow.getFocusedWindow();
	dialog
		.showMessageBox(window, {
			type: 'info',
			buttons: ['Download', 'Cancel'],
			title: 'Updates available',
			message: `There is a new update for the app ${info.version}!! Do you want to download??`
		})
		.then((result) => {
			if (result.response === 0) {
				autoUpdater.downloadUpdate();
			}
		});
});

autoUpdater.on('update-not-available', (info: UpdateInfo) => {
	new Notification({
		title: 'No update',
		body: `The current version (${info.version}) is the latest.`
	}).show();
});

autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
	const window = App.BrowserWindow.getFocusedWindow();
	dialog
		.showMessageBox(window, {
			type: 'info',
			buttons: ['Install now', 'Cancel'],
			title: 'Mezon install',
			message: `Install mezon version ${info.version} now.`
		})
		.then((result) => {
			if (result.response === 0) {
				const browserWindows = App.BrowserWindow.getAllWindows();
				browserWindows.forEach(function (browserWindow) {
					// remove close event listeners because it is prevented in system tray feature
					browserWindow.removeAllListeners('close');
					browserWindow.close();
				});
				autoUpdater.quitAndInstall();
			}
		});
});

autoUpdater.on('download-progress', (progressObj) => {
	let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
	log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
	log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
	log.info('downloading...', log_message);
});

autoUpdater.on('error', (error) => {
	dialog.showMessageBox({
		message: `Error: ${error.message} !!`
	});
});

// handle setup events as quickly as possible
Main.initialize();

// bootstrap app
Main.bootstrapApp();
Main.bootstrapAppEvents();
