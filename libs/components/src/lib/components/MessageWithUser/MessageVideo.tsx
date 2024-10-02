import { ApiMessageAttachment } from 'mezon-js/api.gen';
import { useRef, useState } from 'react';
import { Icons } from '../../components';

export type MessageImage = {
	readonly attachmentData: ApiMessageAttachment;
};
export const MIN_WIDTH_VIDEO_SHOW = 162;
export const DEFAULT_HEIGHT_VIDEO_SHOW = 150;

function MessageVideo({ attachmentData }: MessageImage) {
	const handleOnCanPlay = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
		if (e.currentTarget.offsetWidth < MIN_WIDTH_VIDEO_SHOW) {
			setShowControl(false);
		}
	};
	const videoRef = useRef<HTMLVideoElement>(null);
	const [showControl, setShowControl] = useState(true);

	const handleShowFullVideo = () => {
		if (videoRef.current) {
			videoRef.current.requestFullscreen();
		}
	};
	const handleTogglePlay = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
		if (e.currentTarget.paused) {
			e.currentTarget.play();
		} else {
			e.currentTarget.pause();
		}
	};
	return (
		<div className="relative overflow-hidden w-full h-full max-w-fit rounded-lg">
			<video
				src={attachmentData.url}
				controls={showControl}
				autoPlay={false}
				className={`object-contain`}
				style={{
					width: showControl ? 'auto' : MIN_WIDTH_VIDEO_SHOW,
					height: showControl ? DEFAULT_HEIGHT_VIDEO_SHOW : `auto`
				}}
				ref={videoRef}
				onCanPlay={(e) => handleOnCanPlay(e)}
				onClick={(e) => handleTogglePlay(e)}
			></video>
			{!showControl && (
				<div className="bottom-1 right-1 absolute w-4 h-4 rounded overflow-hidden cursor-pointer z-10" onClick={handleShowFullVideo}>
					<Icons.FullScreen defaultSize="w-4 h-4" defaultFill="text-channelTextLabel" />
				</div>
			)}
		</div>
	);
}

export default MessageVideo;
