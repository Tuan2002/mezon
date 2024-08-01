import { Block } from '@mezon/mobile-ui';
import { ChannelThreads } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { useMemo, useRef } from 'react';
import { Linking, ScrollView, Text } from 'react-native';
import ChannelItem from '../ChannelItem';
import EmptySearchPage from '../EmptySearchPage';
import styles from './ChannelsSearchTab.styles';
import { useTranslation } from 'react-i18next';
import { StatusVoiceChannel } from '../../screens/home/homedrawer/components/ChannelList/ChannelListItem';
import { linkGoogleMeet } from '../../utils/helpers';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { channelsActions, getStoreAsync } from '@mezon/store-mobile';
import { getUpdateOrAddClanChannelCache, load, save, STORAGE_CHANNEL_CURRENT_CACHE, STORAGE_DATA_CLAN_CHANNEL_CACHE } from '@mezon/mobile-components';

type ChannelsSearchTabProps = {
	listChannelSearch: ChannelThreads[];
};
const ChannelsSearchTab = ({ listChannelSearch }: ChannelsSearchTabProps) => {
  const { t } = useTranslation(['searchMessageChannel']);
  const timeoutRef = useRef<any>();
	const navigation = useNavigation<any>();
	const listVoiceChannel = useMemo(
		() => listChannelSearch?.filter((channel) => channel?.type === ChannelType.CHANNEL_TYPE_VOICE),
		[listChannelSearch],
	);
	const listTextChannelAndThreads = useMemo(
		() =>
			listChannelSearch
				?.flatMap((channel) => [channel, ...(channel?.threads || [])])
				?.filter((channel) => channel?.type === ChannelType.CHANNEL_TYPE_TEXT),
		[listChannelSearch],
	);

  const handleRouteData = async (channelData: ChannelThreads) => {
		if (channelData?.type === ChannelType.CHANNEL_TYPE_VOICE) {
			if (channelData?.status === StatusVoiceChannel.Active && channelData?.meeting_code) {
				const urlVoice = `${linkGoogleMeet}${channelData?.meeting_code}`;
				await Linking.openURL(urlVoice);
				return;
			}
		} else {
		  navigation.navigate('HomeDefault');
			navigation.dispatch(DrawerActions.closeDrawer());
			const store = await getStoreAsync();
			const channelId = channelData?.channel_id;
			const clanId = channelData?.clan_id;
			timeoutRef.current = setTimeout(() => {
				const dataSave = getUpdateOrAddClanChannelCache(clanId, channelId);
				store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false }));
				save(STORAGE_DATA_CLAN_CHANNEL_CACHE, dataSave);
				const channelsCache = load(STORAGE_CHANNEL_CURRENT_CACHE) || [];
				if (!channelsCache?.includes(channelId)) {
					save(STORAGE_CHANNEL_CURRENT_CACHE, [...channelsCache, channelId]);
				}
			}, 0);
		}
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			{(listChannelSearch?.length > 0) ? (
				<>
					<Block>
						{(listTextChannelAndThreads?.length > 0) ? (
							<Block>
								<Text style={styles.title}>{t('textChannels')}</Text>
								{listTextChannelAndThreads?.map((channel) => (
									<ChannelItem  onPress={handleRouteData} channelData={channel} key={channel?.id} />
								))}
							</Block>
						) : null}
					</Block>
					<Block>
						{(listVoiceChannel?.length > 0) ? (
							<Block>
								<Text style={styles.title}>{t('voiceChannels')}</Text>
								{listVoiceChannel?.map((channel) => (
									<ChannelItem onPress={handleRouteData} channelData={channel} key={channel?.id} />
								))}
							</Block>
						) : null}
					</Block>
				</>
			) : (
				<EmptySearchPage />
			)}
		</ScrollView>
	);
};

export default ChannelsSearchTab;
