import { ActionEmitEvent } from '@mezon/mobile-components';
import { Block, size, Text, useTheme } from '@mezon/mobile-ui';
import { ChannelStreamMode } from 'mezon-js';
import React, { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceEventEmitter } from 'react-native';
import { useUserPermission } from '../../../hooks/useUserPermission';
import { ActionMessageSelected } from './components/ChatBox/ActionMessageSelected';
import { ChatBoxBottomBar } from './components/ChatBox/ChatBoxBottomBar';
import { EMessageActionType } from './enums';
import { IMessageActionNeedToResolve } from './types';

interface IChatBoxProps {
	channelId: string;
	mode: ChannelStreamMode;
	messageAction?: EMessageActionType;
	hiddenIcon?: {
		threadIcon: boolean;
	};
	directMessageId?: string;
	onShowKeyboardBottomSheet?: (isShow: boolean, height: number, type?: string) => void;
}
export const ChatBox = memo((props: IChatBoxProps) => {
	const { themeValue } = useTheme();
	const { t } = useTranslation(['message'])
	const [messageActionNeedToResolve, setMessageActionNeedToResolve] = useState<IMessageActionNeedToResolve | null>(null);
	const { isCanSendMessage } = useUserPermission();
	useEffect(() => {
		if (props?.channelId && messageActionNeedToResolve) {
			setMessageActionNeedToResolve(null);
		}
	}, [props?.channelId]);

	useEffect(() => {
		const showKeyboard = DeviceEventEmitter.addListener(ActionEmitEvent.SHOW_KEYBOARD, (value) => {
			//NOTE: trigger from message action 'MessageItemBS and MessageItem component'
			setMessageActionNeedToResolve(value);
		});
		return () => {
			showKeyboard.remove();
		};
	}, []);

	const deleteMessageActionNeedToResolve = () => {
		setMessageActionNeedToResolve(null);
	};

	return (
		<Block>
			{isCanSendMessage ? (
				<Block backgroundColor={themeValue.secondary} borderTopWidth={1} borderTopColor={themeValue.border} flexDirection='column' justifyContent='space-between'>
					{messageActionNeedToResolve && (
						<ActionMessageSelected messageActionNeedToResolve={messageActionNeedToResolve} onClose={() => setMessageActionNeedToResolve(null)} />
					)}
					<ChatBoxBottomBar
						messageActionNeedToResolve={messageActionNeedToResolve}
						onDeleteMessageActionNeedToResolve={() => deleteMessageActionNeedToResolve()}
						channelId={props?.channelId}
						mode={props?.mode}
						hiddenIcon={props?.hiddenIcon}
						messageAction={props?.messageAction}
						onShowKeyboardBottomSheet={props?.onShowKeyboardBottomSheet}
					/>
				</Block>
			) : (
				<Block>
					<Block backgroundColor={themeValue.charcoal} padding={size.s_12} borderRadius={size.s_20} marginHorizontal={size.s_10}>
						<Text color={themeValue.textDisabled}>{t('noSendMessagePermission')}</Text>
					</Block>
				</Block>
			)}
		</Block>
	);
});
