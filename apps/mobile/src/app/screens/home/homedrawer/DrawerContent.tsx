import { useCategory } from '@mezon/core';
import { cleanChannelData } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { RootState, selectAllClans } from '@mezon/store-mobile';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import ChannelList from './ChannelList';
import ServerList from './ServerList';
import UserEmptyClan from './UserEmptyClan';
import { style } from './styles';

const ChannelListWrapper = React.memo(() => {
	const clans = useSelector(selectAllClans);
	const clansLoadingStatus = useSelector((state: RootState) => state?.clans?.loadingStatus);
	const { categorizedChannels: categorizedChannelsRaw } = useCategory();
	const categorizedChannels = useMemo(() => {
		return categorizedChannelsRaw.map((item) => {
			return {
				...item,
				channels: cleanChannelData(item.channels),
			};
		});
	}, [categorizedChannelsRaw]);
	
	return (
		<>
			{clansLoadingStatus === 'loaded' && !clans?.length ? <UserEmptyClan /> : <MemoizedChannelList categorizedChannels={categorizedChannels} />}
		</>
	);
});

const MemoizedChannelList = React.memo(ChannelList, (prevProps, nextProps) => {
	return JSON.stringify(prevProps.categorizedChannels) === JSON.stringify(nextProps.categorizedChannels);
});

const DrawerContent = React.memo(() => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);

	return (
		<View style={[styles.containerDrawerContent, { backgroundColor: themeValue.primary }]}>
			<ServerList />
			<ChannelListWrapper />
		</View>
	);
});

export default DrawerContent;
