import { useTheme } from '@mezon/mobile-ui';
import { categoriesActions, selectCategoryIdSortChannel, useAppDispatch } from '@mezon/store-mobile';
import { ChannelThreads, ICategoryChannel, IChannel } from '@mezon/utils';
import { memo, useCallback, useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { ChannelsPositionRef } from '../../../ChannelList';
import { ChannelListItem } from '../ChannelListItem';
import ChannelListSectionHeader from '../ChannelListSectionHeader';
import { style } from './styles';

interface IChannelListSectionProps {
	data: ICategoryChannel;
	onLongPressCategory: (channel: ICategoryChannel) => void;
	onLongPressChannel: (channel: ChannelThreads) => void;
	onLongPressThread: (thread: ChannelThreads) => void;
	channelsPositionRef: ChannelsPositionRef;
}
const ChannelListSection = memo(
	({ data, onLongPressCategory, onLongPressChannel, onLongPressThread, channelsPositionRef }: IChannelListSectionProps) => {
		const styles = style(useTheme().themeValue);
		const [isCollapsed, setIsCollapsed] = useState(false);
		const categoryIdSortChannel = useSelector(selectCategoryIdSortChannel);
		const dispatch = useAppDispatch();

		const handleOnPressSortChannel = useCallback(() => {
			dispatch(
				categoriesActions.setCategoryIdSortChannel({
					isSortChannelByCategoryId: !categoryIdSortChannel[data?.category_id],
					categoryId: data?.category_id
				})
			);
		}, [categoryIdSortChannel, dispatch]);

		const toggleCollapse = useCallback(() => {
			setIsCollapsed(!isCollapsed);
		}, [isCollapsed, setIsCollapsed]);

		const onLongPressHeader = useCallback(() => {
			onLongPressCategory(data);
		}, [data, onLongPressCategory]);

		if (!data?.category_name?.trim()) {
			return;
		}

		const handlePositionChannel = (item, event) => {
			const { y } = event.nativeEvent.layout;
			channelsPositionRef.current = {
				...channelsPositionRef.current,
				[`${item.id}`]: y
			};
		};

		return (
			<View style={styles.channelListSection}>
				<ChannelListSectionHeader
					title={data.category_name}
					onPress={toggleCollapse}
					onLongPress={onLongPressHeader}
					onPressSortChannel={handleOnPressSortChannel}
					isCollapsed={isCollapsed}
				/>

				<View style={{ display: isCollapsed ? 'none' : 'flex' }}>
					{data.channels?.map((item: IChannel, index: number) => {
						return (
							<View key={`${item?.id}`} onLayout={(event) => handlePositionChannel(item, event)}>
								<ChannelListItem
									data={item}
									key={`${item.id}_channel_item` + index}
									onLongPress={() => {
										onLongPressChannel(item);
									}}
									onLongPressThread={onLongPressThread}
								/>
							</View>
						);
					})}
				</View>
			</View>
		);
	}
);
export default ChannelListSection;
