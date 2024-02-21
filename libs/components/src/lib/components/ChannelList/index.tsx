import { useAuth, useCategory, useClans, useInvite } from '@mezon/core';
import { channelsActions, selectAllPermissionsUser, selectCurrentChannel, useAppDispatch } from '@mezon/store';
import { Modal } from '@mezon/ui';
import { ICategory, ICategoryChannel, IChannel } from '@mezon/utils';
import { useState } from 'react';
import ChannelLink from '../ChannelLink';
import * as Icons from '../Icons';
import { BrowseChannel, Events } from './ChannelListComponents';
import { CreateNewChannelModal } from '../CreateChannelModal';
import { useSelector } from 'react-redux';

export type ChannelListProps = { className?: string };
export type CategoriesState = Record<string, boolean>;

function ChannelList() {
	const { userProfile } = useAuth();
	const { categorizedChannels } = useCategory();
	const currentChanel = useSelector(selectCurrentChannel);
	const [categoriesState, setCategoriesState] = useState<CategoriesState>(
		categorizedChannels.reduce((acc, category) => {
			acc[category.id] = false;
			return acc;
		}, {} as CategoriesState),
	);

	const handleToggleCategory = (category: ICategoryChannel, setToTrue?: boolean) => {
		if (setToTrue) {
			setCategoriesState((prevState) => ({
				...prevState,
				[category.id]: prevState[category.id],
			}));
		} else {
			setCategoriesState((prevState) => ({
				...prevState,
				[category.id]: !prevState[category.id],
			}));
		}
	};

	const { currentClan } = useClans();
	const { createLinkInviteUser } = useInvite();
	
	const permissionsUser = useSelector(selectAllPermissionsUser);
	const containsViewChannelPermission = permissionsUser.some((permission) => permission.slug === 'administrator');
	const shouldDisplayButton = currentClan?.creator_id === userProfile?.user?.id || containsViewChannelPermission;
	const dispatch = useAppDispatch();
	const openModalCreateNewChannel = (paramCategory: ICategory) => {
		dispatch(channelsActions.openCreateNewModalChannel(true));
		dispatch(channelsActions.getCurrentCategory(paramCategory));
	};

	const [openInvite, setOpenInvite] = useState(false);

	const [urlInvite, setUrlInvite] = useState('');

	const handleOpenInvite = (currentServerId: string, currentChannelId: string) => {
		setOpenInvite(true);
		createLinkInviteUser(currentServerId ?? '', currentChannelId ?? '', 10).then((res) => {
			if (res && res.invite_link) {
				setUrlInvite(window.location.origin + '/invite/' + res.invite_link);
			}
		});
	};

	const unsecuredCopyToClipboard = (text: string) => {
		const textArea = document.createElement('textarea');
		textArea.value = text;
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		try {
			document.execCommand('copy');
		} catch (err) {
			console.error('Unable to copy to clipboard', err);
		}
		document.body.removeChild(textArea);
	};

	const handleCopyToClipboard = (content: string) => {
		if (window.isSecureContext && navigator.clipboard) {
			navigator.clipboard.writeText(content);
		} else {
			unsecuredCopyToClipboard(content);
		}
	};

	return (
		<>
			{<CreateNewChannelModal />}
			<div className="self-stretch h-[52px] px-4 flex-col justify-start items-start gap-3 flex mt-[24px]">
				<Events />
				<BrowseChannel />
			</div>
			<hr className="h-[0.08px] w-[272px] mt-[24px] border-[#1E1E1E]" />
			<div className="overflow-y-scroll flex-1 pt-3 space-y-[21px]  text-gray-300 scrollbar-hide ">
				{categorizedChannels.map((category: ICategoryChannel) => (
					<div key={category.id}>
						{category.category_name && (
							<div className="flex flex-row px-2 relative">
								<button
									onClick={() => {
										handleToggleCategory(category);
									}}
									className="font-['Manrope'] text-[#AEAEAE] font-bold flex items-center px-0.5 w-full font-title tracking-wide hover:text-gray-100 uppercase text-[15px]"
								>
									{!categoriesState[category.id] ? (
										<Icons.ArrowDown defaultSize="text-[16px]" />
									) : (
										<Icons.ArrowRight defaultSize="text-[16px]" />
									)}
									{category.category_name}
								</button>
								{shouldDisplayButton && (
									<button
										onClick={() => {
											handleToggleCategory(category, true);
											openModalCreateNewChannel(category);
										}}
									>
										<Icons.Plus />
									</button>
								)}
							</div>
						)}
						{!categoriesState[category.id] && (
							<div className="mt-[5px] space-y-0.5 font-['Manrope'] text-[#AEAEAE]">
								{category?.channels
									?.filter((channel: IChannel) => {
										const categoryIsOpen = !categoriesState[category.id];
										return categoryIsOpen || channel?.unread;
									})
									.map((channel: IChannel) => (
										<ChannelLink
											serverId={channel?.clan_id}
											channel={channel}
											active={currentChanel?.id === channel.id}
											key={channel.id}
											createInviteLink={handleOpenInvite}
											isPrivate={channel.channel_private}
										/>
									))}
							</div>
						)}
					</div>
				))}
			</div>
			<Modal
				title="Invite friend"
				onClose={() => {
					setOpenInvite(false);
				}}
				showModal={openInvite}
				confirmButton={() => handleCopyToClipboard(urlInvite)}
				titleConfirm="Copy"
			>
				<p>
					<span>{urlInvite}</span>
				</p>
			</Modal>
		</>
	);
}

export default ChannelList;
