import { useAuth, useChatMessages, useSeenMessagePool } from '@mezon/core';
import { IUserStatus, Icons } from '@mezon/mobile-components';
import { size } from '@mezon/mobile-ui';
import {
	MessagesEntity,
	directActions,
	gifsStickerEmojiActions,
	selectDmGroupCurrent,
	selectIsUnreadDMById,
	useAppDispatch,
	useAppSelector
} from '@mezon/store-mobile';
import { SubPanelName, createImgproxyUrl } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import React, { useEffect, useRef } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import { UserStatus } from '../../../components/UserStatus';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';

interface HeaderProps {
	handleBack: () => void;
	navigateToThreadDetail: () => void;
	isTypeDMGroup: boolean;
	dmAvatar: string | null;
	dmLabel: string;
	userStatus: IUserStatus;
	styles: any;
	themeValue: any;
	directMessageId: string;
	firstUserId: string;
}

function useChannelSeen(channelId: string) {
	const dispatch = useAppDispatch();
	const { lastMessage } = useChatMessages({ channelId });
	const mounted = useRef('');

	const updateChannelSeenState = (channelId: string, lastMessage: MessagesEntity) => {
		dispatch(directActions.setActiveDirect({ directId: channelId }));
	};

	const { userId } = useAuth();
	const isUnreadDM = useAppSelector((state) => selectIsUnreadDMById(state, channelId as string));
	const { markAsReadSeen } = useSeenMessagePool();
	const currentDmGroup = useSelector(selectDmGroupCurrent(channelId ?? ''));
	useEffect(() => {
		const mode = currentDmGroup?.type === ChannelType.CHANNEL_TYPE_DM ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP;
		if (lastMessage) {
			markAsReadSeen(lastMessage, mode);
		}
	}, [lastMessage, channelId]);

	useEffect(() => {
		dispatch(gifsStickerEmojiActions.setSubPanelActive(SubPanelName.NONE));
	}, [channelId]);

	useEffect(() => {
		if (lastMessage) {
			updateChannelSeenState(channelId, lastMessage);
		}
	}, []);

	useEffect(() => {
		if (mounted.current === channelId) {
			return;
		}
		if (lastMessage) {
			mounted.current = channelId;
			updateChannelSeenState(channelId, lastMessage);
		}
	}, [dispatch, channelId, lastMessage]);
}

const HeaderDirectMessage: React.FC<HeaderProps> = ({
	handleBack,
	navigateToThreadDetail,
	isTypeDMGroup,
	dmAvatar,
	dmLabel,
	userStatus,
	styles,
	themeValue,
	directMessageId,
	firstUserId
}) => {
	useChannelSeen(directMessageId || '');
	const navigation = useNavigation<any>();

	const goToCall = () => {
		navigation.navigate(APP_SCREEN.MENU_CHANNEL.STACK, {
			screen: APP_SCREEN.MENU_CHANNEL.CALL_DIRECT,
			params: {
				receiverId: firstUserId
			}
		});
	};

	return (
		<View style={styles.headerWrapper}>
			<Pressable onPress={handleBack} style={styles.backButton}>
				<Icons.ArrowLargeLeftIcon color={themeValue.text} height={size.s_20} width={size.s_20} />
			</Pressable>
			<Pressable style={styles.channelTitle} onPress={navigateToThreadDetail}>
				{isTypeDMGroup ? (
					<View style={styles.groupAvatar}>
						<Icons.GroupIcon width={18} height={18} />
					</View>
				) : (
					<View style={styles.avatarWrapper}>
						{dmAvatar ? (
							<FastImage
								source={{
									uri: createImgproxyUrl(dmAvatar ?? '', { width: 300, height: 300, resizeType: 'fit' })
								}}
								style={styles.friendAvatar}
							/>
						) : (
							<View style={styles.wrapperTextAvatar}>
								<Text style={[styles.textAvatar]}>{dmLabel?.charAt?.(0)}</Text>
							</View>
						)}
						<UserStatus status={userStatus} />
					</View>
				)}
				<Text style={styles.titleText} numberOfLines={1}>
					{dmLabel}
				</Text>
				{!isTypeDMGroup && !!firstUserId && (
					<TouchableOpacity style={styles.iconHeader} onPress={goToCall}>
						<Icons.PhoneCallIcon width={size.s_18} height={size.s_18} color={themeValue.text} />
					</TouchableOpacity>
				)}
			</Pressable>
		</View>
	);
};

export default React.memo(HeaderDirectMessage);
