import { AudioSession, LiveKitRoom, TrackReference } from '@livekit/react-native';
import { size, useTheme } from '@mezon/mobile-ui';
import { selectChannelById2 } from '@mezon/store-mobile';
import React, { useEffect, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import MezonIconCDN from '../../../../../componentUI/MezonIconCDN';
import StatusBarHeight from '../../../../../components/StatusBarHeight/StatusBarHeight';
import { IconCDN } from '../../../../../constants/icon_cdn';
import RoomView from './RoomView';
import { style } from './styles';

const { width, height } = Dimensions.get('window');

function ChannelVoice({
	channelId,
	clanId,
	token,
	serverUrl,
	onPressMinimizeRoom,
	isAnimationComplete
}: {
	channelId: string;
	clanId: string;
	onPressMinimizeRoom?: () => void;
	token: string;
	serverUrl: string;
	isAnimationComplete: boolean;
}) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const channel = useSelector((state) => selectChannelById2(state, channelId));
	const [focusedScreenShare, setFocusedScreenShare] = useState<TrackReference | null>(null);

	useEffect(() => {
		const start = async () => {
			await AudioSession.startAudioSession();
		};

		start();
		return () => {
			AudioSession.stopAudioSession();
		};
	}, []);

	return (
		<View>
			<StatusBarHeight />
			<View
				style={{
					width: isAnimationComplete ? width : size.s_100 * 2,
					height: isAnimationComplete ? height : size.s_150,
					backgroundColor: themeValue?.primary
				}}
			>
				{isAnimationComplete && !focusedScreenShare && (
					<View style={[styles.menuHeader]}>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: size.s_20, flexGrow: 1, flexShrink: 1 }}>
							<TouchableOpacity
								onPress={() => {
									onPressMinimizeRoom();
								}}
								style={styles.buttonCircle}
							>
								<MezonIconCDN icon={IconCDN.chevronDownSmallIcon} />
							</TouchableOpacity>
							<Text numberOfLines={1} style={[styles.text, { flexGrow: 1, flexShrink: 1 }]}>
								{channel?.channel_label}
							</Text>
						</View>
					</View>
				)}
				<LiveKitRoom serverUrl={serverUrl} token={token} connect={true}>
					<RoomView
						channelId={channelId}
						clanId={clanId}
						onPressMinimizeRoom={onPressMinimizeRoom}
						isAnimationComplete={isAnimationComplete}
						onFocusedScreenChange={setFocusedScreenShare}
					/>
				</LiveKitRoom>
			</View>
		</View>
	);
}

export default React.memo(ChannelVoice);
