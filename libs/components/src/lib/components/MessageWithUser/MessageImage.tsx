import { useAppParams, useAttachments } from '@mezon/core';
import { attachmentActions, checkListAttachmentExist, selectCurrentChannelId, selectCurrentClanId, useAppDispatch } from '@mezon/store';
import { SHOW_POSITION, notImplementForGifOrStickerSendFromPanel } from '@mezon/utils';
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
	const dispatch = useAppDispatch();
	const { setOpenModalAttachment, setAttachment } = useAttachments();
	const checkImage = notImplementForGifOrStickerSendFromPanel(attachmentData);
	const { setImageURL, setPositionShow } = useMessageContextMenu();
	const currentChannelId = useSelector(selectCurrentChannelId);
	const currentClanId = useSelector(selectCurrentClanId);
	const { directId: currentDmGroupId } = useAppParams();
	const [showLoader, setShowLoader] = useState(false);
	const fadeIn = useRef(false);
	const checkListAttachment = useSelector(checkListAttachmentExist((currentDmGroupId || currentChannelId) as string));

	const handleClick = (url: string) => {
		if (checkImage) return;

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

		if (((currentClanId && currentChannelId) || currentDmGroupId) && !checkListAttachment) {
			const clanId = currentDmGroupId ? '0' : (currentClanId as string);
			const channelId = (currentDmGroupId as string) || (currentChannelId as string);
			dispatch(attachmentActions.fetchChannelAttachments({ clanId, channelId }));
		}

		dispatch(attachmentActions.setMessageId(messageId));
	};

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
		}, 5000);

		return () => {
			if (loaderTimeoutRef.current) {
				clearTimeout(loaderTimeoutRef.current);
			}
		};
	}, [imageLoaded]);

	return (
		<div className="my-1">
			<div style={{ height: 1, width: 1, opacity: 0 }}>.</div>
			{showLoader && !imageLoaded && (
				<div role="status" className="image-loading max-w-md rounded shadow animate-pulse">
					<div
						className={`flex items-center justify-center bg-gray-300 rounded ${attachmentData.height ? 'max-w-4xl max-h-[480px]' : 'h-[150px]'}`}
						style={{
							width: attachmentData.width ?? 'auto',
							height: attachmentData.height ?? 150
						}}
					>
						<svg
							className={`w-10 h-10 text-gray-200 object-scale-down`}
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="currentColor"
							viewBox="0 0 16 20"
						>
							<path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z" />
							<path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
						</svg>
					</div>
				</div>
			)}
			{imageLoaded && (
				<div className="flex">
					<div style={{ width: 1, opacity: 0 }}>.</div>
					<img
						onContextMenu={handleContextMenu}
						className={`${attachmentData.height ? 'max-w-4xl max-h-[480px]' : 'h-[150px]'} object-left-top rounded cursor-default ${fadeIn.current ? 'fade-in' : ''}`}
						src={attachmentData.url}
						alt={'message'}
						onClick={() => handleClick(attachmentData.url || '')}
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
