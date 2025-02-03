import { useCategory } from '@mezon/core';
import { useTheme } from '@mezon/mobile-ui';
import { selectIsShowEmptyCategory } from '@mezon/store-mobile';
import React, { useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
// import BackNativeListener from './BackNativeListener';
import ChannelList from './ChannelList';
import ProfileBar from './ProfileBar';
import ServerList from './ServerList';
import UserEmptyClan from './UserEmptyClan';
import { style } from './styles';

const ChannelListWrapper = React.memo(() => {
	const { categorizedChannels: categorizedChannelsRaw } = useCategory();
	const isShowEmptyCategory = useSelector(selectIsShowEmptyCategory);
	const previousCategorizedChannels = useRef(null);

	const categorizedChannels = useMemo(() => {
		if (!categorizedChannelsRaw?.length && !!previousCategorizedChannels?.current) {
			return previousCategorizedChannels?.current;
		}
		const dataFormat = categorizedChannelsRaw.map((item) => {
			if (!isShowEmptyCategory && item?.channels?.length === 0) {
				return null;
			}
			return item;
		});
		previousCategorizedChannels.current = dataFormat;
		return dataFormat;
	}, [categorizedChannelsRaw, isShowEmptyCategory]);

	return (
		<>
			<UserEmptyClan />
			<MemoizedChannelList categorizedChannels={categorizedChannels} />
		</>
	);
});

const MemoizedChannelList = React.memo(ChannelList, (prevProps, nextProps) => {
	return JSON.stringify(prevProps.categorizedChannels) === JSON.stringify(nextProps.categorizedChannels);
});

const ServerAndChannelList = React.memo(({ isTablet }: { isTablet?: boolean }) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);

	return (
		<View style={[styles.containerDrawerContent, { backgroundColor: isTablet ? themeValue.tertiary : themeValue.primary }]}>
			<View style={styles.container}>
				<View style={styles.rowContainer}>
					<ServerList />
					{/*{!isTablet && <BackNativeListener />}*/}
					<ChannelListWrapper />
				</View>
				{isTablet && <ProfileBar />}
			</View>
			{isTablet && <View style={styles.wall}></View>}
		</View>
	);
});

export default ServerAndChannelList;
