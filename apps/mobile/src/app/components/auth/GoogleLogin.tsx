import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import React, {useEffect} from 'react'
import Images from 'apps/mobile/src/assets/Images'
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
const GOOGLE_ANDROID_ID = '648946579638-qtugur5pktrkh30q0ampp76fnaekcmk7.apps.googleusercontent.com';

const GoogleLogin = () => {
    useEffect(() => {
        GoogleSignin.configure({
            webClientId: GOOGLE_ANDROID_ID,
            offlineAccess: true,
            forceCodeForRefreshToken: true,
        });
    }, []);
    const navigation = useNavigation()
    async function onGoogleButtonPress() {
        try {
            // Get the users ID token
            await GoogleSignin.hasPlayServices();
            const { idToken } = await GoogleSignin.signIn();
            console.log('Tom log  => idToken', idToken);
        } catch (error) {
            console.log('error onGoogleButtonPress', error);
        }

    }
    return (
        <Pressable style={styles.googleButton}
            onPress={onGoogleButtonPress}
        >
            <View style={styles.socialButtonsContainer}>
                <View style={styles.signinButtonLogoContainer}>
                    <Image source={Images.ICON_GOOGLE} style={styles.signinButtonLogo} />
                </View>
                <Text style={styles.socialSigninButtonText}>Continue with Google</Text>
            </View>
        </Pressable>
    )
}

export default GoogleLogin

const styles = StyleSheet.create({
    googleButton: {
        backgroundColor: "#D1E0FF",
        paddingVertical: 15,
        marginHorizontal: 20,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    signinButtonLogoContainer: {
        backgroundColor: "#155EEF",
        padding: 2,
        borderRadius: 3,
        position: 'absolute',
        left: 25,
    },
    signinButtonLogo: {
        height: 18,
        width: 18,
    },
    socialSigninButtonText: {
        color: "#155EEF",
        fontSize: 16,
        lineHeight: 13 * 1.4,
    },
})
