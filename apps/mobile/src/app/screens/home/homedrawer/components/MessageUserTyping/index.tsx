import { useChatTypings } from '@mezon/core';
import { Block, size, Text, ThemeModeBase, useTheme } from '@mezon/mobile-ui';
import LottieView from 'lottie-react-native';
import { ChannelStreamMode } from 'mezon-js';
import React, { useMemo } from 'react';
import { TYPING_DARK_MODE, TYPING_LIGHT_MODE } from '../../../../../../assets/lottie';
import { style } from './styles';

interface IProps {
	channelId: string;
	isDM: boolean;
	mode: ChannelStreamMode;
	isPublic: boolean;
}

export const MessageUserTyping = React.memo(({ channelId, isDM, mode, isPublic }: IProps) => {
	const { themeValue, theme } = useTheme();
	const styles = style(themeValue);
	const { typingUsers } = useChatTypings({ channelId, mode, isPublic, isDM });
	const typingLabel = useMemo(() => {
		if (typingUsers?.length === 1) {
			return `${typingUsers[0].clan_nick || typingUsers[0].user?.display_name || typingUsers[0].user?.username} is typing...`;
		}
		if (typingUsers?.length > 1) {
			return 'Several people are typing...';
		}
		return '';
	}, [typingUsers]);

	if (!typingLabel) {
		return null;
	}
	return (
		<Block
			flexDirection="row"
			width={'100%'}
			paddingVertical={size.s_4}
			paddingHorizontal={size.s_10}
			position={'absolute'}
			bottom={0}
			backgroundColor={themeValue.primary}
		>
			<LottieView source={theme === ThemeModeBase.DARK ? TYPING_DARK_MODE : TYPING_LIGHT_MODE} autoPlay loop style={styles.threeDot} />
			<Text style={styles.typingLabel}>{typingLabel}</Text>
		</Block>
	);
});
