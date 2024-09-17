import { Icons, LockIcon } from '@mezon/mobile-components';
import { Block, Colors, size, useTheme } from '@mezon/mobile-ui';
import { ChannelThreads } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity } from 'react-native';
import style from './ChannelItem.styles';

type ChannelItemProps = {
	channelData?: ChannelThreads;
	onPress: (channelData: ChannelThreads) => void;
};
const ChannelItem = React.memo(({ channelData, onPress }: ChannelItemProps) => {
	const { t } = useTranslation(['searchMessageChannel']);
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const handleOnPress = () => {
		onPress && onPress(channelData);
	};
	return (
		<TouchableOpacity onPress={handleOnPress} style={{ marginBottom: size.s_20 }}>
			{channelData?.type === ChannelType.CHANNEL_TYPE_TEXT ? (
				<Block flexDirection="row" gap={size.s_10} alignItems="center">
					{channelData?.channel_label && Number(channelData?.parrent_id) ? (
						channelData?.channel_private ? (
							<Icons.ThreadLockIcon width={size.s_20} height={size.s_20} color={Colors.textGray} />
						) : (
							<Icons.ThreadIcon width={size.s_20} height={size.s_20} color={Colors.textGray} />
						)
					) : channelData?.channel_private ? (
						<Icons.TextLockIcon width={size.s_20} height={size.s_20} color={Colors.textGray} />
					) : (
						<Icons.TextIcon width={size.s_20} height={size.s_20} color={Colors.textGray} />
					)}
					<Block>
						<Block flexDirection="row" alignItems="center" gap={size.s_6} marginBottom={size.s_6}>
							<Text style={styles.channelName}>{channelData?.channel_label}</Text>
						</Block>
						{channelData?.category_name && <Text style={styles.categoryChannel}>{channelData?.category_name}</Text>}
					</Block>
				</Block>
			) : null}
			{channelData?.type === ChannelType.CHANNEL_TYPE_VOICE ? (
				<Block flexDirection="row" gap={size.s_10} alignItems="center" justifyContent="space-between">
					<Block flexDirection="row" gap={size.s_10} alignItems="center">
						{channelData?.channel_private ? (
							<Icons.VoiceNormalIcon width={size.s_20} height={size.s_20} color={Colors.textGray} />
						) : (
							<Icons.VoiceLockIcon width={size.s_20} height={size.s_20} color={Colors.textGray} />
						)}
						<Block>
							<Block flexDirection="row" alignItems="center" gap={size.s_6} marginBottom={size.s_6}>
								<Text style={styles.channelName}>{channelData?.channel_label}</Text>
								<LockIcon width={10} height={10} color={Colors.textGray} />
							</Block>
							{channelData?.category_name && <Text style={styles.categoryChannel}>{channelData?.category_name}</Text>}
						</Block>
					</Block>
					<Block style={styles.joinChannelBtn}>
						<Icons.VoiceNormalIcon width={size.s_20} height={size.s_20} color={Colors.textGray} />
						<Text style={styles.joinChannelBtnText}>{t('joinChannel')}</Text>
					</Block>
				</Block>
			) : null}
		</TouchableOpacity>
	);
});

export default ChannelItem;
