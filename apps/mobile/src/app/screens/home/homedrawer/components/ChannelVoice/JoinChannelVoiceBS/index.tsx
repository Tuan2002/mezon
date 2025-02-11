import { BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet';
import {
	ActionEmitEvent,
	Icons,
	STORAGE_DATA_CLAN_CHANNEL_CACHE,
	changeClan,
	getUpdateOrAddClanChannelCache,
	jumpToChannel,
	save
} from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import { selectCurrentClanId } from '@mezon/store-mobile';
import { IChannel } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { ChannelType } from 'mezon-js';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceEventEmitter, Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../../../../../navigation/ScreenTypes';
import { InviteToChannel } from '../../InviteToChannel';
import { style } from './JoinChannelVoiceBS.styles';
function JoinChannelVoiceBS({ channel }: { channel: IChannel }, refRBSheet: React.MutableRefObject<BottomSheetModal>) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const bottomSheetInviteRef = useRef(null);
	const { dismiss } = useBottomSheetModal();
	const { t } = useTranslation(['channelVoice']);
	const currentClanId = useSelector(selectCurrentClanId);
	const handleJoinVoice = async () => {
		if (!channel.meeting_code) return;
		const data = {
			channelId: channel.channel_id || '',
			roomName: channel.meeting_code
		};
		DeviceEventEmitter.emit(ActionEmitEvent.ON_OPEN_MEZON_MEET, data);
		dismiss();
	};

	const navigation = useNavigation<any>();

	const handleShowChat = async () => {
		if (channel?.type === ChannelType.CHANNEL_TYPE_MEZON_VOICE) {
			navigation.navigate(APP_SCREEN.MESSAGES.STACK, {
				screen: APP_SCREEN.MESSAGES.CHAT_STREAMING
			});
			joinChannel();
		}
	};

	const joinChannel = async () => {
		const clanId = channel?.clan_id;
		const channelId = channel?.channel_id;

		if (currentClanId !== clanId) {
			changeClan(clanId);
		}
		DeviceEventEmitter.emit(ActionEmitEvent.FETCH_MEMBER_CHANNEL_DM, {
			isFetchMemberChannelDM: true
		});
		const dataSave = getUpdateOrAddClanChannelCache(clanId, channelId);
		save(STORAGE_DATA_CLAN_CHANNEL_CACHE, dataSave);
		await jumpToChannel(channelId, clanId);
		dismiss();
	};

	return (
		<Block width={'100%'} paddingVertical={size.s_10} paddingHorizontal={size.s_10}>
			<Block flexDirection="row" justifyContent="space-between" gap={10}>
				<Block flexDirection="row" justifyContent="space-between" alignItems="center" gap={10} flexGrow={1} flexShrink={1}>
					<TouchableOpacity
						onPress={() => {
							refRBSheet?.current.dismiss();
						}}
						style={styles.buttonCircle}
					>
						<Icons.ChevronSmallDownIcon />
					</TouchableOpacity>
					<Text numberOfLines={2} style={[styles.text, { flexGrow: 1, flexShrink: 1 }]}>
						{channel?.channel_label}
					</Text>
				</Block>
				<TouchableOpacity
					onPress={() => {
						bottomSheetInviteRef.current.present();
						refRBSheet?.current.dismiss();
					}}
					style={{
						backgroundColor: themeValue.tertiary,
						padding: size.s_8,
						borderRadius: size.s_22
					}}
				>
					<Icons.UserPlusIcon />
				</TouchableOpacity>
			</Block>
			<Block alignItems="center" gap={size.s_6}>
				<Block
					style={{
						width: size.s_100,
						height: size.s_100,
						borderRadius: size.s_50,
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: themeValue.tertiary
					}}
				>
					<Icons.VoiceNormalIcon width={size.s_36} height={size.s_36} />
				</Block>
				<Text style={styles.text}>{t('joinChannelVoiceBS.channelVoice')}</Text>
				<Text style={styles.textDisable}>{t('joinChannelVoiceBS.noOne')}</Text>
				<Text style={styles.textDisable}>{t('joinChannelVoiceBS.readyTalk')}</Text>
			</Block>
			<Block borderRadius={size.s_40} marginTop={size.s_20} marginBottom={size.s_10}>
				<Block
					gap={size.s_20}
					flexDirection="row"
					alignItems="center"
					justifyContent="space-between"
					paddingHorizontal={size.s_16}
					paddingBottom={size.s_16}
				>
					<Block
						justifyContent="center"
						alignItems="center"
						position="relative"
						width={size.s_50}
						height={size.s_50}
						backgroundColor={'transparent'}
						borderRadius={size.s_30}
					></Block>
					<Block flexDirection="column" flex={1}>
						<TouchableOpacity style={styles.btnJoinVoice} onPress={handleJoinVoice}>
							<Text style={styles.textBtnJoinVoice}>{t('joinChannelVoiceBS.joinVoice')}</Text>
						</TouchableOpacity>
					</Block>
					<TouchableOpacity onPress={handleShowChat}>
						<Block
							justifyContent="center"
							alignItems="center"
							position="relative"
							width={size.s_50}
							height={size.s_50}
							backgroundColor={themeValue.badgeHighlight}
							borderRadius={size.s_30}
						>
							<Icons.ChatIcon />
						</Block>
					</TouchableOpacity>
				</Block>
			</Block>
			<InviteToChannel isUnknownChannel={false} ref={bottomSheetInviteRef} />
		</Block>
	);
}

export default React.forwardRef(JoinChannelVoiceBS);
