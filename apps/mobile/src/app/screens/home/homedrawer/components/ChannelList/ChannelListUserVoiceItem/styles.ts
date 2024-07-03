import { Attributes, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const style = (colors: Attributes) => StyleSheet.create({
    userVoiceWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: size.s_10,
        marginLeft: size.s_30,
        paddingVertical: size.s_6
    },
    
    userVoiceName: {
        color: colors.text,
        fontSize: size.medium,
        fontWeight: '400'
    }
});