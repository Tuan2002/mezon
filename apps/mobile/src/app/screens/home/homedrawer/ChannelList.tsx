import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useAuth, useCategory } from '@mezon/core';
import {
	CalendarIcon,
	STORAGE_KEY_CLAN_CURRENT_CACHE,
	getInfoChannelByClanId,
	getUpdateOrAddClanChannelCache,
	load,
	save,
} from '@mezon/mobile-components';
import { Colors, size, useAnimatedState } from '@mezon/mobile-ui';
import {
	appActions,
	channelsActions,
	getStoreAsync,
	messagesActions,
	selectAllEventManagement,
	selectCurrentClan,
	selectIsFromFCMMobile,
} from '@mezon/store-mobile';
import { ICategoryChannel, IChannel } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';
import EventViewer from '../../../components/Event';
import { APP_SCREEN, AppStackScreenProps } from '../../../navigation/ScreenTypes';
import { MezonBottomSheet } from '../../../temp-ui';
import { ChannelListContext, ChannelListSection } from './Reusables';
import { InviteToChannel } from './components';
import CategoryMenu from './components/CategoryMenu';
import ChannelListHeader from './components/ChannelList/ChannelListHeader';
import ClanMenu from './components/ClanMenu/ClanMenu';
import { styles } from './styles';
import { darkColor } from '../../../constants/Colors';

const ChannelList = React.memo((props: any) => {
	const currentClan = useSelector(selectCurrentClan);
	const isFromFCMMobile = useSelector(selectIsFromFCMMobile);
	const { categorizedChannels } = useCategory();

	const allEventManagement = useSelector(selectAllEventManagement);
	const bottomSheetMenuRef = useRef<BottomSheetModal>(null);
	const bottomSheetCategoryMenuRef = useRef<BottomSheetModal>(null);
	const bottomSheetEventRef = useRef<BottomSheetModal>(null);
	const bottomSheetInviteRef = useRef(null);
  const [isUnknownChannel, setIsUnKnownChannel] = useState<boolean>(false);

	const [currentPressedCategory, setCurrentPressedCategory] = useState<IChannel | ICategoryChannel>(null);
	const user = useAuth();
	const navigation = useNavigation<AppStackScreenProps['navigation']>();

	useEffect(() => {
		if (categorizedChannels?.length && !isFromFCMMobile) {
			setDefaultChannelLoader();
		}
	}, [categorizedChannels]);

	const [collapseChannelItems, setCollapseChannelItems] = useAnimatedState([]);

	const toggleCollapseChannel = (index: string) => {
		if (collapseChannelItems.includes(index)) {
			setCollapseChannelItems(collapseChannelItems.filter((item) => item !== index)); // Collapse if already Collapse
		} else {
			setCollapseChannelItems([...collapseChannelItems, index]); // Expand if not Collapse
		}
	};

	const setDefaultChannelLoader = async () => {
		const firstChannel = categorizedChannels?.[0]?.channels?.[0];

		if (categorizedChannels && !!firstChannel) {
			const data = load(STORAGE_KEY_CLAN_CURRENT_CACHE);
			const infoChannelCache = getInfoChannelByClanId(data || [], currentClan?.clan_id);
			if (infoChannelCache) {
				await jumpToChannel(infoChannelCache.channelId, infoChannelCache.clanId);
			} else {
				const channelId = firstChannel?.channel_id;
				const clanId = currentClan?.clan_id;
				const dataSave = getUpdateOrAddClanChannelCache(currentClan?.clan_id, firstChannel?.channel_id);
				save(STORAGE_KEY_CLAN_CURRENT_CACHE, dataSave);
				await jumpToChannel(channelId, clanId);
			}
		}
	};

	const jumpToChannel = async (channelId: string, clanId: string) => {
		const store = await getStoreAsync();
		store.dispatch(messagesActions.jumpToMessage({ messageId: '', channelId: channelId }));
		store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false }));
		store.dispatch(appActions.setLoadingMainMobile(false));
	};

	function handlePress() {
		bottomSheetMenuRef.current?.present();
	}

	function handleLongPressCategory(channel: IChannel | ICategoryChannel) {
		bottomSheetCategoryMenuRef.current?.present();
		setCurrentPressedCategory(channel);
    setIsUnKnownChannel(!(channel as IChannel)?.channel_id)
	}

	function handlePressEventCreate() {
		bottomSheetEventRef?.current?.dismiss();
		navigation.navigate(APP_SCREEN.MENU_CLAN.STACK, { screen: APP_SCREEN.MENU_CLAN.CREATE_EVENT });
	}

	return (
		<ChannelListContext.Provider value={{ navigation: props.navigation }}>
			<View style={[styles.mainList, { backgroundColor: Colors.secondary }]}>
				<ChannelListHeader onPress={handlePress} clan={currentClan} />
				<View style={styles.channelListSearch}>
					<View style={styles.channelListSearchWrapperInput}>
						<Feather size={18} name="search" style={{ color: Colors.tertiary }} />
						<TextInput placeholder={'Search'} placeholderTextColor={Colors.tertiary} style={styles.channelListSearchInput} />
					</View>
          <Pressable
            style={styles.inviteIconWrapper}
            onPress={
              () =>{
                setIsUnKnownChannel(false);
                bottomSheetInviteRef.current.open()
              }
            }
				  >
					<Feather size={16} name="user-plus" style={{ color: darkColor.Backgound_Subtle }} />
				</Pressable>
				<InviteToChannel isUnknownChannel={isUnknownChannel} ref={bottomSheetInviteRef} />
				</View>
				<View style={{ paddingHorizontal: size.s_12, marginBottom: size.s_18 }}>
					<TouchableOpacity
						style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}
						onPress={() => bottomSheetEventRef?.current?.present()}
					>
						<CalendarIcon height={20} width={20} />
						<Text style={{ color: 'white' }}>{`${allEventManagement.length} Events`}</Text>
					</TouchableOpacity>
				</View>
				<FlatList
					data={categorizedChannels || []}
					keyExtractor={(_, index) => index.toString()}
					renderItem={({ item, index }) => (
						<ChannelListSection
							data={item}
							index={index}
							onPressHeader={toggleCollapseChannel}
							onLongPress={(channel: IChannel | ICategoryChannel) => handleLongPressCategory(channel)}
							collapseItems={collapseChannelItems}
						/>
					)}
				/>
			</View>

			<MezonBottomSheet ref={bottomSheetMenuRef}>
				<ClanMenu clan={currentClan} inviteRef={bottomSheetInviteRef} />
			</MezonBottomSheet>

			<MezonBottomSheet ref={bottomSheetCategoryMenuRef}>
				<CategoryMenu bottomSheetRef={bottomSheetCategoryMenuRef} inviteRef={bottomSheetInviteRef} category={currentPressedCategory} />
			</MezonBottomSheet>

			<MezonBottomSheet
				title={`${allEventManagement.length} Events`}
				ref={bottomSheetEventRef}
				headerRight={
					currentClan?.creator_id === user?.userId && (
						<TouchableOpacity onPress={handlePressEventCreate}>
							<Text style={{ color: 'white' }}>Create</Text>
						</TouchableOpacity>
					)
				}
			>
				<EventViewer />
			</MezonBottomSheet>
		</ChannelListContext.Provider>
	);
});

export default ChannelList;
