import React from 'react';
import { Dimensions, TextInput, View } from 'react-native';
import AngleRightIcon from '../../../../assets/svg/angle-right.svg';
import ChatGiftIcon from '../../../../assets/svg/chatGiftNitro.svg';
import PlusIcon from '../../../../assets/svg/guildAddRole.svg';
import MicrophoneIcon from '../../../../assets/svg/microphone.svg';
import SendButtonIcon from '../../../../assets/svg/sendButton.svg';
import SmilingFaceIcon from '../../../../assets/svg/voiceReaction.svg';
import { styles } from './styles';
import {Colors} from "../../../themes";

const inputWidthWhenHasInput = Dimensions.get('window').width * 0.7;

const ChatBox = React.memo((props: { channelTitle: string; channelId: number; serverId: number }) => {
	const inputRef = React.useRef<any>();
	const [text, setText] = React.useState<string>('');
	const user_details = { id: 1, image: 'https://unsplash.it/400/400?image=1', name: 'Paulos', user_name: 'paulos_ab' };

	const handleSendMessage = React.useCallback(() => {
		if (text.length == 0) return;
		const message = {
			channelId: props.channelId,
			serverId: props.serverId,
			message: text,
			datetime: new Date().toLocaleString(),
			user_details: user_details,
		};
		setText('');
	}, [text]);

	return (
		<View style={styles.wrapperChatBox}>
			{text.length > 0 ? (
				<View style={[styles.iconContainer, { backgroundColor: '#333333' }]}>
					<AngleRightIcon width={18} height={18} />
				</View>
			) : (
				<>
					<View style={[styles.iconContainer, { backgroundColor: '#333333' }]}>
						<PlusIcon width={22} height={22} />
					</View>
					<View style={[styles.iconContainer, { backgroundColor: '#333333' }]}>
						<ChatGiftIcon width={22} height={22} />
					</View>
				</>
			)}
			<View style={{ position: 'relative', justifyContent: 'center' }}>
				<TextInput
					placeholder={'Message #' + props.channelTitle}
					placeholderTextColor={Colors.textGray}
					onChangeText={setText}
					defaultValue={text}
					ref={inputRef}
					style={[
						styles.inputStyle,
						text.length > 0 && { width: inputWidthWhenHasInput },
						{ backgroundColor: '#333333', color: '#FFFFFF' },
					]}
				/>
				<SmilingFaceIcon width={25} height={25} style={styles.iconEmoji} />
			</View>
			<View style={[styles.iconContainer, { backgroundColor: '#2b2d31' }]}>
				{text.length > 0 ? (
					<View onTouchEnd={handleSendMessage} style={[styles.iconContainer, styles.iconSend]}>
						<SendButtonIcon width={18} height={18} />
					</View>
				) : (
					<MicrophoneIcon width={22} height={22} />
				)}
			</View>
		</View>
	);
});

export default ChatBox;
