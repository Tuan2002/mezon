import { ChannelsEntity } from '@mezon/store';
import { ChannelStreamMode, ChannelType, HashtagDm } from 'mezon-js';

type IChannelHashtag = {
	channelHashtagId: string;
	directMessageId?: string;
	hashtagDmEntities: Record<string, HashtagDm>;
	channelsEntities: Record<string, ChannelsEntity>;
	mode?: number;
};
export const ChannelHashtag = ({ channelHashtagId, directMessageId, mode, hashtagDmEntities, channelsEntities }: IChannelHashtag) => {
	const getChannelById = (channelHashtagId: string): ChannelsEntity => {
		let channel;
		if (directMessageId && [ChannelStreamMode.STREAM_MODE_DM].includes(mode)) {
			channel = hashtagDmEntities[channelHashtagId];
		} else {
			channel = channelsEntities[channelHashtagId];
		}
		if (channel) {
			return channel;
		}

		return {
			id: channelHashtagId,
			channel_label: 'unknown'
		};
	};

	const channel = getChannelById(channelHashtagId);

	const dataPress = `${channel.type}_${channel.channel_id}_${channel.clan_id}_${channel.status}_${channel.meeting_code}`;

	if (channel.type === ChannelType.CHANNEL_TYPE_VOICE) {
		return `[${channel.channel_label}](##voice${JSON.stringify(dataPress)})`;
	}
	return channel['channel_id']
		? `[#${channel.channel_label}](#${JSON.stringify(dataPress)})`
		: `[\\# ${channel.channel_label}](#${JSON.stringify(dataPress)})`;
};
