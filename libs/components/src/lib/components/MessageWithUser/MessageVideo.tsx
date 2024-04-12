import { ApiMessageAttachment } from 'mezon-js/api.gen';

export type MessageImage = {
	content?: string;
	attachmentData: ApiMessageAttachment;
};

function MessageVideo({ attachmentData }: MessageImage) {
	return (
		<>
			<video src={attachmentData.url} controls={true} autoPlay={false} className="h-[200px]"></video>
		</>
	);
}

export default MessageVideo;
