import { selectAllDirectMessages, selectAllUserClans } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { createImgproxyUrl } from '@mezon/utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button, Label, Modal } from 'flowbite-react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { AvatarImage } from '../../../components';

type ModalSendTokenProps = {
	openModal: boolean;
	onClose?: () => void;
	token?: number;
	setToken: (token: number) => void;
	handleSaveSendToken?: () => void;
	setSelectedUserId: (id: string) => void;
	setNote: (note: string) => void;
	error: string | null;
	userSearchError: string | null;
	userId: string;
};

const ModalSendToken = ({
	openModal,
	token,
	onClose,
	setToken,
	handleSaveSendToken,
	setSelectedUserId,
	setNote,
	error,
	userSearchError,
	userId
}: ModalSendTokenProps) => {
	const usersClan = useSelector(selectAllUserClans);
	const directMessages = useSelector(selectAllDirectMessages);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	useEffect(() => {
		if (!openModal) {
			setSearchTerm('');
			setToken(0);
		}
	}, [openModal]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [dropdownRef]);

	const handleChangeSearchTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchTerm(value);

		if (value.length < searchTerm.length) {
			setSearchTerm('');
			setSelectedUserId('');
		} else {
			setSearchTerm(value);
		}
	};

	const handleSelectUser = (id: string, name: string) => {
		setSearchTerm(name);
		setIsDropdownOpen(false);
		setSelectedUserId(id);
	};

	const handleChangeSendToken = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setToken(Number(value));
	};

	const handleChangeNote = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setNote(value);
	};

	const mergeUniqueUsers = (usersClan: any[], directMessages: any[]) => {
		const userMap = new Map();

		usersClan.forEach((clan) => {
			const { id, user } = clan;
			const userId = Array.isArray(id) ? id[0] : id;
			const userIdStr = String(userId);
			if (!userMap.has(userIdStr)) {
				userMap.set(userIdStr, {
					id: userIdStr,
					username: user.username,
					avatar_url: user.avatar_url
				});
			}
		});

		directMessages.forEach((message) => {
			const { user_id, usernames, channel_avatar } = message;
			const userId = Array.isArray(user_id) ? user_id[0] : user_id;
			const userIdStr = String(userId);
			if (!userMap.has(userIdStr)) {
				userMap.set(userIdStr, {
					id: userIdStr,
					username: usernames,
					avatar_url: channel_avatar[0] ?? ''
				});
			}
		});

		return Array.from(userMap.values());
	};
	const mergedUsers = mergeUniqueUsers(usersClan, directMessages);

	const filteredUsers = mergedUsers.filter((user: any) => user.username?.toLowerCase().includes(searchTerm.toLowerCase()) && user.id !== userId);

	const rowVirtualizer = useVirtualizer({
		count: filteredUsers?.length,
		getScrollElement: () => dropdownRef.current,
		estimateSize: () => 48,
		overscan: 5
	});

	return (
		<Modal className="bg-bgModalDark" theme={{ content: { base: 'w-[440px]' } }} show={openModal} dismissible={true} onClose={onClose}>
			<div className="dark:bg-bgPrimary bg-bgLightMode pt-4 rounded">
				<div>
					<h1 className="dark:text-textDarkTheme text-xl font-semibold text-center">Send Token</h1>
				</div>
				<div className="flex w-full flex-col gap-5 pt-4">
					<div className="px-4">
						<div className="mb-2 block">
							<Label value={`Send token to ?`} className="dark:text-[#B5BAC1] text-textLightTheme text-xs uppercase font-semibold" />
						</div>
						<div className="relative">
							<input
								type="text"
								placeholder="Search users..."
								className="dark:text-[#B5BAC1] text-textLightTheme outline-none w-full h-10 p-[10px] dark:bg-bgInputDark bg-bgLightModeThird text-base rounded placeholder:text-sm"
								value={searchTerm}
								onClick={() => setIsDropdownOpen(true)}
								onChange={handleChangeSearchTerm}
							/>
							{isDropdownOpen && (
								<div
									className="absolute overflow-y-auto overflow-x-hidden max-h-[190px] w-full z-10 mt-[4px] dark:bg-[#232428] bg-bgLightModeThird border-none py-0 customSmallScrollLightMode"
									ref={dropdownRef}
								>
									<div
										style={{
											height: `${rowVirtualizer.getTotalSize()}px`,
											width: '100%',
											position: 'relative'
										}}
									>
										{filteredUsers.length > 0 &&
											rowVirtualizer.getVirtualItems().map((virtualRow) => {
												const user = filteredUsers[virtualRow.index];

												return (
													<div
														key={virtualRow.index}
														style={{
															position: 'absolute',
															top: 0,
															left: 0,
															width: '100%',
															height: `${virtualRow.size}px`,
															transform: `translateY(${virtualRow.start}px)`
														}}
													>
														<ItemSelect key={user.id} onClick={() => handleSelectUser(user.id, user.username)}>
															<div className="flex items-center">
																<AvatarImage
																	alt={user.username || ''}
																	userName={user.username}
																	srcImgProxy={createImgproxyUrl(user.avatar_url ?? '', {
																		width: 100,
																		height: 100,
																		resizeType: 'fit'
																	})}
																	src={user.avatar_url}
																	className="size-4 mr-2"
																	classNameText="text-[9px] min-w-5 min-h-5 pt-[3px]"
																/>
																<span className="one-line">{user.username}</span>
															</div>
														</ItemSelect>
													</div>
												);
											})}
									</div>
								</div>
							)}
							{userSearchError && <p className="text-red-500 text-xs mt-1">{userSearchError}</p>}
						</div>
					</div>
					<div className="px-4 mb-4">
						<div className="mb-2 block">
							<Label
								htmlFor="clearAfter"
								value="Token"
								className="dark:text-[#B5BAC1] text-textLightTheme text-xs uppercase font-semibold"
							/>
						</div>
						<input
							type="number"
							defaultValue={token}
							className="dark:text-[#B5BAC1] text-textLightTheme outline-none w-full h-10 p-[10px] dark:bg-bgInputDark bg-bgLightModeThird text-base rounded placeholder:text-sm appearance-none"
							placeholder="$"
							onChange={handleChangeSendToken}
						/>
						{error && <p className="text-red-500 text-xs mt-1">{error}</p>}
					</div>
					<div className="px-4 mb-4">
						<div className="mb-2 block">
							<Label
								htmlFor="clearAfter"
								value="Note"
								className="dark:text-[#B5BAC1] text-textLightTheme text-xs uppercase font-semibold"
							/>
						</div>
						<input
							type="text"
							defaultValue={'send token'}
							className="dark:text-[#B5BAC1] text-textLightTheme outline-none w-full h-10 p-[10px] dark:bg-bgInputDark bg-bgLightModeThird text-base rounded placeholder:text-sm appearance-none"
							placeholder="send token"
							onChange={handleChangeNote}
						/>
					</div>
					<div className="flex justify-end p-4 rounded-b dark:bg-[#2B2D31] bg-[#dedede]">
						<Button
							className="h-10 px-4 rounded bg-transparent dark:bg-transparent hover:!bg-transparent hover:!underline focus:!ring-transparent dark:text-textDarkTheme text-textLightTheme"
							type="button"
							onClick={onClose}
						>
							Cancel
						</Button>
						<Button
							className="h-10 px-4 rounded bg-bgSelectItem dark:bg-bgSelectItem hover:!bg-bgSelectItemHover focus:!ring-transparent"
							type="button"
							onClick={handleSaveSendToken}
						>
							Send
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
};

type ItemSelectProps = {
	children: ReactNode;
	dropdown?: boolean;
	startIcon?: ReactNode;
	onClick?: () => void;
};

const ItemSelect = ({ children, dropdown, startIcon, onClick }: ItemSelectProps) => {
	return (
		<div
			onClick={onClick}
			className="flex items-center justify-between h-11 rounded-sm dark:bg-bgInputDark bg-bgLightModeThird cursor-pointer  dark:hover:bg-zinc-700 hover:bg-bgLightMode dark:hover:[&>li]:text-[#fff] hover:[&>li]:text-[#000] px-3"
		>
			{startIcon && <div className="flex items-center justify-center h-[18px] w-[18px] mr-2">{startIcon}</div>}
			<li className="text-[14px] dark:text-[#B5BAC1] text-[#777777] w-full list-none leading-[44px]">{children}</li>
			<Icons.Check className="w-[18px] h-[18px]" />
		</div>
	);
};

export default ModalSendToken;
