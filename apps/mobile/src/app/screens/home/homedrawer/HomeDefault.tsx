<<<<<<< HEAD
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HashSignIcon from '../../../../assets/svg/channelText.svg';
import SearchLogo from '../../../../assets/svg/discoverySearch.svg'
import UsersLogo from '../../../../assets/svg/users.svg'
import BarsLogo from '../../../../assets/svg/bars.svg'
import ChatBox from "./ChatBox";
import WelcomeMessage from "./WelcomeMessage";
import MessageBox from "./MessageBox";
import { styles } from "./styles";
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { useRef } from "react";
import { useMemo } from "react";
import { useCallback } from "react";
import { HEIGHT } from "../../../constants/config";
import OptionBox from "./OptionBox";

const HomeDefault = React.memo((props: any) => {
    const messages = [{ "channelId": 1, "datetime": "4/25/2024, 10:47:00 PM", "message": "ssssss", "serverId": 1, "user_details": { "id": 1, "image": "https://unsplash.it/400/400?image=1", "name": "Paulos", "user_name": "paulos_ab" } }, { "channelId": 1, "datetime": "4/25/2024, 10:47:02 PM", "message": "sssss", "serverId": 1, "user_details": { "id": 1, "image": "https://unsplash.it/400/400?image=1", "name": "Paulos", "user_name": "paulos_ab" } }, { "channelId": 1, "datetime": "4/25/2024, 10:47:04 PM", "message": "ssss", "serverId": 1, "user_details": { "id": 1, "image": "https://unsplash.it/400/400?image=1", "name": "Paulos", "user_name": "paulos_ab" } }, { "channelId": 2, "datetime": "4/25/2024, 10:48:22 PM", "message": "hello", "serverId": 1, "user_details": { "id": 1, "image": "https://unsplash.it/400/400?image=1", "name": "Paulos", "user_name": "paulos_ab" } }, { "channelId": 2, "datetime": "4/25/2024, 10:48:25 PM", "message": "hi", "serverId": 1, "user_details": { "id": 1, "image": "https://unsplash.it/400/400?image=1", "name": "Paulos", "user_name": "paulos_ab" } }]
=======
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import BarsLogo from '../../../../assets/svg/bars-white.svg';
import HashSignIcon from '../../../../assets/svg/channelText-white.svg';
import SearchLogo from '../../../../assets/svg/discoverySearch-white.svg';
import ChatBox from './ChatBox';
import MessageBox from './MessageBox';
import WelcomeMessage from './WelcomeMessage';
import { styles } from './styles';

const HomeDefault = React.memo((props: any) => {
	const messages = [
		{
			channelId: 1,
			datetime: '4/25/2024, 10:47:00 PM',
			message: 'ssssss',
			serverId: 1,
			user_details: { id: 1, image: 'https://unsplash.it/400/400?image=1', name: 'Paulos', user_name: 'paulos_ab' },
		},
		{
			channelId: 1,
			datetime: '4/25/2024, 10:47:02 PM',
			message: 'sssss',
			serverId: 1,
			user_details: { id: 1, image: 'https://unsplash.it/400/400?image=1', name: 'Paulos', user_name: 'paulos_ab' },
		},
		{
			channelId: 1,
			datetime: '4/25/2024, 10:47:04 PM',
			message: 'ssss',
			serverId: 1,
			user_details: { id: 1, image: 'https://unsplash.it/400/400?image=1', name: 'Paulos', user_name: 'paulos_ab' },
		},
		{
			channelId: 2,
			datetime: '4/25/2024, 10:48:22 PM',
			message: 'hello',
			serverId: 1,
			user_details: { id: 1, image: 'https://unsplash.it/400/400?image=1', name: 'Paulos', user_name: 'paulos_ab' },
		},
		{
			channelId: 2,
			datetime: '4/25/2024, 10:48:25 PM',
			message: 'hi',
			serverId: 1,
			user_details: { id: 1, image: 'https://unsplash.it/400/400?image=1', name: 'Paulos', user_name: 'paulos_ab' },
		},
	];
>>>>>>> 6a65afff118dc3638f31f5b2701f418f515d7819

	return (
		<View style={[styles.homeDefault]}>
			<HomeDefaultHeader navigation={props.navigation} channelTitle={'notes-resources'} />

<<<<<<< HEAD
            <View style={{ flex: 1 }}>
                <FlatList
                    data={[{}]}
                    contentContainerStyle={styles.listChannels}
                    renderItem={() =>
                        <>
                            <WelcomeMessage uri={''} channelTitle={'notes-resources'} serverId={1} />
                            {
                                messages.filter(message => message.channelId == 2 && message.serverId == 1).map(message =>
                                    <MessageBox data={message} />
                                )
                            }
                        </>
                    }
                />
            </View>
=======
			<View style={{ flex: 1 }}>
				<FlatList
					data={[{}]}
					contentContainerStyle={styles.listChannels}
					renderItem={() => (
						<>
							<WelcomeMessage uri={''} channelTitle={'notes-resources'} serverId={1} />
							{messages
								.filter((message) => message.channelId == 2 && message.serverId == 1)
								.map((message) => (
									<MessageBox data={message} />
								))}
						</>
					)}
				/>
			</View>
>>>>>>> 6a65afff118dc3638f31f5b2701f418f515d7819

			<ChatBox channelTitle={'notes-resources'} channelId={2} serverId={1} />
		</View>
	);
});

const HomeDefaultHeader = React.memo(({ navigation, channelTitle }: { navigation: any; channelTitle: string }) => {
<<<<<<< HEAD
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    // variables
    const snapPoints = useMemo(() => ['25%', '50%'], []);

    // callbacks
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);
    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);
    const Options = [
        {
            'idOption': 1,
            'name': 'Search',
            'icon': 'search'
        },
        {
            'idOption': 2,
            'name': 'Threads',
            "icon": 'threade'
        },
        {
            'idOption': 3,
            'name': 'Mute',
            "icon": 'threade'
        }, {
            'idOption': 4,
            'name': 'Settings',
            "icon": 'threade'
        },
    ]
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: .5, borderBottomColor: 'lightgray', backgroundColor: '#171717' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ marginLeft: 14, marginRight: 8 }} onTouchEnd={() => navigation.openDrawer()}>
                    <BarsLogo width={20} height={20} />
                </View>
                <TouchableOpacity onPress={handlePresentModalPress} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 14 }}>
                    <HashSignIcon width={18} height={18} />
                    <Text style={{ color: '#FFFFFF', fontFamily: 'bold', marginLeft: 10, fontSize: 16 }}>
                        {channelTitle}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', paddingRight: 20 }}>
                <SearchLogo width={22} height={22} style={{ marginRight: 20 }} />
                <UsersLogo width={22} height={22} />
            </View>
            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={0}
                snapPoints={['90%']}
                onChange={handleSheetChanges}
            >
                <BottomSheetView style={{ backgroundColor: '#171717', width: '100%', height: HEIGHT }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}># {channelTitle}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        {Options.map(option =>
                            <OptionBox data={option} key={option.idOption} />
                        )}
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
        </View>
    )
=======
	return (
		<View
			style={styles.homeDefaultHeader}
		>
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<View style={{ marginLeft: 14, marginRight: 8 }} onTouchEnd={() => navigation.openDrawer()}>
					<BarsLogo width={20} height={20} />
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 14 }}>
					<HashSignIcon width={18} height={18} />
					<Text style={{ color: '#FFFFFF', fontFamily: 'bold', marginLeft: 10, fontSize: 16 }}>{channelTitle}</Text>
				</View>
			</View>
      <SearchLogo width={22} height={22} style={{ marginRight: 20 }} />
		</View>
	);
>>>>>>> 6a65afff118dc3638f31f5b2701f418f515d7819
});

export default HomeDefault;
