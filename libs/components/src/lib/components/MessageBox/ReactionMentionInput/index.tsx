import {
	useChannelMembers,
	useChannels,
	useChatMessages,
	useClans,
	useClickUpToEdit,
	useGifsStickersEmoji,
	useMenu,
	useReference,
	useThreads,
} from '@mezon/core';
import { ChannelsEntity, channelUsersActions, referencesActions, selectCurrentChannel, threadsActions, useAppDispatch } from '@mezon/store';
import {
	ChannelMembersEntity,
	ILineMention,
	IMessageSendPayload,
	KEY_KEYBOARD,
	MentionDataProps,
	SubPanelName,
	ThreadValue,
	UserMentionsOpt,
	UsersClanEntity,
	focusToElement,
	regexToDetectGifLink,
	threadError,
	uniqueUsers,
} from '@mezon/utils';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { KeyboardEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Mention, MentionsInput, OnChangeHandlerFunc } from 'react-mentions';
import { useSelector } from 'react-redux';
import { ThreadNameTextField } from '../../../components';
import PrivateThread from '../../ChannelTopbar/TopBarComponents/Threads/CreateThread/PrivateThread';
import { useMessageLine } from '../../MessageWithUser/useMessageLine';
import mentionsInputStyle from './RmentionInputStyle';
import mentionStyle from './RmentionStyle';
import SuggestItem from './SuggestItem';

type Emoji = {
	emoji: string;
	name: string;
	shortname: string;
};

type ChannelsMentionProps = {
	id: string;
	display: string;
	subText: string;
};

type EmojiData = {
	id: string;
	emoji: string;
	display: string;
};

export type MentionReactInputProps = {
	onSend: (
		content: IMessageSendPayload,
		mentions?: Array<ApiMessageMention>,
		attachments?: Array<ApiMessageAttachment>,
		references?: Array<ApiMessageRef>,
		value?: ThreadValue,
	) => void;
	onTyping?: () => void;
	onCreateThread?: (key: string) => void;
	listMentions?: MentionDataProps[] | undefined;
	isThread?: boolean;
	handlePaste?: any;
	currentChannelId?: string;
};

const neverMatchingRegex = /($a)/;

