import { ApiMessageAttachment } from 'mezon-js/api.gen';

export type ElectronBridgeHandler = (...args: any[]) => void;
export type MezonElectronAPI = {
	invoke?: (channel: string, data?: MezonDownloadFile) => Promise<MezonDownloadFile>;
	platform: NodeJS.Platform;
	getAppVersion: () => Promise<string>;
	on: (eventName: string, callback: ElectronBridgeHandler) => void;
	send: (eventName: string, ...params: any[]) => void;
	removeListener: (channel: string, listener: ElectronBridgeHandler) => void;
	getDeviceId: () => Promise<string>;
	senderId: (senderId: string) => Promise<string>;
	setBadgeCount: (badgeCount: number | null) => void;
	onWindowBlurred: (callback: () => void) => void;
	onWindowFocused: (callback: () => void) => void;
	openImageWindow: (currentImage: ApiMessageAttachment & { create_time?: string; uploaderData: { name: string; avatar: string } }) => Promise<void>;
	dowloadImage: (url: string) => Promise<void>;
};
declare global {
	interface Window {
		electron: MezonElectronAPI;
	}
}

export interface IElectronBridge {
	initListeners: (handlers: Record<string, ElectronBridgeHandler>) => void;
	removeAllListeners: () => void;
	setBadgeCount: (badgeCount: number | null) => void;
}

export interface MezonNotificationOptions extends NotificationOptions {
	data: { link: string };
}

export interface MezonDownloadFile {
	url: string;
	defaultFileName: string;
}
