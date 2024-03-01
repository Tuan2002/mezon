import { useDispatch, useSelector } from "react-redux";
import SettingListRole from "./SettingListRole";
import SettingValueDisplayRole from "./SettingOptionRole";
import { getIsShow, getNewAddMembers, getNewAddPermissions, getNewNameRole, getRemovePermissions, getSelectedRoleId, setNameRoleNew, setSelectedPermissions } from "@mezon/store";
import SettingUserClanProfileSave from "../../SettingProfile/SettingRightClanProfile/settingUserClanProfileSave";
import { useClans, useRoles } from "@mezon/core";
type EditNewRole = {
	flagOption: boolean;
	handleClose: () => void;
};
export type ModalSettingSave = {
    flagOption: boolean;
    handleClose: () => void;
	handlSaveClose: () => void;
	handleUpdateUser: () => void;
};
// import SettingRightUser from '../SettingRightUserProfile';
const ServerSettingRoleManagement = (props: EditNewRole) => {
    const { createRole ,updateRole} = useRoles();
    const clickRole = useSelector(getSelectedRoleId);
    const nameRole = useSelector(getNewNameRole);
    const addPermissions = useSelector(getNewAddPermissions);
    const removePermissions = useSelector(getRemovePermissions);
    const addUsers = useSelector(getNewAddMembers);
    const { RolesClan } = useRoles();
    const dispatch = useDispatch();
    const { currentClan } = useClans();
    const isChange = useSelector(getIsShow);
    
    const handleClose = () =>{
        if (clickRole === 'New Role') {
            props.handleClose()
        }else{
            const activeRole = RolesClan.find(role => role.id === clickRole);
            const permissions = activeRole?.permission_list?.permissions;
            const permissionIds = permissions
            ? permissions.filter(permission => permission.active === 1).map(permission => permission.id) : [];
            
            dispatch(setNameRoleNew(activeRole?.title));
            dispatch(setSelectedPermissions(permissionIds));
        }
    }
    const handlSaveClose = () =>{

    }
    
    
    const handleUpdateUser = async () =>{
        if (clickRole === 'New Role') {
            await createRole(currentClan?.id||'', currentClan?.id||'',nameRole,addUsers,addPermissions);
        }else{
            await updateRole(currentClan?.id ?? '',clickRole,nameRole,[],addPermissions,[],removePermissions);
        }  
    }

    const saveProfile: ModalSettingSave = {
		flagOption:isChange,
        handleClose,
		handlSaveClose,
		handleUpdateUser,
	};
	return (
        <>
        {props.flagOption?(
            <div className="flex flex-row flex-1 shrink min-w-0 bg-bgSecondary pt-[94px] pr-[40px] pb-[94px] pl-[40px]">
                <SettingListRole handleClose={props.handleClose}/>
                <div className="border-l border-gray-400"></div>
                <div className=" w-2/3">
                    <div className="font-semibold ml-[15px]">
                        {clickRole === 'New Role' ? (
                            <div className="">
                                NEW ROLE
                            </div>
                        ):(
                            <div className="">
                                EDIT ROLE
                            </div>
                        )}
                        <SettingValueDisplayRole />
                    </div>
                </div>
                <SettingUserClanProfileSave PropsSave={saveProfile}/>
            </div>
        ):null}
        </>
	);
};

export default ServerSettingRoleManagement;
