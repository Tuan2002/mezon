import { useDragAndDrop } from '@mezon/core';
import { selectCurrentChannel } from '@mezon/store';
import { DragEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import DocumentThumbnail from './DocumentThumbnail';

type DragAndDropUIProps = {
	channelID?: string;
	userID?: string;
	onDragEnter: (e: DragEvent<HTMLElement>) => void;
	onDragOver: (e: DragEvent<HTMLElement>) => void;
	onDragLeave: (e: DragEvent<HTMLElement>) => void;
	onDrop: (e: DragEvent<HTMLElement>) => void;
};
function DragAndDropUI({ onDrop }: DragAndDropUIProps) {
	const currentChannel = useSelector(selectCurrentChannel);
	const { draggingState, setDraggingState } = useDragAndDrop();

	const [isOverChild, setIsOverChild] = useState(false);

	const handleParentDragLeave = (e: DragEvent<HTMLElement>) => {
		if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) {
			setDraggingState(false);
		}
	};

	const handleDrop = (e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		onDrop(e);
	};

	return (
		<div
			id="form-file-upload"
			onDragEnter={() => {
				setDraggingState(true);
			}}
			onDragLeave={handleParentDragLeave}
			onDrop={handleDrop}
			onDragOver={(e) => e.preventDefault()}
			className="w-screen h-screen flex justify-center items-center bg-black  bg-opacity-90 absolute top-0 left-0 z-30"
		>
			<div
				onDragEnter={() => {
					setIsOverChild(true);
					setDraggingState(true);
				}}
				onDragOver={() => {
					setIsOverChild(true);
					setDraggingState(true);
				}}
				onDragLeave={() => {
					setIsOverChild(false);
				}}
				onDrop={onDrop}
				className="w-[25rem] h-[15rem] bg-[#5865F2] flex flex-row justify-center  items-center rounded-lg z-50 relative"
			>
				<div className=" absolute z-50 -top-12">
					<DocumentThumbnail />
				</div>
				<div className="border-2 border-white w-[90%] h-[86%] rounded-lg border-dashed">
					<div className="flex flex-col justify-center mt-14">
						<div className=" w-full flex flex-row justify-center">
							<h1 className=" font-bold text-2xl mt-[1rem] text-center">Upload To #{currentChannel?.channel_label}</h1>
						</div>
						<div className=" w-full flex flex-row justify-center text-center mt-[1rem]">
							<p className="w-[85%]">You can add comments before uploading. Hold shift to upload directly.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default DragAndDropUI;

