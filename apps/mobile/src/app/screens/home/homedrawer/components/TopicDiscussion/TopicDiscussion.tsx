import { Block, useTheme } from '@mezon/mobile-ui';
import {
	getStoreAsync,
	messagesActions,
	selectCurrentChannel,
	selectCurrentClanId,
	selectCurrentTopicId,
	selectValueTopic
} from '@mezon/store-mobile';
import { checkIsThread, isPublicChannel } from '@mezon/utils';
import ShareLocationConfirmModal from 'apps/mobile/src/app/components/ShareLocationConfirmModal';
import { ChannelStreamMode } from 'mezon-js';
import React, { useCallback, useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import ChannelMessagesWrapper from '../../ChannelMessagesWrapper';
import { ChatBox } from '../../ChatBox';
import PanelKeyboard from '../../PanelKeyboard';
import { IModeKeyboardPicker } from '../BottomKeyboardPicker';
import TopicHeader from './TopicHeader/TopicHeader';
import { style } from './styles';

export default function TopicDiscussion() {
	const { themeValue } = useTheme();
	const valueTopic = useSelector(selectValueTopic);
	console.log('valueTopic: ', valueTopic);
	const currentTopicId = useSelector(selectCurrentTopicId);
	const currentClanId = useSelector(selectCurrentClanId);
	const currentChannel = useSelector(selectCurrentChannel);
	const panelKeyboardRef = useRef(null);
	console.log('currentTopicId: ', currentTopicId);

	const styles = style(themeValue);
	useEffect(() => {
		const fetchMsgResult = async () => {
			const store = await getStoreAsync();
			store.dispatch(
				messagesActions.fetchMessages({
					channelId: currentChannel?.channel_id,
					clanId: currentClanId,
					topicId: currentTopicId || ''
				})
			);
		};
		if (currentTopicId !== '') {
			fetchMsgResult();
		}
	}, [currentClanId, currentTopicId, currentChannel?.channel_id]);

	const onShowKeyboardBottomSheet = useCallback((isShow: boolean, type?: IModeKeyboardPicker) => {
		if (panelKeyboardRef?.current) {
			panelKeyboardRef.current?.onShowKeyboardBottomSheet(isShow, type);
		}
	}, []);
	return (
		<Block width={'100%'} height={'100%'}>
			<TopicHeader></TopicHeader>
			<KeyboardAvoidingView style={styles.channelView} behavior={'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 54 : 0}>
				<ChannelMessagesWrapper
					channelId={currentTopicId}
					clanId={currentClanId}
					isPublic={isPublicChannel(currentChannel)}
					mode={checkIsThread(currentChannel) ? ChannelStreamMode.STREAM_MODE_THREAD : ChannelStreamMode.STREAM_MODE_CHANNEL}
				/>
				<ChatBox
					channelId={currentChannel?.channel_id}
					mode={checkIsThread(currentChannel) ? ChannelStreamMode.STREAM_MODE_THREAD : ChannelStreamMode.STREAM_MODE_CHANNEL}
					onShowKeyboardBottomSheet={onShowKeyboardBottomSheet}
				/>
				<PanelKeyboard ref={panelKeyboardRef} currentChannelId={currentChannel?.channel_id} currentClanId={currentChannel?.clan_id} />
				<ShareLocationConfirmModal
					channelId={currentChannel?.channel_id}
					mode={checkIsThread(currentChannel) ? ChannelStreamMode.STREAM_MODE_THREAD : ChannelStreamMode.STREAM_MODE_CHANNEL}
				/>
			</KeyboardAvoidingView>
		</Block>
	);
}
function dispatch(arg0: any) {
	throw new Error('Function not implemented.');
}
