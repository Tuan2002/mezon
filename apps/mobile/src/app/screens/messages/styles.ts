import { Attributes, baseColor, Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			backgroundColor: colors.secondary,
			flex: 1,
			paddingHorizontal: size.s_18
		},

		headerWrapper: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingVertical: size.s_20
		},

		headerTitle: {
			fontSize: size.s_18,
			color: colors.textStrong
		},

		addFriendWrapper: {
			flexDirection: 'row',
			gap: size.s_8,
			alignItems: 'center',
			backgroundColor: colors.primary,
			borderRadius: size.s_20,
			borderWidth: 1,
			borderColor: colors.border,
			paddingHorizontal: size.s_10,
			paddingVertical: size.s_6
		},

		addFriendText: {
			fontSize: size.label,
			color: colors.textStrong
		},

		dmMessageListContainer: {
			marginTop: size.s_18
		},

		searchMessage: {
			backgroundColor: colors.primary,
			borderRadius: 40,
			alignItems: 'center',
			paddingHorizontal: size.s_12,
			flexDirection: 'row',
			justifyContent: 'space-between'
		},

		searchInput: {
			width: '93%',
			borderRadius: 20,
			height: size.s_50,
			color: colors.textStrong,
			paddingVertical: size.s_6,
			paddingHorizontal: size.s_12,
			fontSize: size.medium,
			flex: 1
		},

		statusTyping: {
			position: 'absolute',
			width: 30,
			height: 16,
			borderRadius: 10,
			bottom: -2,
			right: -6,
			borderWidth: 3,
			alignItems: 'center',
			justifyContent: 'center',
			borderColor: colors.secondary
		},

		statusCircle: {
			position: 'absolute',
			width: 14,
			height: 14,
			borderRadius: 10,
			bottom: 0,
			right: 0,
			borderWidth: 2,
			borderColor: colors.secondary
		},

		messageItem: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: size.s_8,
			marginBottom: size.s_10
		},
		friendAvatar: {
			width: size.s_40,
			height: size.s_40,
			borderRadius: 50
		},

		messageContent: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: size.s_2
		},

		online: {
			backgroundColor: baseColor.green
		},
		offline: {
			backgroundColor: Colors.bgGrayDark
		},

		defaultText: {
			color: colors.text,
			fontSize: size.medium
		},

		addMessage: {
			position: 'absolute',
			bottom: 10,
			right: 10,
			width: size.s_50,
			height: size.s_50,
			backgroundColor: baseColor.blurple,
			borderRadius: 50,
			alignItems: 'center',
			justifyContent: 'center'
		},

		groupAvatar: {
			backgroundColor: Colors.orange,
			width: size.s_40,
			height: size.s_40,
			borderRadius: 50,
			justifyContent: 'center',
			alignItems: 'center'
		},

		lastMessage: {
			color: colors.textStrong
		},

		dateTime: {
			fontSize: size.s_12
		},

		channelLabel: {
			fontSize: size.s_14,
			flex: 1
		},
		avatarWrapper: {
			borderRadius: 50,
			backgroundColor: colors.colorAvatarDefault,
			height: size.s_40,
			width: size.s_40
		},
		wrapperTextAvatar: {
			width: size.s_40,
			height: size.s_40,
			justifyContent: 'center',
			alignItems: 'center'
		},
		textAvatar: {
			textAlign: 'center',
			fontSize: size.h6,
			color: Colors.white
		},
		lottie: { width: 30, height: 20 },
		contentMessage: {
			flex: 1,
			maxHeight: size.s_22,
			flexDirection: 'row',
			alignItems: 'flex-end',
			flexWrap: 'nowrap',
			overflow: 'hidden'
		}
	});
