import {
	selectCurrentChannelId,
	selectIsShowCreateTopic,
	selectMessageTopicError,
	selectValueTopic,
	topicsActions,
	useAppDispatch
} from '@mezon/store';
import { IMessageWithUser } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useTopics() {
	const dispatch = useAppDispatch();
	const currentChannelId = useSelector(selectCurrentChannelId);
	const messageTopicError = useSelector(selectMessageTopicError);
	const isShowCreateTopic = useSelector(selectIsShowCreateTopic);
	const valueTopic = useSelector(selectValueTopic);

	const setTurnOffTopicMessage = useCallback(() => {
		setOpenTopicMessageState(false);
		setValueTopic(null);
	}, [dispatch]);

	const setOpenTopicMessageState = useCallback(
		(value: boolean) => {
			dispatch(topicsActions.setOpenTopicMessageState(value));
		},
		[dispatch]
	);

	const setIsShowCreateTopic = useCallback(
		(isShowCreateTopic: boolean, channelId?: string) => {
			dispatch(topicsActions.setIsShowCreateTopic(isShowCreateTopic));
		},
		[currentChannelId, dispatch]
	);

	const setValueTopic = useCallback(
		(value: IMessageWithUser | null) => {
			dispatch(topicsActions.setValueTopic(value));
		},
		[dispatch]
	);
	return useMemo(
		() => ({
			isShowCreateTopic,
			messageTopicError,
			valueTopic,
			setIsShowCreateTopic,
			setValueTopic,
			setOpenTopicMessageState,
			setTurnOffTopicMessage
		}),
		[isShowCreateTopic, messageTopicError, valueTopic, setIsShowCreateTopic, setValueTopic, setOpenTopicMessageState, setTurnOffTopicMessage]
	);
}
