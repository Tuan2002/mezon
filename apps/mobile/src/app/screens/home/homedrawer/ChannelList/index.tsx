import { useTheme } from '@mezon/mobile-ui';
import { channelsActions, selectIsShowEmptyCategory, selectListChannelRenderByClanId, voiceActions } from '@mezon/store';
import { selectCurrentClan, useAppDispatch, useAppSelector } from '@mezon/store-mobile';
import { ICategoryChannel } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { ChannelType } from 'mezon-js';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, RefreshControl, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import useTabletLandscape from '../../../../hooks/useTabletLandscape';
import { AppStackScreenProps } from '../../../../navigation/ScreenTypes';
import ChannelListBackground from '../components/ChannelList/ChannelListBackground';
import ChannelListBottomSheet from '../components/ChannelList/ChannelListBottomSheet';
import ChannelListHeader from '../components/ChannelList/ChannelListHeader';
import { ChannelListItem } from '../components/ChannelList/ChannelListItem';
import ChannelListScroll from '../components/ChannelList/ChannelListScroll';
import ChannelListSection from '../components/ChannelList/ChannelListSection';
import ButtonNewUnread from './ButtonNewUnread';
import { style } from './styles';
export type ChannelsPositionRef = {
	current: {
		[key: number]: {
			height: number;
			cateId?: string | number;
		};
	};
};

const ChannelList = () => {
	const { themeValue } = useTheme();
	const isTabletLandscape = useTabletLandscape();
	const currentClan = useSelector(selectCurrentClan);
	const isShowEmptyCategory = useSelector(selectIsShowEmptyCategory);
	const listChannelRender = useAppSelector((state) => selectListChannelRenderByClanId(state, currentClan?.clan_id));
	const [refreshing, setRefreshing] = useState(false);
	const dispatch = useAppDispatch();
	const handleRefresh = async () => {
		setRefreshing(true);

		const promise = [
			dispatch(channelsActions.fetchChannels({ clanId: currentClan?.clan_id, noCache: true, isMobile: true })),
			dispatch(
				voiceActions.fetchVoiceChannelMembers({
					clanId: currentClan?.clan_id ?? '',
					channelId: '',
					channelType: ChannelType.CHANNEL_TYPE_GMEET_VOICE || ChannelType.CHANNEL_TYPE_MEZON_VOICE
				})
			)
		];
		await Promise.all(promise);
		setRefreshing(false);
	};

	const data = useMemo(
		() => [
			{ id: 'listHeader' },
			...(listChannelRender
				? isShowEmptyCategory
					? listChannelRender
					: listChannelRender.filter(
							(item) =>
								((item as ICategoryChannel).channels && (item as ICategoryChannel).channels.length > 0) ||
								(item as ICategoryChannel).channels === undefined
						)
				: [])
		],
		[listChannelRender, isShowEmptyCategory]
	) as ICategoryChannel[];

	const styles = style(themeValue, isTabletLandscape);

	const navigation = useNavigation<AppStackScreenProps['navigation']>();
	const flashListRef = useRef(null);
	const channelsPositionRef = useRef<ChannelsPositionRef>();

	const renderItem = useCallback(({ item, index }) => {
		if (index === 0) {
			return <ChannelListHeader />;
		} else if (item.channels) {
			return <ChannelListSection channelsPositionRef={channelsPositionRef} data={item} />;
		} else {
			return (
				<View key={`${item?.id}_${item?.isFavor}_${index}_ItemChannel}`}>
					<ChannelListItem
						data={item}
						isFirstThread={item?.type === ChannelType.CHANNEL_TYPE_THREAD && data[index - 1]?.type !== ChannelType.CHANNEL_TYPE_THREAD}
					/>
				</View>
			);
		}
	}, []);

	const keyExtractor = useCallback((item, index) => item.id + item.isFavor?.toString() + index, []);
	return (
		<>
			<View style={styles.mainList}>
				<ChannelListScroll data={data} flashListRef={flashListRef} />
				<FlatList
					ref={flashListRef}
					data={data}
					renderItem={renderItem}
					keyExtractor={keyExtractor}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
					stickyHeaderIndices={[1]}
					showsVerticalScrollIndicator={true}
					initialNumToRender={10}
					maxToRenderPerBatch={10}
					windowSize={10}
					onEndReachedThreshold={0.7}
					removeClippedSubviews={Platform.OS === 'android'}
					keyboardShouldPersistTaps={'handled'}
					ListHeaderComponent={() => {
						return <ChannelListBackground />;
					}}
					onScrollToIndexFailed={(info) => {
						const wait = new Promise((resolve) => setTimeout(resolve, 200));
						if (info.highestMeasuredFrameIndex < info.index) {
							flashListRef.current?.scrollToIndex({ index: info.highestMeasuredFrameIndex, animated: true });
							wait.then(() => {
								flashListRef.current?.scrollToIndex({ index: info.index, animated: true });
							});
						}
					}}
					disableVirtualization
				/>
				<View style={{ height: 80 }} />
				<ButtonNewUnread />
			</View>

			{/* add use idle */}
			<ChannelListBottomSheet />
		</>
	);
};

export default ChannelList;
