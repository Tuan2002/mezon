import { useEscapeKey } from '@mezon/core';
import { selectDirectsOpenlist, selectTheme } from '@mezon/store';
import { IChannel } from '@mezon/utils';
import { Tooltip } from 'flowbite-react';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import * as Icons from '../../../../../ui/src/lib/Icons';
import { IconFriends } from '../../../../../ui/src/lib/Icons';
import { ModalCreateDM } from './ModalCreateDmGroup/index';
import ListDMChannel from './listDMChannel';

export type ChannelListProps = { className?: string };
export type CategoriesState = Record<string, boolean>;

const sortDMItem = (notSortedArr: IChannel[]): IChannel[] => {
	return notSortedArr.slice().sort((a, b) => {
		const timestampA = parseFloat(a.last_sent_message?.timestamp || '0');
		const timestampB = parseFloat(b.last_sent_message?.timestamp || '0');
		return timestampB - timestampA;
	});
};

function DirectMessageList() {
	const pathname = useLocation().pathname;
	const dmGroupChatList = useSelector(selectDirectsOpenlist);
	const filterDmGroupsByChannelLabel = (data: IChannel[]) => {
		const uniqueLabels = new Set();
		return data.filter((obj: IChannel) => {
			const isUnique = !uniqueLabels.has(obj.channel_id);
			uniqueLabels.add(obj.channel_id);
			return isUnique;
		});
	};
	const navigate = useNavigate();

	const sortedFilteredDataDM = useMemo(() => {
		return sortDMItem(filterDmGroupsByChannelLabel(dmGroupChatList));
	}, [dmGroupChatList])

	useEffect(() => {
		if (sortedFilteredDataDM.length === 0) {
			navigate('/chat/direct/friends');
		}
	}, [sortedFilteredDataDM, navigate]);

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const onClickOpenModal = () => {
		setIsOpen(!isOpen);
	};

	useEscapeKey(() => setIsOpen(false));
	const appearanceTheme = useSelector(selectTheme);
	return (
		<>
			<div className="absolute">
				<ModalCreateDM onClose={onClickOpenModal} isOpen={isOpen} />
			</div>

			<div className="mt-5 px-2 py-1">
				<div className="w-full flex flex-row items-center">
					<button
						className={`py-2 px-3 rounded-[4px] dark:text-white text-black w-full flex gap-4 items-center ${pathname.includes('friends') ? 'dark:bg-bgModifierHover bg-[#F7F7F7]' : ''}`}
						onClick={() => {
							navigate('/chat/direct/friends');
						}}
					>
						<IconFriends />
						Friends
					</button>
				</div>

				<div className="text-xs font-semibold tracking-wide left-sp dark:text-[#AEAEAE] text-[#585858] mt-6 flex flex-row items-center w-full justify-between px-2 pb-0 h-5 cursor-default dark:hover:text-white hover:text-black">
					<p>DIRECT MESSAGES</p>
					<button
						onClick={onClickOpenModal}
						className="cursor-pointer flex flex-row justify-end  ml-0 hover:bg-bgSecondary rounded-full iconHover"
					>
						<Tooltip content="Create DM" trigger="hover" animation="duration-500" style={appearanceTheme === 'light' ? 'light' : 'dark'}>
							<Icons.Plus />
						</Tooltip>
					</button>
				</div>
			</div>
			<div
				className={`flex-1 overflow-y-scroll font-medium text-gray-300 px-2 h-2/3 ${appearanceTheme === 'light' ? 'customSmallScrollLightMode' : 'thread-scroll'}`}
			>
				<div className="flex flex-col gap-1 text-[#AEAEAE] py-1 text-center relative">
					<ListDMChannel listDM={sortedFilteredDataDM} />
				</div>
			</div>
		</>
	);
}

export default DirectMessageList;
