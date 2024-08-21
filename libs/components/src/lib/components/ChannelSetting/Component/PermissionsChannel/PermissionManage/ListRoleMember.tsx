import { permissionRoleChannelActions, RolesClanEntity, useAppDispatch, UsersClanEntity } from "@mezon/store";
import { Icons } from "@mezon/ui";
import { getAvatarForPrioritize, getNameForPrioritize } from "@mezon/utils";
import { memo, useEffect, useRef, useState } from "react";
import { AvatarImage } from "../../../../AvatarImage/AvatarImage";

type ListRoleMemberProps = {
    listManageNotInChannel: RolesClanEntity[];
    listManageInChannel: RolesClanEntity[];
    usersClan: UsersClanEntity[];
    setListManage?: React.Dispatch<React.SetStateAction<RolesClanEntity[]>>;
    channelId: string
    onSelect: (id: string) => void;
    canChange: boolean
}

const ListRoleMember = memo((props: ListRoleMemberProps) => {
    const { listManageInChannel, usersClan, channelId, onSelect, canChange } = props;
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (listManageInChannel.length > 0) {
            setSelectedItemId(listManageInChannel[0].id);
            onSelect(listManageInChannel[0].id)
            dispatch(permissionRoleChannelActions.fetchPermissionRoleChannel({ channelId: channelId, roleId: listManageInChannel[0].id}));
        }
    }, [channelId]);

    const handleItemClick = (item: any) => {
        if (canChange) {
            setSelectedItemId(item.id);
            onSelect(item.id)
            dispatch(permissionRoleChannelActions.fetchPermissionRoleChannel({ channelId: channelId, roleId: item.id}));
        }
    };

    return (
        <div className="basis-1/3">
            <HeaderAddRoleMember listManageNotInChannel={listManageInChannel} usersClan={usersClan} />
            <div className="mt-2">
                {listManageInChannel.map(item => (
                    <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`w-full py-1.5 px-[10px] text-[15px] bg-transparent hover:bg-bgLightModeButton font-medium inline-flex gap-x-2 items-center rounded ${
                            selectedItemId === item.id
                                ? 'dark:bg-bgModifierHover bg-bgLightModeButton'
                                : 'dark:text-textDarkTheme text-textLightTheme'
                        }`}
                    >
                        {item.title}
                    </div>
                ))}
            </div>
        </div>
    );
});


export default ListRoleMember;

type HeaderAddRoleMemberProps = {
    listManageNotInChannel: RolesClanEntity[];
    usersClan: UsersClanEntity[];
}

const HeaderAddRoleMember = memo((props: HeaderAddRoleMemberProps) => {
    const {listManageNotInChannel, usersClan} = props;
    const [showPopup, setShowPopup] = useState(false);
    const panelRef = useRef<HTMLDivElement | null>(null);
    return (
        <div 
            ref={panelRef}
            className="flex justify-between items-center relative" 
            onClick={() => setShowPopup(!showPopup)}
        >
            <h4 className="uppercase font-bold text-xs text-contentTertiary">Roles/Members</h4>
            <Icons.PlusIcon defaultSize="size-4 text-contentTertiary cursor-pointer"/>
            {showPopup &&
                <div className="absolute bottom-5 w-64 rounded-lg overflow-hidden dark:text-contentTertiary text-colorTextLightMode border dark:border-gray-700 border-gray-300">
                    <div className="dark:bg-bgTertiary bg-bgLightModeSecond flex gap-x-1 p-4 text-sm">
                        <p className="font-bold">ADD:</p>
                        <input 
                            type="text" 
                            className="bg-transparent outline-none font-medium"
                            placeholder="Role/Member"
                        />
                    </div>
                    <div className="dark:bg-bgSecondary bg-white p-2 h-64 overflow-y-scroll hide-scrollbar">
                        {Boolean(listManageNotInChannel.length) &&
                            <div>
                                <p className="px-3 py-2 uppercase text-[11px] font-bold">Role</p>
                                {listManageNotInChannel.map(item => 
                                    <div key={item.id} className="rounded px-3 py-2 font-semibold dark:hover:bg-bgModifierHover hover:bg-bgLightModeButton dark:hover:text-white hover:text-black">{item.title}</div>
                                )}
                            </div>
                        }
                        {Boolean(usersClan.length) &&
                            <div>
                                <p className="px-3 py-2 uppercase text-[11px] font-bold">Member</p>
                                {usersClan.map(item => 
                                    <ItemUser 
                                        key={item.id}
                                        userName={item.user?.username}
                                        displayName={item.user?.display_name}
                                        clanName={item.clan_nick}
                                        avatar={item.user?.avatar_url}
                                        avatarClan={item.clan_avatar}
                                    />
                                )}
                            </div>
                        }
                    </div>
                </div>
            }
        </div>
    )
})

type ItemUserProps = {
    userName?: string;
    displayName?: string;
    clanName?: string;
    avatar?: string;
    avatarClan?: string;
}

const ItemUser = (props: ItemUserProps) => {
    const {userName="", displayName="", clanName="", avatar="", avatarClan=""} = props;
    const namePrioritize = getNameForPrioritize(clanName, displayName, userName);
    const avatarPrioritize = getAvatarForPrioritize(avatarClan, avatar);
    return(
        <div className="rounded px-3 py-2 font-semibold dark:hover:bg-bgModifierHover hover:bg-bgLightModeButton dark:hover:text-white hover:text-black flex items-center gap-x-2">
            <AvatarImage 
                alt={userName}
                userName={userName}
                className="min-w-8 min-h-8 max-w-8 max-h-8"
                src={avatarPrioritize}
            />
            <p className="font-medium">{namePrioritize}</p>
        </div>
    )
}

