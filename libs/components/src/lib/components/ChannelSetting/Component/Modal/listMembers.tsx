import { Icons } from "@mezon/components";
import { ApiUser } from "mezon-js/api.gen";

type ListMembersProps = {
    listItem: (ApiUser | undefined)[];
    selectedUserIds: string[];
    handleCheckboxUserChange: (event: React.ChangeEvent<HTMLInputElement>, userId: string) => void;
}

const ListMembers = (props: ListMembersProps) => {
    const {listItem, selectedUserIds, handleCheckboxUserChange} = props;
    return (
        listItem.map((user) => (
            <div
                className={`flex justify-between py-2 rounded hover:bg-[#E1E2E4] dark:hover:bg-[#43444B] px-[6px]`}
                key={user?.id}
            >
                <label className="flex gap-x-2 items-center w-full">
                    <div className="relative flex flex-row justify-center">
                        <input
                            type="checkbox"
                            value={user?.display_name}
                            checked={selectedUserIds.includes(user?.id || '')}
                            onChange={(event) => handleCheckboxUserChange(event, user?.id || '')}
                            className="peer appearance-none forced-colors:appearance-auto relative w-4 h-4 border dark:border-textPrimary border-gray-600 rounded-md focus:outline-none"
                        />
                        <Icons.Check className="absolute invisible peer-checked:visible forced-colors:hidden w-4 h-4" />
                    </div>
                    <img src={user?.avatar_url} alt={user?.display_name} className="size-6 object-cover rounded-full" />
                    <p className="text-sm">{user?.display_name}</p>
                </label>
            </div>
        ))
    )
}

export default ListMembers;