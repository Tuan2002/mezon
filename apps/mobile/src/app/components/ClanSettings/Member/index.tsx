import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { baseColor, useTheme } from "@mezon/mobile-ui";
import { selectAllUserClans, useAppSelector } from "@mezon/store-mobile";
import { UsersClanEntity } from "@mezon/utils";
import { useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native";
import { APP_SCREEN, MenuClanScreenProps } from "../../../navigation/ScreenTypes";
import UserSettingProfile from "../../../screens/home/homedrawer/components/UserProfile/component/UserSettingProfile";
import { IMezonMenuContextItemProps, MezonBottomSheet, MezonSearch } from "../../../temp-ui";
import { style } from "./styles";
import UserItem from "./UserItem";

type MemberClanScreen = typeof APP_SCREEN.MENU_CLAN.MEMBER_SETTING;
export default function MemberSetting({ navigation }: MenuClanScreenProps<MemberClanScreen>) {
    const { themeValue } = useTheme();
    const styles = style(themeValue);
    const usersClan = useAppSelector(selectAllUserClans);
    const memberPruneBSRef = useRef<BottomSheetModal>();
    const memberFilterBSRef = useRef<BottomSheetModal>();
    const [selectedUser, setSelectedUser] = useState<UsersClanEntity>();
    const [isShowManagementUserModal, setShowManagementUserModal] = useState(false);

    const menuContext = useMemo(() => [
        {
            title: "Filter",
            onPress: () => {
                memberFilterBSRef?.current?.present();
            }
        },
        {
            title: "Prune",
            onPress: () => {
                memberPruneBSRef?.current?.present();
            },
            titleStyle: { color: baseColor.redStrong }
        }
    ] satisfies IMezonMenuContextItemProps[], [])

    navigation.setOptions({
        // headerRight: () => (
        // <MezonMenuContext
        //     icon={<Icons.MoreHorizontalIcon
        //         color={themeValue.text}
        //         height={size.s_20} width={size.s_20}
        //         style={{ marginRight: size.s_20 }}
        //     />}
        //     menu={menuContext}
        // />
        // )
    })

    function handlePressUser(user: UsersClanEntity) {
        setSelectedUser(user);
        setShowManagementUserModal(true)
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }}>
            <View style={styles.container}>
                <MezonSearch />
                <ScrollView contentContainerStyle={styles.userList}>
                    {usersClan?.map((item, index) => (
                        <UserItem
                            key={item.id}
                            userID={item.id}
                            hasBorder={index != (usersClan?.length || 0) - 1}
                            onPress={() => handlePressUser(item)}
                        />
                    ))}
                </ScrollView>
            </View>

            <UserSettingProfile
                // @ts-ignore
                user={selectedUser}
                showManagementUserModal={isShowManagementUserModal}
                showActionOutside={false}
                onShowManagementUserModalChange={(value) => setShowManagementUserModal(value)}
            />

            <MezonBottomSheet
                heightFitContent
                title="Member Prune"
                ref={memberPruneBSRef}
            >
                {/* MemberPrune */}
                <Text>Member Prune</Text>
            </MezonBottomSheet>

            <MezonBottomSheet
                heightFitContent
                title="Member Filter"
                ref={memberFilterBSRef}
            >
                {/* MemberFilter */}
                <Text>Member Filter</Text>
            </MezonBottomSheet>
        </KeyboardAvoidingView>
    )
}
