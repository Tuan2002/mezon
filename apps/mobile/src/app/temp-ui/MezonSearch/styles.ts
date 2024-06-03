import { Colors, Fonts } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    inputWrapper: {
        backgroundColor: Colors.secondary,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginVertical: 20,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },

    input: {
        color: Colors.white,
        fontSize: Fonts.size.small,
        flexBasis: 10,
        flexGrow: 1
    },
})

export default styles;