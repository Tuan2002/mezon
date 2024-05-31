import { useAppNavigation, useAppParams, useMessageValue } from '@mezon/core';
import { selectChannelById } from '@mezon/store';
import { ChannelType } from 'mezon-js';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Icons } from '../../components';

type ChannelHashtagProps = {
	channelHastagId: string;
};

const ChannelHashtag = ({ channelHastagId }: ChannelHashtagProps) => {
	const { clanId } = useAppParams();
	const { toChannelPage } = useAppNavigation();
	const { currentChannelId } = useMessageValue();
	const [channelFound, setChannelFound] = useState();
	const getChannelById = (channelHastagId: string) => {
		const channel = useSelector(selectChannelById(channelHastagId));
		return channel;
	};

	const getChannelPath = (channelHastagId: string, clanId: string): string | undefined => {
		if (channelHastagId.startsWith('#')) {
			return toChannelPage(channelHastagId.slice(1), clanId || '');
		}
		return undefined;
	};
	const [channelPath, setChannelPath] = useState(getChannelPath(channelHastagId, clanId ?? ''));

	const channel = getChannelById(channelHastagId.slice(1));

	useEffect(() => {
		if (channel?.type === ChannelType.CHANNEL_TYPE_VOICE) {
			setChannelPath(getChannelPath('#' + currentChannelId || '', clanId ?? ''));
		} else {
			setChannelPath(getChannelPath(channelHastagId, clanId ?? ''));
		}
	}, [channel, currentChannelId, clanId, channelHastagId]);

	const handleClick = useCallback(() => {
		if (channel.type === ChannelType.CHANNEL_TYPE_VOICE) {
			const urlVoice = `https://meet.google.com/${channel.meeting_code}`;
			window.open(urlVoice, '_blank', 'noreferrer');
		}
	}, [channel]);

	return channelPath && getChannelById(channelHastagId.slice(1)) ? (
		<Link
			onClick={handleClick}
			style={{ textDecoration: 'none' }}
			to={channelPath}
			className="font-medium px-1 rounded-sm cursor-pointer inline whitespace-nowrap !text-[#3297ff] hover:!text-white dark:bg-[#3C4270] bg-[#D1E0FF] hover:bg-[#5865F2]"
		>
			{channel.type === ChannelType.CHANNEL_TYPE_VOICE ? (
				<Icons.Speaker defaultSize="inline mt-[-0.2rem] w-4 h-4 mr-0.5" defaultFill='#3297FF' />
			) : (
				<Icons.Hashtag defaultSize="inline-block mt-[-0.4rem] w-4 h-4 " defaultFill='#3297FF' />
			)}
			{channel.channel_label}
		</Link>
	) : (
		<span>{channelHastagId}</span>
	);
};

export default ChannelHashtag;
