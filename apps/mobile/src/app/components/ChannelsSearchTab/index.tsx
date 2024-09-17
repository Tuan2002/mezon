import {
	ActionEmitEvent,
	ChannelTypeHeader,
	STORAGE_CHANNEL_CURRENT_CACHE,
	STORAGE_DATA_CLAN_CHANNEL_CACHE,
	getUpdateOrAddClanChannelCache,
	load,
	save
} from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import { channelsActions, getStoreAsync } from '@mezon/store-mobile';
import { ChannelThreads } from '@mezon/utils';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { ChannelType } from 'mezon-js';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceEventEmitter, FlatList, Keyboard, Linking, Text, View } from 'react-native';
import { StatusVoiceChannel } from '../../screens/home/homedrawer/components/ChannelList/ChannelListItem';
import { linkGoogleMeet } from '../../utils/helpers';
import ChannelItem from '../ChannelItem';
import EmptySearchPage from '../EmptySearchPage';
import style from './ChannelsSearchTab.styles';

type ChannelsSearchTabProps = {
	listChannelSearch: ChannelThreads[];
};
const ChannelsSearchTab = ({ listChannelSearch }: ChannelsSearchTabProps) => {
	const { t } = useTranslation(['searchMessageChannel']);
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const timeoutRef = useRef<any>();
	const navigation = useNavigation<any>();
	const listVoiceChannel = useMemo(
		() => listChannelSearch?.filter((channel) => channel?.type === ChannelType.CHANNEL_TYPE_VOICE),
		[listChannelSearch]
	);
	const listTextChannelAndThreads = useMemo(
		() =>
			listChannelSearch
				?.flatMap((channel) => [channel, ...(channel?.threads || [])])
				?.filter((channel) => channel?.type === ChannelType.CHANNEL_TYPE_TEXT),
		[listChannelSearch]
	);
	const combinedListChannel = useMemo(() => {
		const textChannels = listTextChannelAndThreads?.map((channel) => ({
			...channel
		}));
		const voiceChannels = listVoiceChannel?.map((channel) => ({
			...channel
		}));

		return [
			{ title: t('textChannels'), type: ChannelTypeHeader },
			...textChannels,
			{ title: t('voiceChannels'), type: ChannelTypeHeader },
			...voiceChannels
		];
	}, [listTextChannelAndThreads, listVoiceChannel]);

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
			const dataSave = getUpdateOrAddClanChannelCache(clanId, channelId);
			save(STORAGE_DATA_CLAN_CHANNEL_CACHE, dataSave);
			const channelsCache = load(STORAGE_CHANNEL_CURRENT_CACHE) || [];
			if (!channelsCache?.includes(channelId)) {
				save(STORAGE_CHANNEL_CURRENT_CACHE, [...channelsCache, channelId]);
			}
			timeoutRef.current = setTimeout(async () => {
				requestAnimationFrame(async () => {
					await store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false }));
					DeviceEventEmitter.emit(ActionEmitEvent.SCROLL_TO_ACTIVE_CHANNEL, { channelId: channelId, categoryId: channelData?.category_id });
				});
			}, 0);
		}
	};

	const renderItem = ({ item }) => {
		if (item?.type === ChannelTypeHeader) {
			return <Text style={styles.title}>{item.title}</Text>;
		}
		return <ChannelItem onPress={handleRouteData} channelData={item} key={item?.id} />;
	};

	return (
		<View style={styles.container}>
			{listChannelSearch?.length > 0 ? (
				<Block paddingBottom={size.s_100}>
					<FlatList
						data={combinedListChannel}
						renderItem={renderItem}
						keyExtractor={(item) => (item?.id ? item?.id.toString() : item.title)}
						onScrollBeginDrag={Keyboard.dismiss}
						keyboardShouldPersistTaps={'handled'}
						contentContainerStyle={{ paddingBottom: size.s_50 }}
						showsVerticalScrollIndicator={false}
						removeClippedSubviews={true}
					/>
				</Block>
			) : (
				<EmptySearchPage />
			)}
		</View>
	);
};

export default ChannelsSearchTab;
