import { Icons } from '@mezon/mobile-components';
import { baseColor, Block, size } from '@mezon/mobile-ui';
import { selectChannelById, selectEventByChannelId, useAppSelector } from '@mezon/store-mobile';
import { EEventStatus } from '@mezon/utils';
import { memo } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { linkGoogleMeet } from '../../../../../../utils/helpers';

type EventBadgeProps = {
	channelId: string;
};
export const EventBadge = memo(({ channelId }: EventBadgeProps) => {
	const events = useAppSelector((state) => selectEventByChannelId(state, channelId ?? ''));
	const channelVoice = useAppSelector((state) => selectChannelById(state, events?.[0]?.channel_voice_id ?? ''));
	const colorStatusEvent = events?.[0]?.event_status === EEventStatus.UPCOMING ? baseColor.blurple : baseColor.bgSuccess;

	const hanleEventChannel = async () => {
		if (events?.[0] && events?.[0]?.channel_voice_id && channelVoice?.meeting_code) {
			const urlVoice = `${linkGoogleMeet}${channelVoice?.meeting_code}`;
			await Linking.openURL(urlVoice);
		}
	};

	if (events?.length && (events?.[0]?.event_status === EEventStatus.UPCOMING || events?.[0]?.event_status === EEventStatus.ONGOING)) {
		return (
			<Block marginLeft={size.s_8}>
				<Pressable onPress={hanleEventChannel}>
					<Icons.CalendarIcon height={size.s_16} width={size.s_16} color={colorStatusEvent} />
				</Pressable>
			</Block>
		);
	}
	return <View />;
});
