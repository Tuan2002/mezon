import { Icons } from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import { ChannelsEntity, selectAllChannelsFavorite } from '@mezon/store-mobile';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { ChannelFavoriteItem } from './ChannelFavoriteItem';
import { style } from './styles';

export const ChannelListFavorite = React.memo(
	({ onPress, onPressCollapse }: { onPress?: (channel: ChannelsEntity) => void; onPressCollapse: () => void }) => {
		const channelFavorites = useSelector(selectAllChannelsFavorite);
		const { themeValue } = useTheme();
		const [isCollapse, setIsCollapse] = useState<boolean>(false);
		const styles = style(themeValue);
		const { t } = useTranslation('channelMenu');
		const handleCollapse = () => {
			onPressCollapse();
			setIsCollapse(!isCollapse);
		};
		return (
			<Block width={'100%'} paddingHorizontal={size.s_8} paddingVertical={size.s_10}>
				<TouchableOpacity onPress={handleCollapse} style={styles.categoryItem}>
					<Icons.ChevronSmallDownIcon
						width={size.s_20}
						height={size.s_20}
						color={themeValue.text}
						style={[isCollapse && { transform: [{ rotate: '-90deg' }] }]}
					/>
					<Text style={styles.categoryItemTitle}>{t('favoriteChannel')}</Text>
				</TouchableOpacity>
				<Block display={isCollapse ? 'none' : 'flex'}>
					{channelFavorites?.length
						? channelFavorites?.map((channelId: string) => <ChannelFavoriteItem onPress={onPress} channelId={channelId} />)
						: null}
				</Block>
			</Block>
		);
	}
);
