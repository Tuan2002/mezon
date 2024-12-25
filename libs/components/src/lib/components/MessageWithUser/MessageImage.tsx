import { useAppParams, useAttachments, useCurrentChat } from '@mezon/core';
import { attachmentActions, selectCurrentChannel, selectCurrentChannelId, selectCurrentClanId, selectCurrentDM, useAppDispatch } from '@mezon/store';
import {
	IAttachmentEntity,
	IImageWindowProps,
	SEND_ATTACHMENT_DATA,
	SHOW_POSITION,
	createImgproxyUrl,
	notImplementForGifOrStickerSendFromPanel
} from '@mezon/utils';
import isElectron from 'is-electron';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useMessageContextMenu } from '../ContextMenu';

export type MessageImage = {
	readonly attachmentData: ApiMessageAttachment & { create_time?: string };
	onContextMenu?: (event: React.MouseEvent<HTMLImageElement>) => void;
	mode?: ChannelStreamMode;
	messageId?: string;
};

const MessageImage = memo(({ attachmentData, onContextMenu, mode, messageId }: MessageImage) => {
	const imageUrlKey = `${attachmentData.url}?timestamp=${new Date().getTime()}`;
	const { directId } = useAppParams();
	const dispatch = useAppDispatch();
	const { setOpenModalAttachment, setAttachment } = useAttachments();
	const checkImage = notImplementForGifOrStickerSendFromPanel(attachmentData);
	const { setImageURL, setPositionShow } = useMessageContextMenu();
	const currentChannelId = useSelector(selectCurrentChannelId);
	const currentClanId = useSelector(selectCurrentClanId);
	const { directId: currentDmGroupId } = useAppParams();
	const [showLoader, setShowLoader] = useState(false);
	const fadeIn = useRef(false);
	const currentChannel = useSelector(selectCurrentChannel);
	const currentDm = useSelector(selectCurrentDM);
	const { currentChatUsersEntities } = useCurrentChat();
	let width = attachmentData.width || 0;
	let height = attachmentData.height || 150;
	const handleClick = useCallback(
		(url: string) => {
			if (checkImage) return;

			if (isElectron()) {
				const currentImageUploader = currentChatUsersEntities?.[attachmentData.sender_id as string];
				window.electron.openImageWindow({
					...attachmentData,
					uploaderData: {
						name:
							currentImageUploader?.clan_nick || currentImageUploader?.user?.display_name || currentImageUploader?.user?.username || '',
						avatar: (currentImageUploader?.clan_avatar || currentImageUploader?.user?.avatar_url) as string
					}
				});

				if ((currentClanId && currentChannelId) || currentDmGroupId) {
					const clanId = currentDmGroupId ? '0' : (currentClanId as string);
					const channelId = (currentDmGroupId as string) || (currentChannelId as string);
					dispatch(attachmentActions.fetchChannelAttachments({ clanId, channelId, noCache: true }))
						.then((data) => {
							const attachmentList = data.payload as IAttachmentEntity[];
							const imageList = attachmentList?.filter((image) => image.filetype?.includes('image'));
							const imageListWithUploaderInfo = imageList.map((image) => {
								const uploader = currentChatUsersEntities?.[image.uploader as string];
								return {
									...image,
									uploaderData: {
										avatar: (uploader?.clan_avatar || uploader?.user?.avatar_url) as string,
										name: uploader?.clan_nick || uploader?.user?.display_name || uploader?.user?.username || ''
									},
									url: createImgproxyUrl(image.url || '', {
										width: Math.round(width),
										height: Math.round(height),
										resizeType: 'fit'
									})
								};
							});
							const selectedImageIndex = imageList.findIndex((image) => image.url === attachmentData.url);
							return { imageListWithUploaderInfo, selectedImageIndex };
						})
						.then(({ imageListWithUploaderInfo, selectedImageIndex }) => {
							const channelImagesData: IImageWindowProps = {
								channelLabel: (directId ? currentDm.channel_label : currentChannel?.channel_label) as string,
								images: imageListWithUploaderInfo,
								selectedImageIndex: selectedImageIndex
							};
							window.electron.send(SEND_ATTACHMENT_DATA, { ...channelImagesData });
						});
				}
			} else {
				dispatch(attachmentActions.setMode(mode));
				setOpenModalAttachment(true);
				setAttachment(url);
				dispatch(
					attachmentActions.setCurrentAttachment({
						id: attachmentData.message_id as string,
						uploader: attachmentData.sender_id,
						create_time: attachmentData.create_time
					})
				);

				if ((currentClanId && currentChannelId) || currentDmGroupId) {
					const clanId = currentDmGroupId ? '0' : (currentClanId as string);
					const channelId = (currentDmGroupId as string) || (currentChannelId as string);
					dispatch(attachmentActions.fetchChannelAttachments({ clanId, channelId }));
				}

				dispatch(attachmentActions.setMessageId(messageId));
			}
		},
		[width, height]
	);

	const [imageLoaded, setImageLoaded] = useState(false);

	const handleContextMenu = useCallback(
		(e: any) => {
			setImageURL(attachmentData?.url ?? '');
			setPositionShow(SHOW_POSITION.NONE);
			if (typeof onContextMenu === 'function') {
				onContextMenu((e || {}) as React.MouseEvent<HTMLImageElement>);
			}
		},
		[attachmentData?.url, onContextMenu, setImageURL, setPositionShow]
	);

	const loaderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		loaderTimeoutRef.current = setTimeout(() => {
			if (!imageLoaded) {
				setShowLoader(true);
				fadeIn.current = true;
			}
		}, 500);

		return () => {
			if (loaderTimeoutRef.current) {
				clearTimeout(loaderTimeoutRef.current);
			}
		};
	}, [imageLoaded]);

	if (attachmentData.width && attachmentData.height) {
		const aspectRatio = attachmentData.width / attachmentData.height;

		if (height >= 275) {
			height = 275;
			width = height * aspectRatio;
		}

		if (width >= 550) {
			width = 550;
			height = width / aspectRatio;
		}
	}
	return (
		<div
			className="my-1"
			style={{
				height,
				width: width || 'auto'
			}}
		>
			<div style={{ height: 1, width: 1, opacity: 0 }}>.</div>
			{showLoader && !imageLoaded && (
				<div className="flex items-center justify-center bg-bgDarkPopover rounded h-full w-full" style={{ width: width || 150 }}></div>
			)}
			{imageLoaded && (
				<div className="flex" onClick={handleClick.bind(null, attachmentData.url || '')}>
					<div style={{ width: 1, opacity: 0 }}>.</div>
					<img
						draggable="false"
						key={imageUrlKey}
						onContextMenu={handleContextMenu}
						className={` flex object-cover object-left-top rounded cursor-default ${fadeIn.current ? 'fade-in' : ''}`}
						style={{ width: width || 'auto', height, cursor: 'pointer' }}
						src={createImgproxyUrl(attachmentData.url ?? '', { width: 600, height: 300, resizeType: 'fit' })}
						alt={'message'}
					/>
				</div>
			)}
			{!imageLoaded && (
				<img
					loading="lazy"
					style={{ height: 0 }}
					src={attachmentData.url}
					alt={'message'}
					onLoad={() => {
						if (loaderTimeoutRef.current) {
							clearTimeout(loaderTimeoutRef.current);
						}
						setImageLoaded(true);
						setShowLoader(false);
					}}
				/>
			)}
		</div>
	);
});

export default MessageImage;
