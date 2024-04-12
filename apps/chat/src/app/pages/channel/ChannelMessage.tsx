import { ChannelMessageOpt, EmojiPickerComp, MessageWithUser, UnreadMessageBreak } from '@mezon/components';
import { useChatMessage, useChatReaction, useChatSending, useDeleteMessage, useReference } from '@mezon/core';
import { referencesActions, selectMemberByUserId, useAppDispatch } from '@mezon/store';
import { EmojiPlaces, IMessageWithUser } from '@mezon/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSelector } from 'react-redux';

type MessageProps = {
	message: IMessageWithUser;
	preMessage?: IMessageWithUser;
	lastSeen?: boolean;
	mode: number;
	channelId: string;
	channelLabel: string;
};

export function ChannelMessage(props: MessageProps) {
	const { message, lastSeen, preMessage, mode, channelId, channelLabel } = props;
	const { markMessageAsSeen } = useChatMessage(message.id);
	const user = useSelector(selectMemberByUserId(message.sender_id));
	const { EditSendMessage } = useChatSending({ channelId: channelId || '', channelLabel: channelLabel || '', mode });
	const { DeleteSendMessage } = useDeleteMessage({ channelId: channelId || '', channelLabel: channelLabel || '', mode });
	const dispatch = useAppDispatch();
	const { reactionRightState, reactionBottomState } = useChatReaction();
	const { referenceMessage, openEditMessageState, openOptionMessageState } = useReference();

	useEffect(() => {
		markMessageAsSeen(message);
	}, [markMessageAsSeen, message]);

	const mess = useMemo(() => {
		if (typeof message.content === 'object' && typeof (message.content as any).id === 'string') {
			return message.content;
		}
		return message;
	}, [message]);

	const [editMessage, setEditMessage] = useState(mess.content.t);
	const [newMessage, setNewMessage] = useState('');

	const messPre = useMemo(() => {
		if (preMessage && typeof preMessage.content === 'object' && typeof (preMessage.content as any).id === 'string') {
			return preMessage.content;
		}
		return preMessage;
	}, [preMessage]);

	const handleCancelEdit = () => {
		dispatch(referencesActions.setOpenEditMessageState(false));
	};

	const onSend = (e: React.KeyboardEvent<Element>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			if (editMessage) {
				handleSend(editMessage, message.id);
				setNewMessage(editMessage);
				handleCancelEdit();
			}
		}
		if (e.key === 'Escape') {
			handleCancelEdit();
		}
	};
	const handleSend = useCallback(
		(editMessage: string, messageId: string) => {
			EditSendMessage(editMessage, messageId);
		},
		[EditSendMessage],
	);
	const onchange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setEditMessage(e.target.value);
		updateTextareaHeight(e.target);
	};
	const updateTextareaHeight = (textarea: HTMLTextAreaElement) => {
		textarea.style.height = 'auto';
		textarea.style.height = textarea.scrollHeight + 'px';
	};

	return (
		<div className="fullBoxText relative group">
			<MessageWithUser
				message={mess as IMessageWithUser}
				preMessage={messPre as IMessageWithUser}
				user={user}
				mode={mode}
				newMessage={newMessage}
				child={
					<PopupMessage
						reactionRightState={reactionRightState}
						mess={mess as IMessageWithUser}
						referenceMessage={referenceMessage}
						reactionBottomState={reactionBottomState}
						openEditMessageState={openEditMessageState}
						openOptionMessageState={openOptionMessageState}
						mode={mode}
						deleteSendMessage={DeleteSendMessage}
					/>
				}
			/>

			{lastSeen && <UnreadMessageBreak />}

			{openEditMessageState && mess.id === referenceMessage?.id && (
				<div className="inputEdit relative left-[66px] top-[-21px]">
					<textarea
						defaultValue={editMessage}
						className="w-[83%] bg-black rounded p-[10px]"
						onKeyDown={onSend}
						onChange={(e) => {
							onchange(e);
						}}
						rows={editMessage?.split('\n').length}
					></textarea>
					<p className="absolute -bottom-4 text-xs">escape to cancel • enter to save</p>
				</div>
			)}
		</div>
	);
}

