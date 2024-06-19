import { useAuth, useClans, useDeleteMessage } from '@mezon/core';
import {
	FileIcon,
	ReplyIcon,
	ReplyMessageDeleted,
	STORAGE_KEY_CLAN_CURRENT_CACHE,
	getUpdateOrAddClanChannelCache,
	save,
} from '@mezon/mobile-components';
import { Colors, Metrics, Text, size, verticalScale } from '@mezon/mobile-ui';
import {
	ChannelsEntity,
	channelsActions,
	getStoreAsync,
	messagesActions,
	selectChannelsEntities,
	selectEmojiImage,
	selectMemberByUserId,
	selectMessageByMessageId,
	useAppDispatch,
} from '@mezon/store-mobile';
import {
	EmojiDataOptionals,
	IChannelMember,
	IMessageWithUser,
	TIME_COMBINE,
	checkSameDay,
	convertTimeString,
	getTimeDifferenceInSeconds,
	notImplementForGifOrStickerSendFromPanel,
} from '@mezon/utils';
import { ApiMessageAttachment, ApiUser } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import { useMessageParser } from '../../../hooks/useMessageParser';
import { channelIdRegex, codeBlockRegex, isImage, isVideo, splitBlockCodeRegex } from '../../../utils/helpers';
import { MessageAction, MessageItemBS } from './components';
import { renderTextContent } from './constants';
import { EMessageBSToShow } from './enums';
import { styles } from './styles';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { setSelectedMessage } from 'libs/store/src/lib/forwardMessage/forwardMessage.slice';
import { ChannelType } from 'mezon-js';
import { useTranslation } from 'react-i18next';
import { openUrl } from 'react-native-markdown-display';
import Toast from 'react-native-toast-message';
import { RenderVideoChat } from './components/RenderVideoChat';

const widthMedia = Metrics.screenWidth - 150;
export type MessageItemProps = {
	message: IMessageWithUser;
	preMessage?: IMessageWithUser;
	user?: IChannelMember | null;
	isMessNotifyMention?: boolean;
	mode: number;
	newMessage?: string;
	child?: JSX.Element;
	isMention?: boolean;
	channelLabel?: string;
	channelId?: string;
	dataReactionCombine?: EmojiDataOptionals[];
	onOpenImage?: (image: ApiMessageAttachment) => void;
	isNumberOfLine?: boolean;
};

const arePropsEqual = (prevProps, nextProps) => {
	return prevProps.message === nextProps.message;
};

