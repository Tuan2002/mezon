import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Feather from 'react-native-vector-icons/Feather'
import { darkColor } from '../../../constants/Colors';
const ServerNavbar = () => {
    return (
        <View style={styles.serverNavbarContainer}>
            <View style={styles.commonIconStyle}>
                <Feather name="message-circle" size={18} />
            </View>

            {/* here will be the list of servers */}

            <View style={styles.commonIconStyle}>
                <Text style={{
                    color: darkColor.Content_Subtle
                }}>1st</Text>
            </View>
            <View style={styles.commonIconStyle}>
                <Text style={{
                    color: darkColor.Content_Subtle
                }}>2nd</Text>
            </View>

            <View style={styles.commonIconStyle}>
                <Feather name="plus-circle" size={14} />
            </View>
        </View>
    );
}

export default ServerNavbar

const styles = StyleSheet.create({
    serverNavbarContainer: {
        width: '20%',
        height: '98%',
        alignSelf: "flex-end",
        alignItems: "center"
    },
    commonIconStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        width: 40,
        borderRadius: 20,
        marginBottom: 10,
        backgroundColor: darkColor.Content_Tertiary
    },
})