function MentionReactInput(props: MentionReactInputProps): ReactElement {
	const { listChannels } = useChannels();
	const [valueTextInput, setValueTextInput] = useState('');
	const dispatch = useAppDispatch();
	const { referenceMessage, dataReferences, setReferenceMessage, setDataReferences } = useReference();
	const [mentionData, setMentionData] = useState<ApiMessageMention[]>([]);
	const { attachmentDataRef, setAttachmentData } = useReference();
	const [content, setContent] = useState('');
	const [nameThread, setNameThread] = useState('');
	const { currentThread, messageThreadError, isPrivate } = useThreads();
	const currentChannel = useSelector(selectCurrentChannel);
	const { mentions } = useMessageLine(content);
	const { usersClan } = useClans();
	const { rawMembers } = useChannelMembers({ channelId: currentChannel?.channel_id as string });
	const [emojis, setEmojis] = useState<Emoji[]>([]);
	const { lastMessageByUserId } = useChatMessages({ channelId: currentChannel?.channel_id as string });

	useEffect(() => {
		fetch(
			'https://gist.githubusercontent.com/oliveratgithub/0bf11a9aff0d6da7b46f1490f86a71eb/raw/d8e4b78cfe66862cf3809443c1dba017f37b61db/emojis.json',
		)
			.then((response) => response.json())
			.then((jsonData) => {
				setEmojis(jsonData.emojis);
			});
	}, []);

	const queryEmojis = (query: string, callback: (data: EmojiData[]) => void) => {
		if (query.length === 0) return;
		const matches = emojis
			.filter((emoji) => emoji.shortname.indexOf(query.toLowerCase()) > -1)
			.slice(0, 20)
			.map((emojiDisplay) => ({ id: emojiDisplay?.emoji, emoji: emojiDisplay?.emoji, display: emojiDisplay?.shortname }));
		callback(matches);
	};

	useEffect(() => {
		if (referenceMessage && referenceMessage.attachments) {
			dispatch(
				referencesActions.setDataReferences([
					{
						message_id: '',
						message_ref_id: referenceMessage.id,
						ref_type: 0,
						message_sender_id: referenceMessage.sender_id,
						content: JSON.stringify(referenceMessage.content),
						has_attachment: referenceMessage.attachments?.length > 0 ? true : false,
					},
				]),
			);
		}
	}, [referenceMessage]);

	const onKeyDown = async (event: KeyboardEvent<HTMLTextAreaElement> | KeyboardEvent<HTMLInputElement>): Promise<void> => {
		const { keyCode, shiftKey } = event;

		switch (keyCode) {
			case KEY_KEYBOARD.ENTER: {
				if (shiftKey) {
					return;
				} else {
					event.preventDefault();
					handleSend();
					return;
				}
			}
			default: {
				return;
			}
		}
	};

	const handleSend = useCallback(() => {
		if (!valueTextInput.trim() && attachmentDataRef.length === 0 && mentionData.length === 0) {
			if (!nameThread.trim() && props.isThread && !currentThread) {
				dispatch(threadsActions.setMessageThreadError(threadError.message));
				dispatch(threadsActions.setNameThreadError(threadError.name));
				return;
			}
			if (props.isThread && !currentThread) {
				dispatch(threadsActions.setMessageThreadError(threadError.message));
			}
			return;
		}

		if (!nameThread.trim() && props.isThread && !currentThread) {
			dispatch(threadsActions.setNameThreadError(threadError.name));
			return;
		}

		if (referenceMessage !== null && dataReferences.length > 0 && openReplyMessageState) {
			props.onSend({ t: content }, mentionData, attachmentDataRef, dataReferences, { nameThread, isPrivate });
			addMemberToChannel(currentChannel, mentions, usersClan, rawMembers);
			setValueTextInput('');
			setAttachmentData([]);
			setReferenceMessage(null);
			setDataReferences([]);
			setNameThread('');
			setContent('');
			dispatch(threadsActions.setIsPrivate(0));
			setReferenceMessage(null);
			dispatch(referencesActions.setOpenReplyMessageState(false));
		} else {
			props.onSend({ t: content }, mentionData, attachmentDataRef, undefined, { nameThread, isPrivate });
			addMemberToChannel(currentChannel, mentions, usersClan, rawMembers);
			setValueTextInput('');
			setAttachmentData([]);
			setNameThread('');
			setContent('');
			dispatch(threadsActions.setIsPrivate(0));
			setReferenceMessage(null);
			dispatch(referencesActions.setOpenReplyMessageState(false));
		}
	}, [
		valueTextInput,
		attachmentDataRef,
		mentionData,
		nameThread,
		currentChannel,
		currentThread,
		mentions,
		isPrivate,
		content,
		referenceMessage,
		dataReferences,
	]);

	const addMemberToChannel = async (
		currentChannel: ChannelsEntity | null,
		mentions: ILineMention[],
		userClans: UsersClanEntity[],
		members: ChannelMembersEntity[],
	) => {
		const userIds = uniqueUsers(mentions, userClans, members);
		const body = {
			channelId: currentChannel?.channel_id as string,
			channelType: currentChannel?.type,
			userIds: userIds as string[],
		};
		if (userIds.length > 0) {
			await dispatch(channelUsersActions.addChannelUsers(body));
		}
	};

	const mentionedUsers: UserMentionsOpt[] = [];

	const listChannelsMention = listChannels.map((item) => {
		return {
			id: item?.channel_id ?? '',
			display: item?.channel_label ?? '',
			subText: item?.category_name ?? '',
		};
	}) as ChannelsMentionProps[];

	const onChangeMentionInput: OnChangeHandlerFunc = (event, newValue, newPlainTextValue, mentions) => {
		const linkGifDirect = newValue?.match(regexToDetectGifLink);
		if (linkGifDirect && linkGifDirect?.length > 0) {
			const newAttachmentDataRef = linkGifDirect
				.filter((item) => item !== null)
				.map((item: string) => ({
					filetype: 'image/gif',
					url: item,
				}));

			setAttachmentData(newAttachmentDataRef);
		}

		dispatch(threadsActions.setMessageThreadError(''));
		setValueTextInput(newValue);
		if (typeof props.onTyping === 'function') {
			props.onTyping();
		}

		const convertedHashtag = convertToPlainTextHashtag(newValue);
		setContent(convertedHashtag);

		if (mentions.length > 0) {
			for (const mention of mentions) {
				if (mention.display.startsWith('@')) {
					mentionedUsers.push({
						user_id: mention.id.toString() ?? '',
						username: mention.display ?? '',
					});
				}
			}
			setMentionData(mentionedUsers);
		}
	};
	const editorRef = useRef<HTMLInputElement | null>(null);
	const { subPanelActive } = useGifsStickersEmoji();
	const { openReplyMessageState, openEditMessageState } = useReference();
	const { closeMenu, statusMenu } = useMenu();
	useEffect(() => {
		if (closeMenu && statusMenu) {
			return;
		}
		if (subPanelActive !== SubPanelName.NONE || (referenceMessage !== null && openReplyMessageState) || !openEditMessageState) {
			return focusToElement(editorRef);
		}
	}, [subPanelActive, referenceMessage, openReplyMessageState, openEditMessageState]);

	const handleChangeNameThread = (nameThread: string) => {
		setNameThread(nameThread);
	};

	const convertToPlainTextHashtag = (text: string) => {
		const regex = /(@|\#)\[(.*?)\]\((.*?)\)/g;
		const result = text.replace(regex, (match, symbol, p1, p2) => {
			return symbol === '#' ? `#${p2}` : `@${p1}`;
		});
		return result;
	};

	const clickUpToEditMessage = () => {
		const idRefMessage = lastMessageByUserId?.id;
		if (idRefMessage) {
			dispatch(referencesActions.setIdMessageToJump(idRefMessage));
			dispatch(referencesActions.setOpenEditMessageState(true));
			dispatch(referencesActions.setOpenReplyMessageState(false));
			dispatch(referencesActions.setReferenceMessage(lastMessageByUserId));
		}
	};

	useClickUpToEdit(editorRef, clickUpToEditMessage);

	return (
		<div className="relative">
			{props.isThread && !currentThread && (
				<div>
					<ThreadNameTextField
						onChange={handleChangeNameThread}
						onKeyDown={onKeyDown}
						value={nameThread}
						label="Thread Name"
						placeholder="Enter Thread Name"
						className="h-10 p-[10px] bg-black text-base outline-none rounded-md placeholder:text-sm"
					/>
					<PrivateThread title="Private Thread" label="Only people you invite and moderators can see" />
				</div>
			)}
			{props.isThread && messageThreadError && !currentThread && <span className="text-xs text-[#B91C1C] mt-1 ml-1">{messageThreadError}</span>}
			<MentionsInput
				onPaste={props.handlePaste}
				id="editorReactMention"
				inputRef={editorRef}
				placeholder="Write your thoughs here..."
				value={valueTextInput}
				onChange={onChangeMentionInput}
				style={mentionsInputStyle}
				allowSpaceInQuery={true}
				onKeyDown={onKeyDown}
				forceSuggestionsAboveCursor={true}
			>
				<Mention
					appendSpaceOnAdd={true}
					data={props.listMentions ?? []}
					trigger="@"
					displayTransform={(id: any, display: any) => {
						return `@${display}`;
					}}
					renderSuggestion={(suggestion) => (
						<SuggestItem name={suggestion.display ?? ''} avatarUrl={(suggestion as any).avatarUrl} subText="" />
					)}
					style={mentionStyle}
				/>
				<Mention
					markup="#[__display__](__id__)"
					appendSpaceOnAdd={true}
					data={listChannelsMention ?? []}
					trigger="#"
					displayTransform={(id: any, display: any) => {
						return `#${display}`;
					}}
					style={mentionStyle}
					renderSuggestion={(suggestion) => (
						<SuggestItem name={suggestion.display ?? ''} symbol="#" subText={(suggestion as ChannelsMentionProps).subText} />
					)}
				/>
				<Mention
					trigger=":"
					markup="__id__"
					regex={neverMatchingRegex}
					data={queryEmojis}
					renderSuggestion={(suggestion) => <SuggestItem name={suggestion.display ?? ''} symbol={(suggestion as EmojiData).emoji} />}
				/>
			</MentionsInput>
		</div>
	);
}

export default MentionReactInput;
