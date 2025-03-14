import { useBottomSheetModal } from '@gorhom/bottom-sheet';
import {
	ActionEmitEvent,
	STORAGE_DATA_CLAN_CHANNEL_CACHE,
	changeClan,
	getUpdateOrAddClanChannelCache,
	jumpToChannel,
	save
} from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import { selectCurrentClanId } from '@mezon/store-mobile';
import { IChannel } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { ChannelType } from 'mezon-js';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceEventEmitter, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import MezonIconCDN from '../../../../../../componentUI/MezonIconCDN';
import { IconCDN } from '../../../../../../constants/icon_cdn';
import { APP_SCREEN } from '../../../../../../navigation/ScreenTypes';
import InviteToChannel from '../../InviteToChannel';
import { style } from './JoinChannelVoiceBS.styles';
function JoinChannelVoiceBS({ channel }: { channel: IChannel }) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { dismiss } = useBottomSheetModal();
	const { t } = useTranslation(['channelVoice']);
	const currentClanId = useSelector(selectCurrentClanId);
	const handleJoinVoice = async () => {
		if (!channel.meeting_code) return;
		const data = {
			channelId: channel?.channel_id || '',
			roomName: channel?.meeting_code,
			clanId: currentClanId
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
		<View style={{ width: '100%', paddingVertical: size.s_10, paddingHorizontal: size.s_10 }}>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexGrow: 1, flexShrink: 1 }}>
					<TouchableOpacity
						onPress={() => {
							DeviceEventEmitter.emit(ActionEmitEvent.ON_TRIGGER_BOTTOM_SHEET, { isDismiss: true });
						}}
						style={styles.buttonCircle}
					>
						<MezonIconCDN icon={IconCDN.chevronDownSmallIcon} />
					</TouchableOpacity>
					<Text numberOfLines={2} style={[styles.text, { flexGrow: 1, flexShrink: 1 }]}>
						{channel?.channel_label}
					</Text>
				</View>
				<TouchableOpacity
					onPress={() => {
						const data = {
							snapPoints: ['70%', '90%'],
							children: <InviteToChannel isUnknownChannel={false} channelId={channel?.channel_id} />
						};
						DeviceEventEmitter.emit(ActionEmitEvent.ON_TRIGGER_BOTTOM_SHEET, { isDismiss: false, data });
					}}
					style={{
						backgroundColor: themeValue.tertiary,
						padding: size.s_8,
						borderRadius: size.s_22
					}}
				>
					<MezonIconCDN icon={IconCDN.userPlusIcon} />
				</TouchableOpacity>
			</View>
			<View style={{ alignItems: 'center', gap: size.s_6, marginTop: size.s_20 }}>
				<View
					style={{
						width: size.s_100,
						height: size.s_100,
						borderRadius: size.s_50,
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: themeValue.tertiary
					}}
				>
					<MezonIconCDN icon={IconCDN.channelVoice} width={size.s_36} height={size.s_36} />
				</View>
				<Text style={styles.text}>{t('joinChannelVoiceBS.channelVoice')}</Text>
				<Text style={styles.textDisable}>{t('joinChannelVoiceBS.readyTalk')}</Text>
			</View>
			<View style={{ borderRadius: size.s_40, marginTop: size.s_20, marginBottom: size.s_10 }}>
				<View
					style={{
						gap: size.s_20,
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
						paddingHorizontal: size.s_16,
						paddingBottom: size.s_16
					}}
				>
					<View
						style={{
							justifyContent: 'center',
							alignItems: 'center',
							position: 'relative',
							width: size.s_50,
							height: size.s_50,
							backgroundColor: 'transparent',
							borderRadius: size.s_30
						}}
					></View>
					<View style={{ flexDirection: 'column', flex: 1 }}>
						<TouchableOpacity style={styles.btnJoinVoice} onPress={handleJoinVoice}>
							<Text style={styles.textBtnJoinVoice}>{t('joinChannelVoiceBS.joinVoice')}</Text>
						</TouchableOpacity>
					</View>
					<TouchableOpacity onPress={handleShowChat}>
						<View
							style={{
								justifyContent: 'center',
								alignItems: 'center',
								position: 'relative',
								width: size.s_50,
								height: size.s_50,
								backgroundColor: themeValue.border,
								borderRadius: size.s_30
							}}
						>
							<MezonIconCDN icon={IconCDN.chatIcon} />
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

export default React.memo(JoinChannelVoiceBS);
