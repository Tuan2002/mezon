import { useDragAndDrop } from '@mezon/core';
import { referencesActions, selectAttachmentByChannelId, useAppDispatch } from '@mezon/store';
import { DragEvent } from 'react';
import { useSelector } from 'react-redux';
import DragAndDropUI from './DragAndDropUI';

type FileUploadByDnDOpt = {
	currentId: string;
};

function FileUploadByDnD({ currentId }: FileUploadByDnDOpt) {
	const dispatch = useAppDispatch();
	const uploadedAttachmentsInChannel = useSelector(selectAttachmentByChannelId(currentId))?.files || [];

	const { setDraggingState, setOverUploadingState } = useDragAndDrop();

	const handleDragEnter = (e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDraggingState(true);
	};

	const handleDragOver = (e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDragLeave = (e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDraggingState(false);
	};

	const handleDrop = async (e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDraggingState(false);
		const files = e.dataTransfer.files;
		const filesArray = Array.from(files);
		if (filesArray.length + uploadedAttachmentsInChannel.length > 10) {
			setOverUploadingState(true);
			return;
		}
		dispatch(
			referencesActions.setAtachmentAfterUpload({
				channelId: currentId,
				files: filesArray.map((file) => ({
					filename: file.name,
					filetype: file.type,
					size: file.size,
					url: URL.createObjectURL(file)
				}))
			})
		);
	};
	return <DragAndDropUI onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} />;
}

export default FileUploadByDnD;