ChannelMessage.Skeleton = () => {
	return (
		<div>
			<MessageWithUser.Skeleton />
		</div>
	);
};

function PopupMessage({
	reactionRightState,
	mess,
	referenceMessage,
	reactionBottomState,
	openEditMessageState,
	openOptionMessageState,
	mode,
	isCombine,
	deleteSendMessage,
}: {
	reactionRightState: boolean;
	mess: IMessageWithUser;
	referenceMessage: IMessageWithUser | null;
	reactionBottomState: boolean;
	openEditMessageState: boolean;
	openOptionMessageState: boolean;
	mode: number;
	isCombine?: boolean;
	deleteSendMessage: (messageId: string) => Promise<void>;
}) {
	return (
		<div
			className={`chooseForText z-[1] absolute h-8 p-0.5 rounded right-4 w-24 block bg-bgSecondary ${isCombine ? '-top-7' : '-top-[7px]'}
				${
					(reactionRightState && mess.id === referenceMessage?.id) ||
					(reactionBottomState && mess.id === referenceMessage?.id) ||
					(openEditMessageState && mess.id === referenceMessage?.id) ||
					(openOptionMessageState && mess.id === referenceMessage?.id)
						? ''
						: 'hidden group-hover:block'
				} `}
		>
			<ChannelMessageOpt message={mess} />

			{mess.id === referenceMessage?.id && reactionRightState && (
				<div className="w-fit fixed right-16 bottom-[6rem]">
					<div className="scale-75 transform mb-0 z-10">
						<EmojiPickerComp messageEmoji={referenceMessage} mode={mode} emojiAction={EmojiPlaces.EMOJI_REACTION} />
					</div>
				</div>
			)}
			{openOptionMessageState && mess.id === referenceMessage?.id && <PopupOption message={mess} deleteSendMessage={deleteSendMessage} />}
		</div>
	);
}

function PopupOption({ message, deleteSendMessage }: { message: IMessageWithUser; deleteSendMessage: (messageId: string) => Promise<void> }) {
	const dispatch = useAppDispatch();
	const { userId } = useChatReaction();

	const handleClickEdit = () => {
		dispatch(referencesActions.setOpenReplyMessageState(false));
		dispatch(referencesActions.setOpenEditMessageState(true));
		dispatch(referencesActions.setOpenOptionMessageState(false));
	};

	const handleClickReply = () => {
		dispatch(referencesActions.setOpenReplyMessageState(true));
		dispatch(referencesActions.setOpenEditMessageState(false));
		dispatch(referencesActions.setOpenOptionMessageState(false));
	};

	const handleClickCopy = () => {
		dispatch(referencesActions.setOpenEditMessageState(false));
		dispatch(referencesActions.setOpenOptionMessageState(false));
		dispatch(referencesActions.setReferenceMessage(null));
		dispatch(referencesActions.setDataReferences(null));
	};

	const handleClickDelete = () => {
		deleteSendMessage(message.id);
	};

	const checkUser = userId === message.sender_id;
	return (
		<div className={`bg-[#151515] rounded-[10px] p-2 absolute right-8 w-[180px] z-10 ${checkUser ? '-top-[150px]' : 'top-[-66px]'}`}>
			<ul className="flex flex-col gap-1">
				{checkUser && (
					<li className="p-2 hover:bg-black rounded-lg text-[15px] cursor-pointer" onClick={handleClickEdit}>
						Edit Message
					</li>
				)}
				<li className="p-2 hover:bg-black rounded-lg text-[15px] cursor-pointer" onClick={handleClickReply}>
					Reply
				</li>
				<CopyToClipboard text={message.content.t || ''}>
					<li className="p-2 hover:bg-black rounded-lg text-[15px] cursor-pointer" onClick={handleClickCopy}>
						Copy Text
					</li>
				</CopyToClipboard>

				{checkUser && (
					<li className="p-2 hover:bg-black rounded-lg text-[15px] cursor-pointer text-[#ff0000]" onClick={handleClickDelete}>
						Delete Message
					</li>
				)}
			</ul>
		</div>
	);
}
