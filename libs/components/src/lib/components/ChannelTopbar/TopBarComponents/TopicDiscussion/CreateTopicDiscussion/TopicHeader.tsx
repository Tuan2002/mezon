import { useMessageValue } from '@mezon/core';
import { selectCurrentChannelId, topicsActions, useAppDispatch } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { ApiChannelDescription } from 'mezon-js/api.gen';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';

type TopicHeaderProps = {
	topicCurrentChannel?: ApiChannelDescription | null;
};

const TopicHeader = ({ topicCurrentChannel }: TopicHeaderProps) => {
	const dispatch = useAppDispatch();
	const currentChannelId = useSelector(selectCurrentChannelId);

	const setIsShowCreateTopic = useCallback(
		(isShowCreateTopic: boolean, channelId?: string) => {
			dispatch(topicsActions.setIsShowCreateTopic({ channelId: channelId ? channelId : (currentChannelId as string), isShowCreateTopic }));
		},
		[currentChannelId, dispatch]
	);

	const setTurnOffThreadMessage = useCallback(() => {
		dispatch(topicsActions.setOpenTopicMessageState(false));
		dispatch(topicsActions.setValueTopic(null));
	}, [dispatch]);

	const { setRequestInput, request } = useMessageValue();

	const handleCloseModal = () => {
		setTurnOffThreadMessage();
		setIsShowCreateTopic(false);
		setRequestInput({ ...request, valueTextInput: '' }, true);
	};

	return (
		<div className="flex flex-row items-center justify-between px-4 h-[58px] min-h-[60px] border-b-[1px] dark:border-bgTertiary border-bgLightTertiary">
			<div className="flex flex-row items-center gap-2 pointer-events-none">
				<Icons.TopicIcon />
				<span className="text-base font-semibold dark:text-white text-colorTextLightMode">{'Topic'}</span>
			</div>
			<button onClick={handleCloseModal} className="relative right-0">
				<Icons.Close />
			</button>
		</div>
	);
};

export default TopicHeader;
