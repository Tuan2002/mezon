import { directActions, DirectEntity, directMetaActions, selectDmGroupCurrentId, useAppDispatch } from '@mezon/store';
import { useState } from 'react';
import { useSelector } from 'react-redux';

interface LeaveGroupModalProps {
	onClose: () => void;
	groupWillBeLeave: DirectEntity;
	navigateToFriends: () => void;
}

function LeaveGroupModal({ groupWillBeLeave, onClose, navigateToFriends }: LeaveGroupModalProps) {
	const [isChecked, setIsChecked] = useState(false);
	const dispatch = useAppDispatch();
	const currentDmGroupId = useSelector(selectDmGroupCurrentId);

	const handleCheckboxChange = () => {
		setIsChecked(!isChecked);
	};

	const handleLeaveAndClose = async (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		await dispatch(directActions.closeDirectMessage({ channel_id: groupWillBeLeave.channel_id }));
		const timestamp = Date.now() / 1000;
		dispatch(directMetaActions.setDirectLastSeenTimestamp({ channelId: groupWillBeLeave.channel_id ?? '', timestamp }));
		if (groupWillBeLeave.channel_id === currentDmGroupId) {
			navigateToFriends();
		}
		onClose();
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center z-50">
			<div className="fixed inset-0 bg-black opacity-80"></div>
			<form className="relative z-10 dark:bg-[#313338] bg-bgLightModeSecond rounded-[5px] w-[500px]">
				<div className="top-block p-[16px] dark:text-textDarkTheme text-textLightTheme flex flex-col gap-[15px]">
					<div className="text-xl font-semibold break-words whitespace-normal overflow-wrap-break-word">
						Leave '{groupWillBeLeave?.channel_label}'
					</div>
					<div className="text-lg ">
						Are you sure you want to leave <strong>{groupWillBeLeave?.channel_label}</strong>? You won't be able to rejoin this group
						unless you are re-invited.
					</div>

					<div className="flex items-center gap-[10px]">
						<input
							type="checkbox"
							id="confirmLeaveNoNotifying"
							checked={isChecked}
							onChange={handleCheckboxChange}
							className="h-4 w-4"
							disabled={true} // remove when add action
						/>
						<label htmlFor="confirmLeaveNoNotifying" className="text-sm">
							Leave without notifying other members
						</label>
					</div>
				</div>
				<div className="bottom-block flex justify-end p-[16px] dark:bg-[#2b2d31] bg-[#e1dfdf] items-center gap-[20px] font-semibold rounded-[5px]">
					<div onClick={onClose} className="dark:text-textDarkTheme text-textLightTheme cursor-pointer hover:underline">
						Cancel
					</div>
					<div
						onClick={handleLeaveAndClose}
						className="bg-[#da373c] dark:text-textDarkTheme text-textLightTheme hover:bg-[#a12828] rounded-md px-4 py-2 cursor-pointer"
					>
						Leave Group
					</div>
				</div>
			</form>
		</div>
	);
}

export default LeaveGroupModal;
