import { IMessageSendPayload } from '.';

export interface IStartEndIndex {
	s?: number | undefined;
	e?: number | undefined;
}

export enum EBacktickType {
	TRIPLE = 't',
	SINGLE = 's',
	PRE = 'pre',
	CODE = 'c',
	BOLD = 'b',
	LINK = 'lk',
	VOICE_LINK = 'vk'
}

export interface IMention {
	user_id?: string | undefined;
	role_id?: string | undefined;
	username?: string | undefined;
}

export interface IHashtag {
	channelid: string | undefined;
}
export interface IEmoji {
	emojiid: string | undefined;
}

export interface IMarkdown {
	type?: EBacktickType;
}

export interface IPre {
	l?: string; // language
}

export interface IBold {
	l?: string; // language
}

export interface IMentionOnMessage extends IMention, IStartEndIndex {}
export interface IExtendedMessage extends IMessageSendPayload {
	mentions?: IMentionOnMessage[];
}
export interface IHashtagOnMessage extends IHashtag, IStartEndIndex {}
export interface IEmojiOnMessage extends IEmoji, IStartEndIndex {}
export type ILinkOnMessage = IStartEndIndex;
export interface IMarkdownOnMessage extends IMarkdown, IStartEndIndex {}
export type ILinkVoiceRoomOnMessage = IStartEndIndex;

export interface IPreMessage extends IPre, IStartEndIndex {}

export interface IBoldMessage extends IBold, IStartEndIndex {}
