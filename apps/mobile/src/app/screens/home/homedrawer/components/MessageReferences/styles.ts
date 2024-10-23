import { Attributes, Colors, size, verticalScale } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';
export const style = (colors: Attributes) =>
	StyleSheet.create({
		aboveMessage: {
			flexDirection: 'row',
			paddingTop: size.s_6,
			paddingLeft: size.s_10,
			gap: 15
		},
		iconReply: {
			width: size.s_34,
			height: '100%',
			alignItems: 'center',
			paddingLeft: size.s_30
		},
		deletedMessageReplyIcon: {
			top: size.s_4
		},
		replyAvatar: {
			width: size.s_20,
			height: size.s_20,
			borderRadius: size.s_50,
			backgroundColor: Colors.gray48,
			overflow: 'hidden'
		},
		repliedMessageWrapper: {
			flexDirection: 'row',
			gap: 8,
			marginRight: 0,
			height: size.s_20,
			alignContent: 'center'
		},
		avatarMessageBoxDefault: {
			width: '100%',
			height: '100%',
			borderRadius: size.s_50,
			backgroundColor: colors.colorAvatarDefault,
			justifyContent: 'center',
			alignItems: 'center'
		},
		textAvatarMessageBoxDefault: {
			fontSize: size.s_22,
			color: Colors.white
		},
		imageMessageRender: {
			borderRadius: verticalScale(5),
			marginVertical: size.s_6,
			borderWidth: 0.5,
			borderColor: Colors.borderPrimary
		},
		repliedTextAvatar: {
			fontSize: size.s_12,
			color: Colors.white
		},
		replyContentWrapper: {
			width: '85%',
			flexDirection: 'row',
			alignItems: 'center',
			gap: 4
		},
		replyDisplayName: {
			color: Colors.caribbeanGreen,
			fontSize: size.small
		},
		tapToSeeAttachmentText: {
			color: colors.text,
			fontSize: size.small,
			flex: 1
		}
	});
