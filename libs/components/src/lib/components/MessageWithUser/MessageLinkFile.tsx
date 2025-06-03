import { selectTheme } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { DOWNLOAD_FILE, EFailAttachment, electronBridge, IMessageWithUser } from '@mezon/utils';
import isElectron from 'is-electron';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import { lazy, Suspense, useState } from 'react';
import { useModal } from 'react-modal-hook';
import { useSelector } from 'react-redux';
import { ModalDeleteMess, RenderAttachmentThumbnail } from '../../components';
const PDFViewerModal = lazy(() => import('../PDFViewer').then((module) => ({ default: module.PDFViewerModal })));

export type MessageImage = {
	readonly attachmentData: ApiMessageAttachment;
	readonly mode?: ChannelStreamMode;
	message?: IMessageWithUser;
};
function formatFileSize(bytes: number) {
	if (bytes >= 1000000) {
		return (bytes / 1000000).toFixed(1) + ' MB';
	} else if (bytes >= 1000) {
		return (bytes / 1000).toFixed(1) + ' kB';
	} else {
		return bytes + ' bytes';
	}
}

export const AttachmentLoader = ({ appearanceTheme }: { appearanceTheme: 'light' | 'dark' | 'system' }) => {
	return (
		<div className="w-[30px] h-[30px] flex justify-center items-center">
			<div className={appearanceTheme === 'light' ? 'light-attachment-loader' : 'dark-attachment-loader'} />
		</div>
	);
};

const PDFLoadingFallback = () => {
	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
			<div
				className={`relative w-[90vw] h-[90vh] max-w-4xl bg-gray-50 dark:bg-[#2f3136] rounded-lg shadow-xl flex items-center justify-center`}
			>
				<div className="flex flex-col items-center space-y-4">
					<div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-gray-200 dark:border-[#202225]}`} />
					<p
						className={`text-sm transition-colors duration-200 text-gray-600 dark:text-[#b9bbbe] hover:bg-gray-200 dark:hover:bg-[#40444b]`}
					>
						Loading PDF Viewer...
					</p>
				</div>
			</div>
		</div>
	);
};

function MessageLinkFile({ attachmentData, mode, message }: MessageImage) {
	const handleDownload = async () => {
		// window.open(attachmentData.);
		const response = await fetch(attachmentData.url as string);
		if (!response.ok) {
			return;
		}
		if (isElectron()) {
			try {
				await electronBridge.invoke(DOWNLOAD_FILE, {
					url: attachmentData.url as string,
					defaultFileName: attachmentData.filename as string
				});
			} catch (error) {
				console.error('Error during download:', error);
			}
		} else {
			const blob = await response.blob();
			const dataUrl = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = dataUrl;
			a.download = attachmentData.filename as string;
			a.click();
		}
	};
	const thumbnailAttachment = RenderAttachmentThumbnail({ attachment: attachmentData, size: 'w-8 h-10' });

	const hideTheInformationFile =
		attachmentData.filetype !== 'image/gif' &&
		attachmentData.filetype !== 'image/png' &&
		attachmentData.filetype !== 'image/jpeg' &&
		attachmentData.filetype !== 'video/mp4';

	const isPDF = attachmentData.filetype === 'application/pdf' || attachmentData.filename?.toLowerCase().endsWith('.pdf');

	const [hoverShowOptButtonStatus, setHoverShowOptButtonStatus] = useState(false);
	const hoverOptButton = () => {
		setHoverShowOptButtonStatus(true);
	};

	const appearanceTheme = useSelector(selectTheme);

	const [showPDFViewer, closePDFViewer] = useModal(() => {
		if (isPDF && attachmentData.url) {
			return (
				<Suspense fallback={<PDFLoadingFallback />}>
					<PDFViewerModal isOpen={true} onClose={closePDFViewer} pdfUrl={attachmentData.url as string} filename={attachmentData.filename} />
				</Suspense>
			);
		}
		return null;
	}, [isPDF, attachmentData.url, attachmentData.filename]);

	const [showModal, closeModal] = useModal(() => {
		if (message && mode) {
			return (
				<ModalDeleteMess
					mess={message || undefined}
					closeModal={closeModal}
					mode={mode}
					isRemoveAttachmentNoContent={message?.content?.t !== '' || message?.attachments?.length !== 1}
					isRemoveAttachmentAction={true}
					attachmentData={attachmentData}
				/>
			);
		}
	}, [message?.id, mode, message?.content?.t]);

	const handleOpenRemoveAttachementModal = () => {
		showModal();
	};

	return (
		<div
			onMouseEnter={hoverOptButton}
			onMouseLeave={() => setHoverShowOptButtonStatus(false)}
			className={`break-all w-full cursor-default gap-3 flex items-center mt-[10px] py-3 pl-3 pr-3 rounded max-w-full ${hideTheInformationFile ? 'dark:border-[#232428] dark:bg-[#2B2D31] bg-white border-2' : ''}  relative`}
			role="button"
		>
			{message?.isSending ? (
				<AttachmentLoader appearanceTheme={appearanceTheme} />
			) : (
				<div className="flex items-center">{thumbnailAttachment}</div>
			)}
			{attachmentData.filename === EFailAttachment.FAIL_ATTACHMENT ? (
				<div className="text-red-500">Attachment failed to load.</div>
			) : (
				hideTheInformationFile && (
					<>
						<div className="cursor-pointer flex-1" onClick={handleDownload} onKeyDown={handleDownload}>
							<p className="text-blue-500 hover:underline">{attachmentData.filename}</p>
							<p className="dark:text-textDarkTheme text-textLightTheme">size: {formatFileSize(attachmentData.size || 0)}</p>
						</div>
						{hoverShowOptButtonStatus && (
							<div className="flex space-x-2">
								<button
									onClick={handleDownload}
									className="rounded-md w-8 h-8 flex justify-center items-center cursor-pointer dark:hover:bg-[#393C40] hover:bg-gray-300"
									title="Download"
								>
									<Icons.Download defaultSize="w-4 h-4" />
								</button>
								<button
									onClick={handleOpenRemoveAttachementModal}
									className="rounded-md w-8 h-8 flex justify-center items-center cursor-pointer  dark:hover:bg-[#393C40] hover:bg-gray-300"
									title="Remove"
								>
									<Icons.TrashIcon className="w-4 h-4 dark:text-[#AEAEAE] text-colorTextLightMode" />
								</button>
							</div>
						)}
						{isPDF && (
							<button
								onClick={showPDFViewer}
								className="px-3 py-1 text-sm rounded transition-all duration-200 text-white bg-[#5865f2] hover:opacity-90"
								title="View PDF"
							>
								View
							</button>
						)}
					</>
				)
			)}
		</div>
	);
}

export default MessageLinkFile;
