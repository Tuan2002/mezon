import { ELoadMoreDirection } from '@mezon/chat-scroll';
import { Colors, size, useTheme } from '@mezon/mobile-ui';
import { MessagesEntity } from '@mezon/store-mobile';
import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import { FlatList } from 'react-native-gesture-handler';
import { style } from './styles';

interface IChannelListMessageProps {
	flatListRef: React.RefObject<FlatList<MessagesEntity>>;
	messages: MessagesEntity[];
	handleScroll: (event) => void;
	handleOnScroll?: (event) => void;
	renderItem: ({ item }: { item: MessagesEntity }) => React.ReactElement;
	onLoadMore: (direction: ELoadMoreDirection) => void;
	isLoadMoreTop: boolean;
	isLoadMoreBottom: boolean;
}

const ChannelListMessage = React.memo(
	({ flatListRef, messages, handleScroll, handleOnScroll, renderItem, onLoadMore, isLoadMoreTop, isLoadMoreBottom }: IChannelListMessageProps) => {
		const { themeValue } = useTheme();
		const styles = style(themeValue);

		const keyExtractor = useCallback((message) => `${message?.id}_${message?.channel_id}`, []);

		const ViewLoadMore = () => {
			return (
				<View style={styles.loadMoreChannelMessage}>
					<Flow size={size.s_30} color={Colors.tertiary} />
				</View>
			);
		};

		const isCannotLoadMore = useMemo(() => {
			const lastMessage = messages?.[messages?.length - 1];

			return lastMessage?.sender_id === '0' && !lastMessage?.content?.t && lastMessage?.username?.toLowerCase() === 'system';
		}, [messages]);

		const handleEndReached = () => {
			if (messages?.length && !isCannotLoadMore) {
				onLoadMore(ELoadMoreDirection.top);
			}
		};
		return (
			<FlatList
				data={messages}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				inverted={true}
				showsVerticalScrollIndicator={true}
				contentContainerStyle={styles.listChannels}
				initialNumToRender={10}
				maxToRenderPerBatch={10}
				windowSize={10}
				onEndReachedThreshold={0.7}
				maintainVisibleContentPosition={{
					minIndexForVisible: 0,
					autoscrollToTopThreshold: 10
				}}
				ref={flatListRef}
				// overrideProps={{ isInvertedVirtualizedList: true }}
				onMomentumScrollEnd={handleScroll}
				onScroll={handleOnScroll}
				keyboardShouldPersistTaps={'handled'}
				// removeClippedSubviews={false}
				// decelerationRate={'fast'}
				// updateCellsBatchingPeriod={100}
				onEndReached={handleEndReached}
				// scrollEventThrottle={16}
				// estimatedItemSize={220}
				viewabilityConfig={{
					minimumViewTime: 0,
					viewAreaCoveragePercentThreshold: 0,
					itemVisiblePercentThreshold: 0,
					waitForInteraction: false
				}}
				contentInsetAdjustmentBehavior="automatic"
				ListHeaderComponent={isLoadMoreBottom && !isCannotLoadMore ? <ViewLoadMore /> : null}
				ListFooterComponent={isLoadMoreTop && !isCannotLoadMore ? <ViewLoadMore /> : null}
				onScrollToIndexFailed={(info) => {
					const wait = new Promise((resolve) => setTimeout(resolve, 200));
					if (info?.highestMeasuredFrameIndex < info?.index && info?.index <= messages?.length) {
						flatListRef.current?.scrollToIndex({ index: info.highestMeasuredFrameIndex, animated: true });
						wait.then(() => {
							flatListRef.current?.scrollToIndex({ index: info?.index, animated: true });
						});
					}
				}}
				disableVirtualization
			/>
		);
	}
);
export default ChannelListMessage;
