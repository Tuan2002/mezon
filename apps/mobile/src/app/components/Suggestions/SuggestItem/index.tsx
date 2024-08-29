import { useCheckVoiceStatus } from '@mezon/core';
import { Icons, ThreadIcon, ThreadIconLocker } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { ChannelsEntity } from '@mezon/store';
import { ChannelStatusEnum, getSrcEmoji } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { useTranslation } from 'react-i18next';
import { Image, Text, View } from 'react-native';
import { style } from './SuggestItem.styles';

type SuggestItemProps = {
	avatarUrl?: string;
	name: string;
	subText?: string;
	isDisplayDefaultAvatar?: boolean;
	isRoleUser?: boolean;
	emojiId?: string;
	channelId?: string;
	channel?: ChannelsEntity;
};

const SuggestItem = ({ channelId, avatarUrl, name, subText, isDisplayDefaultAvatar, isRoleUser, emojiId, channel }: SuggestItemProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const emojiSrc = emojiId ? getSrcEmoji(emojiId) : '';
	const { t } = useTranslation(['clan']);
	const isChannelPrivate = channel?.channel_private === ChannelStatusEnum.isPrivate;
	const isChannelText = channel?.type === ChannelType.CHANNEL_TYPE_TEXT;
	const isThread = channel?.parrent_id !== '0';
	const isChannelVoice = channel?.type === ChannelType.CHANNEL_TYPE_VOICE;

	const isVoiceActive = useCheckVoiceStatus(channelId);

	return (
		<View style={styles.wrapperItem}>
			<View style={styles.containerItem}>
				{avatarUrl ? (
					<Image
						style={styles.image}
						source={{
							uri: avatarUrl
						}}
					/>
				) : (
					!name.startsWith('here') &&
					!isRoleUser &&
					isDisplayDefaultAvatar && (
						<View style={styles.avatarMessageBoxDefault}>
							<Text style={styles.textAvatarMessageBoxDefault}>{name?.charAt(0)?.toUpperCase()}</Text>
						</View>
					)
				)}
				{emojiSrc && <Image style={styles.emojiImage} source={{ uri: emojiSrc }} />}
				{!isChannelPrivate && isChannelText && !isThread && <Icons.TextIcon width={16} height={16} color={themeValue.channelNormal} />}
				{channel?.channel_private === ChannelStatusEnum.isPrivate && isChannelText && !isThread && (
					<Icons.TextLockIcon width={16} height={16} color={themeValue.channelNormal} />
				)}
				{!isChannelPrivate && isChannelText && isThread && <ThreadIcon width={16} height={16} color={themeValue.channelNormal} />}

				{channel?.channel_private === ChannelStatusEnum.isPrivate && isChannelText && isThread && (
					<ThreadIconLocker width={16} height={16} color={themeValue.channelNormal} />
				)}
				{!isChannelPrivate && isChannelVoice && <Icons.VoiceNormalIcon width={16} height={16} color={themeValue.channelNormal} />}
				{isChannelPrivate && isChannelVoice && <Icons.VoiceLockIcon width={16} height={16} color={themeValue.channelNormal} />}
				{isRoleUser || name.startsWith('here') ? (
					<Text style={[styles.roleText, name.startsWith('here') && styles.textHere]}>{`@${name}`}</Text>
				) : (
					<View style={styles.channelWrapper}>
						<Text style={styles.title}>{name}</Text>
						{isVoiceActive && <Text style={styles.channelBusyText}>({t('busy')})</Text>}
					</View>
				)}
			</View>
			<Text style={styles.subText}>{subText}</Text>
		</View>
	);
};

export default SuggestItem;
