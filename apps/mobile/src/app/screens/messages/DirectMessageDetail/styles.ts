import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    dmMessageContainer: {
        backgroundColor: Colors.secondary,
        flex: 1,
    },
    headerWrapper: {
        flexDirection: 'row',
        borderBottomColor: Colors.borderPrimary,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    backButton: {
        padding: size.s_16,
        borderRadius: 50
    },
    channelTitle: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        gap: size.s_8,
    },
    titleText: {
        color: Colors.textGray,
        fontSize: size.label,
        flex: 1
    },
    content: {
        flex: 1,
        backgroundColor: Colors.tertiaryWeight
    },
    actions: {
        flexDirection: 'row',
        gap: size.s_20
    },
    groupAvatar: {
        backgroundColor: Colors.bgToggleOnBtn,
        width: size.s_30,
        height: size.s_30,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    friendAvatar: {
        width: size.s_30,
        height: size.s_30,
        borderRadius: 50
    },
    statusCircle: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 10,
        bottom: 0,
        right: -2,
        borderWidth: 2,
        borderColor: Colors.secondary,
    },
    online: {
        backgroundColor: Colors.green,
    },
    offline: {
        backgroundColor: Colors.bgGrayDark,
    },
})
