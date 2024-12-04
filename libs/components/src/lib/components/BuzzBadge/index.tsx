import { channelsActions, directActions } from '@mezon/store';
import { ChannelStreamMode } from 'mezon-js';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
type BuzzBadgeProps = {
	channelId: string;
	isReset: boolean;
	senderId: string;
	mode: ChannelStreamMode;
	timestamp: number;
};

const BuzzBadge = ({ channelId, isReset, senderId, mode, timestamp }: BuzzBadgeProps) => {
	const dispatch = useDispatch();

	const isPosDmOrGr = mode === ChannelStreamMode.STREAM_MODE_DM || mode === ChannelStreamMode.STREAM_MODE_GROUP;
	const isChannelOrThread = mode === ChannelStreamMode.STREAM_MODE_CHANNEL || mode === ChannelStreamMode.STREAM_MODE_THREAD;

	useEffect(() => {
		if (isReset) {
			const timer = setTimeout(() => {
				if (isChannelOrThread) {
					dispatch(channelsActions.setBuzzState({ channelId, buzzState: null }));
				} else if (isPosDmOrGr) {
					dispatch(directActions.setBuzzStateDirect({ channelId, buzzState: null }));
				}
			}, 10000);
			return () => clearTimeout(timer);
		}
	}, [isReset, senderId, channelId, dispatch, isPosDmOrGr, isChannelOrThread, timestamp]);

	return (
		<div>
			{isReset && (
				<div
					className={`bg-red-500 text-xs absolute ${
						isPosDmOrGr ? 'top-3.5 right-6' : 'top-1.5 right-12'
					} text-white rounded-sm p-0.5 text-center font-medium`}
				>
					Buzz!!
				</div>
			)}
		</div>
	);
};

export default BuzzBadge;
