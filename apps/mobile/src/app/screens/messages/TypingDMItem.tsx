import { useChatTypings } from '@mezon/core';
import { ThemeModeBase, useTheme } from '@mezon/mobile-ui';
import { DirectEntity } from '@mezon/store-mobile';
import LottieView from 'lottie-react-native';
import React from 'react';
import { View } from 'react-native';
import { TYPING_DARK_MODE, TYPING_LIGHT_MODE } from '../../../assets/lottie';
import { UserStatus } from '../../components/UserStatus';
import { style } from './styles';

export const TypingDmItem = React.memo(({ directMessage }: { directMessage: DirectEntity }) => {
	const { themeValue, theme } = useTheme();
	const styles = style(themeValue);
	const { typingUsers } = useChatTypings({ channelId: directMessage?.channel_id, mode: directMessage?.type, isPublic: false, isDM: true });
	const userStatus = directMessage?.is_online?.some(Boolean);
	return (
		<View>
			{typingUsers?.length > 0 ? (
				<View style={[styles.statusTyping, userStatus ? styles.online : styles.offline]}>
					<LottieView source={theme === ThemeModeBase.DARK ? TYPING_DARK_MODE : TYPING_LIGHT_MODE} autoPlay loop style={styles.lottie} />
				</View>
			) : (
				<UserStatus status={{ status: directMessage.is_online?.some(Boolean), isMobile: false }} />
			)}
		</View>
	);
});