const MessageItem = React.memo((props: MessageItemProps) => {
	const { message, mode, dataReactionCombine, preMessage, onOpenImage, isNumberOfLine } = props;
	const userLogin = useAuth();
	const dispatch = useAppDispatch();
	const [foundUser, setFoundUser] = useState<ApiUser | null>(null);
	const { attachments, lines } = useMessageParser(props.message);
	const user = useSelector(selectMemberByUserId(props?.message?.sender_id));
	const [videos, setVideos] = useState<ApiMessageAttachment[]>([]);
	const [images, setImages] = useState<ApiMessageAttachment[]>([]);
	const [documents, setDocuments] = useState<ApiMessageAttachment[]>([]);
	const [calcImgHeight, setCalcImgHeight] = useState<number>(180);
	const [openBottomSheet, setOpenBottomSheet] = useState<EMessageBSToShow | null>(null);
	const [isOnlyEmojiPicker, setIsOnlyEmojiPicker] = useState<boolean>(false);
	const messageRefFetchFromServe = useSelector(selectMessageByMessageId(props.message?.references[0]?.message_ref_id || ''));
	const repliedSender = useSelector(selectMemberByUserId(messageRefFetchFromServe?.user?.id || ''));
	const emojiListPNG = useSelector(selectEmojiImage);
	const channelsEntities = useSelector(selectChannelsEntities);
	const { DeleteSendMessage } = useDeleteMessage({ channelId: props.channelId, channelLabel: props.channelLabel, mode: props.mode });
	const { usersClan } = useClans();
	const { t } = useTranslation('message');
	const hasIncludeMention = useMemo(() => {
		return message.content.t?.includes('@here') || message.content.t?.includes(`@${userLogin.userProfile?.user?.username}`);
	}, [message, userLogin]);
	const isCombine = useMemo(() => {
		const timeDiff = getTimeDifferenceInSeconds(preMessage?.create_time as string, message?.create_time as string);
		return (
			timeDiff < TIME_COMBINE &&
			preMessage?.user?.id === message?.user?.id &&
			checkSameDay(preMessage?.create_time as string, message?.create_time as string)
		);
	}, [message, preMessage]);
	const isShowInfoUser = useMemo(() => !isCombine || (message.references.length && !!user), [isCombine, message.references, user]);
	const videoRef = React.useRef(null);

	const classifyAttachments = (attachments: ApiMessageAttachment[]) => {
		const videos: ApiMessageAttachment[] = [];
		const images: ApiMessageAttachment[] = [];
		const documents: ApiMessageAttachment[] = [];

		attachments.forEach((attachment) => {
			if (attachment.filetype?.indexOf('video/mp4') !== -1 && !attachment.url?.includes('tenor.com')) {
				videos.push(attachment);
			} else if (attachment.filetype?.indexOf('image/png') !== -1 || attachment.filetype?.indexOf('image/jpeg') !== -1) {
				images.push(attachment);
			} else {
				documents.push(attachment);
			}
		});

		return { videos, images, documents };
	};

	useEffect(() => {
		const { videos, images, documents } = classifyAttachments(attachments ?? []);
		setVideos(videos);
		setImages(images);
		setDocuments(documents);
	}, [attachments]);

	const renderVideos = (videoItem?: any) => {
		return (
			<View
				style={{
					height: 170,
					width: widthMedia + size.s_50,
					marginTop: size.s_10,
				}}
			>
				{videoItem ? (
					<RenderVideoChat key={`${videoItem?.url}_${new Date().getTime()}`} videoURI={videoItem?.url} />
				) : (
					videos.map((video, index) => {
						return <RenderVideoChat key={video?.url} videoURI={video?.url} />;
					})
				)}
			</View>
		);
	};

	const imageItem = ({ image, index, checkImage }) => {
		return (
			<TouchableOpacity
				disabled={checkImage}
				activeOpacity={0.8}
				key={index}
				onPress={() => {
					onOpenImage(image);
				}}
			>
				<FastImage
					style={[
						styles.imageMessageRender,
						{
							width: widthMedia,
							height: calcImgHeight,
						},
					]}
					source={{ uri: image?.url }}
					resizeMode="contain"
					onLoad={(evt) => {
						setCalcImgHeight((evt.nativeEvent.height / evt.nativeEvent.width) * widthMedia);
					}}
				/>
			</TouchableOpacity>
		);
	};

	const renderImages = () => {
		return (
			<View>
				{images.map((image, index) => {
					const checkImage = notImplementForGifOrStickerSendFromPanel(image);

					return imageItem({ image, index, checkImage });
				})}
			</View>
		);
	};

	const renderDocuments = () => {
		return documents.map((document, index) => {
			const checkIsImage = isImage(document?.url?.toLowerCase());
			if (checkIsImage) {
				return imageItem({ image: document, index, checkImage: false });
			}
			const checkIsVideo = isVideo(document?.url?.toLowerCase());

			if (checkIsVideo) {
				return renderVideos(document);
			}

			return (
				<TouchableOpacity activeOpacity={0.8} key={index} onPress={() => openUrl(document.url)}>
					<View style={styles.fileViewer}>
						<FileIcon width={verticalScale(30)} height={verticalScale(30)} color={Colors.bgViolet} />
						<View style={{ maxWidth: '75%' }}>
							<Text style={styles.fileName} numberOfLines={2}>
								{document.filename}
							</Text>
						</View>
					</View>
				</TouchableOpacity>
			);
		});
	};

	const onMention = useCallback(
		async (mentionedUser: string) => {
			try {
				const tagName = mentionedUser.slice(1);
				const clanUser = usersClan?.find((userClan) => userClan?.user?.username === tagName);
				clanUser && setFoundUser(clanUser.user);
				if (!mentionedUser) return;
				setMessageSelected(EMessageBSToShow.UserInformation);
			} catch (error) {
				console.log('error', error);
			}
		},
		[usersClan, setFoundUser],
	);

	const jumpToChannel = async (channelId: string, clanId: string) => {
		const store = await getStoreAsync();

		store.dispatch(messagesActions.jumpToMessage({ messageId: '', channelId }));
		store.dispatch(
			channelsActions.joinChannel({
				clanId,
				channelId,
				noFetchMembers: false,
			}),
		);
	};

	const onChannelMention = useCallback(async (channel: ChannelsEntity) => {
		try {
			const type = channel?.type;
			const channelId = channel?.channel_id;
			const clanId = channel?.clan_id;

			if (type === ChannelType.CHANNEL_TYPE_VOICE) {
				Toast.show({
					type: 'info',
					text1: 'Updating...',
				});
			} else if (type === ChannelType.CHANNEL_TYPE_TEXT) {
				const dataSave = getUpdateOrAddClanChannelCache(clanId, channelId);
				save(STORAGE_KEY_CLAN_CURRENT_CACHE, dataSave);
				await jumpToChannel(channelId, clanId);
			}
		} catch (error) {
			console.log(error);
		}
	}, []);

	const getChannelById = (channelHashtagId: string) => {
		const channel = channelsEntities?.[channelHashtagId];
		if (channel) {
			return channel;
		} else {
			return {
				channel_label: channelHashtagId,
			};
		}
	};

	const formatMention = (text: string, matchesMention: RegExpMatchArray) => {
		const parts = text.split(splitBlockCodeRegex);

		return parts
			?.map((part) => {
				if (codeBlockRegex.test(part)) {
					return part;
				} else {
					if (matchesMention.includes(part)) {
						if (part.startsWith('@')) {
							return `[${part}](${part})`;
						}
						if (part.startsWith('<#')) {
							const channelId = part.match(channelIdRegex)[1];
							const channel = getChannelById(channelId) as ChannelsEntity;
							return `[#${channel.channel_label}](#${channelId})`;
						}
					}
				}
				return part;
			})
			.join('');
	};

	const onConfirmDeleteMessage = () => {
		DeleteSendMessage(props.message.id);
	};

	const setMessageSelected = (type: EMessageBSToShow) => {
		setOpenBottomSheet(type);
	};

	const jumpToRepliedMessage = () => {
		console.log('message to jump', messageRefFetchFromServe);
	};

	const isEdited = useMemo(() => {
		if (message?.update_time) {
			const updateDate = new Date(message?.update_time);
			const createDate = new Date(message?.create_time);
			return updateDate > createDate;
		}
		return false;
	}, [message]);

	return (
		<View style={[styles.messageWrapper, isCombine && { marginTop: 0 }, hasIncludeMention && styles.highlightMessageMention]}>
			{messageRefFetchFromServe ? (
				<View style={styles.aboveMessage}>
					<View style={styles.iconReply}>
						<ReplyIcon width={34} height={30} />
					</View>
					<Pressable onPress={() => jumpToRepliedMessage()} style={styles.repliedMessageWrapper}>
						{repliedSender?.user?.avatar_url ? (
							<View style={styles.replyAvatar}>
								<Image source={{ uri: repliedSender?.user?.avatar_url }} style={styles.replyAvatar} />
							</View>
						) : (
							<View style={[styles.replyAvatar]}>
								<View style={styles.avatarMessageBoxDefault}>
									<Text style={styles.repliedTextAvatar}>{repliedSender?.user?.username?.charAt(0)?.toUpperCase() || 'A'}</Text>
								</View>
							</View>
						)}
						<Text style={styles.repliedContentText} numberOfLines={1}>
							{messageRefFetchFromServe.content.t}
						</Text>
					</Pressable>
				</View>
			) : null}
			{!messageRefFetchFromServe && message?.references?.length && message.references ? (
				<View style={styles.aboveMessageDeleteReply}>
					<View style={styles.iconReply}>
						<ReplyIcon width={34} height={30} />
					</View>
					<View style={styles.iconMessageDeleteReply}>
						<ReplyMessageDeleted width={18} height={9} />
					</View>
					<Text style={styles.messageDeleteReplyText}>{t('messageDeleteReply')}</Text>
				</View>
			) : null}
			<View style={[styles.wrapperMessageBox, !isCombine && styles.wrapperMessageBoxCombine]}>
				{isShowInfoUser ? (
					<Pressable
						onPress={() => {
							setIsOnlyEmojiPicker(false);
							setMessageSelected(EMessageBSToShow.UserInformation);
							setFoundUser(user.user);
						}}
						style={styles.wrapperAvatar}
					>
						{user?.user?.avatar_url ? (
							<Image source={{ uri: user?.user?.avatar_url }} style={styles.logoUser} />
						) : (
							<View style={styles.avatarMessageBoxDefault}>
								<Text style={styles.textAvatarMessageBoxDefault}>{user?.user?.username?.charAt(0)?.toUpperCase() || 'A'}</Text>
							</View>
						)}
					</Pressable>
				) : (
					<View style={styles.wrapperAvatarCombine} />
				)}
				<Pressable
					style={[styles.rowMessageBox]}
					onLongPress={() => {
						setIsOnlyEmojiPicker(false);
						setMessageSelected(EMessageBSToShow.MessageAction);
						dispatch(setSelectedMessage(message));
					}}
				>
					{isShowInfoUser ? (
						<TouchableOpacity
							activeOpacity={0.8}
							onPress={() => {
								setIsOnlyEmojiPicker(false);
								setMessageSelected(EMessageBSToShow.UserInformation);
								setFoundUser(user?.user);
							}}
							style={styles.messageBoxTop}
						>
							<Text style={styles.userNameMessageBox}>{user?.user?.username || 'Anonymous'}</Text>
							<Text style={styles.dateMessageBox}>{convertTimeString(props?.message?.create_time)}</Text>
						</TouchableOpacity>
					) : null}
					{videos.length > 0 && renderVideos()}
					{images.length > 0 && renderImages()}

					{documents.length > 0 && renderDocuments()}
					{renderTextContent(lines, isEdited, t, channelsEntities, emojiListPNG, onMention, onChannelMention, isNumberOfLine)}
					<MessageAction
						message={message}
						dataReactionCombine={dataReactionCombine}
						mode={mode}
						emojiListPNG={emojiListPNG}
						openEmojiPicker={() => {
							setIsOnlyEmojiPicker(true);
							setMessageSelected(EMessageBSToShow.MessageAction);
						}}
					/>
				</Pressable>
			</View>
			<MessageItemBS
				mode={mode}
				message={message}
				onConfirmDeleteMessage={onConfirmDeleteMessage}
				type={openBottomSheet}
				isOnlyEmojiPicker={isOnlyEmojiPicker}
				onClose={() => {
					setOpenBottomSheet(null);
				}}
				user={foundUser}
			/>
		</View>
	);
}, arePropsEqual);

export default MessageItem;
