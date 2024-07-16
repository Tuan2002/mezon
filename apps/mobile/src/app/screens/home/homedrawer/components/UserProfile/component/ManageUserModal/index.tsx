import { useRoles } from "@mezon/core";
import { Icons } from "@mezon/mobile-components";
import { baseColor, Block, Colors, size, Text, useTheme } from "@mezon/mobile-ui";
import { ChannelMembersEntity, selectAllRolesClan, selectCurrentChannelId, selectCurrentClan } from "@mezon/store-mobile";
import { memo, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Modal, ScrollView, TouchableOpacity } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useSelector } from "react-redux";
import { EActionSettingUserProfile, IProfileSetting } from "../UserSettingProfile";

interface IManageUserModalProp {
    user: ChannelMembersEntity;
    visible: boolean;
    onclose: () => void;
    profileSetting: IProfileSetting[];
}

export const ManageUserModal = memo(({ user, visible, onclose, profileSetting }: IManageUserModalProp) => {
    const { themeValue } = useTheme();
    const [editMode, setEditMode] = useState(false);
    const RolesClan = useSelector(selectAllRolesClan);
    const currentClan = useSelector(selectCurrentClan);
    const currentChannelId = useSelector(selectCurrentChannelId);
    const { updateRole } = useRoles(currentChannelId || '');
    const [selectedRole, setSelectedRole] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation('message');
    const activeRoleOfUser = useMemo(() => {
        return RolesClan.filter(role => user?.role_id?.includes(role?.id)) || [];
    }, [RolesClan, user?.role_id])

    const isClanOwner = useMemo(() => {
        return currentClan?.creator_id === user?.user?.id
    }, [currentClan?.creator_id, user?.user?.id])

    const addRole = async (roleId: string) => {
        const activeRole = RolesClan.find((role) => role.id === roleId);
        await updateRole(currentClan?.clan_id || '', roleId, activeRole?.title ?? '', [user?.user?.id] || [], [], [], []);
    };

    const deleteRole = async (roleId: string) => {
        const activeRole = RolesClan.find((role) => role.id === roleId);
        await updateRole(currentClan?.clan_id || '', roleId, activeRole?.title ?? '', [], [], [user?.user?.id] || [], []);
    };

    const onSelectedRoleChange = async (value: boolean, roleId) => {
        setIsLoading(true);
        const uniqueSelectedRole = new Set(selectedRole);
        if (value) {
            uniqueSelectedRole.add(roleId);
            setSelectedRole([...uniqueSelectedRole]);
            addRole(roleId);
        } else {
            uniqueSelectedRole.delete(roleId);
            setSelectedRole([...uniqueSelectedRole]);
            deleteRole(roleId);
        }
    }

    useEffect(() => {
        if (user?.role_id) {
            setIsLoading(false);
            setSelectedRole(user?.role_id);
        }
    }, [user?.role_id])

    const roleList = useMemo(() => {
        return !editMode ? activeRoleOfUser : RolesClan
    }, [editMode, activeRoleOfUser, RolesClan])

    return (
        <Modal visible={visible} animationType={'slide'} statusBarTranslucent={true}>
            <Block flex={1} backgroundColor={themeValue?.charcoal} paddingTop={size.s_40}>
                <Block flexDirection="row" alignItems="center" justifyContent="space-between" height={size.s_40} paddingHorizontal={size.s_14}>
                    <Block>
                        {!isLoading && (
                            <TouchableOpacity
                                onPress={() => {
                                    onclose();
                                    setEditMode(false);
                                }}
                                disabled={isLoading}
                            >
                                <Icons.CloseIcon height={size.s_30} width={size.s_30} color={themeValue.white} />
                            </TouchableOpacity>
                        )}
                    </Block>
                    <Block flex={1}>
                        <Text center color={themeValue.white} h3>{t('manage.edit')} {user?.user?.username}</Text>
                    </Block>
                </Block>

                <ScrollView>
                    <Block
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                        backgroundColor={themeValue.secondary}
                        padding={size.s_12}
                        gap={size.s_10}
                        marginTop={size.s_18}
                        marginHorizontal={size.s_14}
                        borderRadius={size.s_14}
                    >
                        <Block flex={1} flexDirection="row" gap={size.s_10} alignItems="center">
                            {user?.user?.avatar_url ? (
                                <Image
                                    source={{ uri: user?.user?.avatar_url }}
                                    style={{
                                        width: size.s_40,
                                        height: size.s_40,
                                        borderRadius: 50
                                    }}
                                />
                            ) : (
                                <Text
                                    style={{
                                        backgroundColor: Colors.vividScarlet,
                                        width: size.s_40,
                                        height: size.s_40,
                                        textAlign: 'center',
                                        textAlignVertical: 'center',
                                        borderRadius: 50,
                                        fontSize: size.h5,
                                        color: Colors.white
                                    }}
                                >{user?.user?.username?.charAt?.(0)?.toUpperCase()}</Text>
                            )}
                            <Block>
                                {user?.user?.display_name ? (
                                    <Text color={themeValue.white}>{user?.user?.display_name}</Text>
                                ) : null}
                                <Text color={themeValue.text}>{user?.user?.username}</Text>
                            </Block>
                        </Block>
                    </Block>

                    <Block marginHorizontal={size.s_14} marginTop={size.s_20}>
                        <Text color={themeValue.text} h5>{t('manage.roles')}</Text>
                        <Block borderRadius={size.s_10} overflow="hidden" marginTop={size.s_8}>
                            {roleList.map(role => {
                                if (editMode) {
                                    return (
                                        <TouchableOpacity key={role?.id} onPress={() => onSelectedRoleChange(!selectedRole?.includes(role?.id), role?.id)} disabled={isLoading}>
                                            <Block
                                                backgroundColor={themeValue.secondary}
                                                padding={size.s_14}
                                                borderBottomWidth={1}
                                                borderBottomColor={themeValue.tertiary}
                                                flexDirection="row"
                                                gap={size.s_10}
                                            >
                                                <Block height={size.s_20} width={size.s_20}>
                                                    <BouncyCheckbox
                                                        disabled={isLoading}
                                                        size={20}
                                                        isChecked={selectedRole?.includes(role?.id)}
                                                        onPress={(value) => onSelectedRoleChange(value, role?.id)}
                                                        fillColor={isLoading ? Colors.bgGrayDark : Colors.bgButton}
                                                        iconStyle={{ borderRadius: 5 }}
                                                        innerIconStyle={{
                                                            borderWidth: 1.5,
                                                            borderColor: selectedRole?.includes(role?.id) ? Colors.bgButton : Colors.tertiary,
                                                            borderRadius: 5,
                                                        }}
                                                        textStyle={{ fontFamily: "JosefinSans-Regular" }}
                                                    />
                                                </Block>
                                                <Text color={isLoading ? themeValue.textDisabled : themeValue.white} h4>{role?.title}</Text>
                                            </Block>
                                        </TouchableOpacity>
                                    )
                                }
                                return (
                                    <Block key={role?.id} backgroundColor={themeValue.secondary} padding={size.s_14} borderBottomWidth={1} borderBottomColor={themeValue.tertiary}>
                                        <Text color={themeValue.white} h4>{role?.title}</Text>
                                    </Block>
                                )
                            })}

                            {!editMode ? (
                                <TouchableOpacity onPress={() => setEditMode(true)} disabled={isLoading}>
                                    <Block backgroundColor={themeValue.secondary} padding={size.s_14}>
                                        <Text color={isLoading ? Colors.textGray : baseColor.blurple} h4>{t('manage.editRoles')}</Text>
                                    </Block>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={() => setEditMode(false)} disabled={isLoading}>
                                    <Block backgroundColor={themeValue.secondary} padding={size.s_14}>
                                        <Text color={isLoading ? Colors.textGray : baseColor.blurple} h4>{t('manage.cancel')}</Text>
                                    </Block>
                                </TouchableOpacity>
                            )}
                        </Block>
                    </Block>

                    {!isClanOwner && (
                        <Block marginTop={size.s_16}>
                            {profileSetting?.map(item => {
                                if (item?.isShow && !(EActionSettingUserProfile.Manage === item?.value)) {
                                    return (
                                        <TouchableOpacity
                                            key={item?.value}
                                            onPress={() => item?.action(item?.value)}
                                            disabled={isLoading}
                                            style={{
                                                marginBottom: size.s_14,
                                                borderRadius: size.s_14,
                                                backgroundColor: themeValue.secondary,
                                                padding: size.s_14,
                                                marginHorizontal: size.s_14
                                            }}
                                        >
                                            <Text color={isLoading ? Colors.textGray : Colors.textRed} h4 bold>
                                                {item?.label} '{user?.user?.username}'
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                }
                            })}
                        </Block>
                    )}
                </ScrollView>
            </Block>
        </Modal>
    )
})