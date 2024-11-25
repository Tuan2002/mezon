import { selectCurrentClanId, selectMemberClanByUserId, settingClanStickerActions, updateClanWebhookById, useAppDispatch } from '@mezon/store';
import { handleUploadFile, useMezon } from '@mezon/transport';
import { Icons } from '@mezon/ui';
import { ApiClanWebhook, ApiMessageAttachment, MezonUpdateClanWebhookByIdBody } from 'mezon-js/api.gen';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ModalSaveChanges from '../../../ClanSettingOverview/ModalSaveChanges';
import DeleteClanWebhookPopup from './DeleteWebhookPopup';

interface IClanWebhookItemModalProps {
	webhookItem: ApiClanWebhook;
}

const convertDate = (isoDateString: string): string => {
	const date = new Date(isoDateString);
	const options: Intl.DateTimeFormatOptions = {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	};
	return date.toLocaleDateString('en-GB', options);
};

const ClanWebhookItemModal = ({ webhookItem }: IClanWebhookItemModalProps) => {
	const [isExpand, setIsExpand] = useState(false);
	const webhookOwner = useSelector(selectMemberClanByUserId(webhookItem.creator_id as string));
	return (
		<div className="dark:bg-[#2b2d31] bg-bgLightMode p-[20px] border dark:border-black rounded-md mb-[20px]">
			<div className="flex gap-[20px] items-center">
				<img src={webhookItem.avatar} alt="Webhook avatar" className="aspect-square w-[50px] rounded-full" />
				<div className="flex w-full justify-between items-center dark:text-textDarkTheme text-textLightTheme">
					<div className="">
						<div>{webhookItem.webhook_name}</div>
						<div className="flex gap-1 items-center">
							<Icons.ClockIcon className="dark:text-[#b5bac1] text-textLightTheme" />
							<div className="dark:text-[#b5bac1] text-textLightTheme text-[13px]">
								Created on {convertDate(webhookItem.create_time || '')} by {webhookOwner?.user?.username}
							</div>
						</div>
					</div>
					<div
						onClick={() => setIsExpand(!isExpand)}
						className={`cursor-pointer transition duration-100 ease-in-out ${isExpand ? '' : '-rotate-90'}`}
					>
						<Icons.ArrowDown defaultSize="h-[30px] w-[30px] dark:text-[#b5bac1] text-black" />
					</div>
				</div>
			</div>
			{isExpand && <ExpendedClanWebhookModal webhookItem={webhookItem} />}
		</div>
	);
};

interface IExpendedClanWebhookModal {
	webhookItem: ApiClanWebhook;
}

interface IDataForUpdate {
	webhookNameInput: string | undefined;
	webhookAvatarUrl: string | undefined;
}

const ExpendedClanWebhookModal = ({ webhookItem }: IExpendedClanWebhookModal) => {
	const dispatch = useAppDispatch();
	const [isShowPopup, setIsShowPopup] = useState(false);
	const openShowPopup = () => {
		dispatch(settingClanStickerActions.openModalInChild());
		setIsShowPopup(true);
	};

	const handleCloseDeletePopup = useCallback(() => {
		setIsShowPopup(false);
		modalRef?.current?.focus();
		dispatch(settingClanStickerActions.closeModalInChild());
	}, []);

	const handleCopyUrl = (url: string) => {
		navigator.clipboard
			.writeText(url)
			.then(() => {
				toast.success('URL copied to clipboard!');
			})
			.catch((error) => {
				toast.error('Failed to copy URL');
				console.error('Copy failed:', error);
			});
	};
	const { sessionRef, clientRef } = useMezon();
	const currentClanId = useSelector(selectCurrentClanId);
	const avatarRef = useRef<HTMLInputElement>(null);

	const [dataForUpdate, setDataForUpdate] = useState<IDataForUpdate>({
		webhookAvatarUrl: webhookItem.avatar,
		webhookNameInput: webhookItem.webhook_name
	});

	useEffect(() => {
		setDataForUpdate({
			webhookAvatarUrl: webhookItem.avatar,
			webhookNameInput: webhookItem.webhook_name
		});
	}, []);

	const [hasChange, setHasChange] = useState<boolean>(false);

	useEffect(() => {
		const computeHasChanges =
			dataForUpdate.webhookNameInput !== webhookItem.webhook_name || dataForUpdate.webhookAvatarUrl !== webhookItem.avatar;

		setHasChange(computeHasChanges);
	}, [dataForUpdate.webhookNameInput, dataForUpdate.webhookAvatarUrl, webhookItem.webhook_name, webhookItem.avatar]);

	const handleChooseFile = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const client = clientRef.current;
			const session = sessionRef.current;
			if (!client || !session) {
				throw new Error('Client or file is not initialized');
			}
			handleUploadFile(client, session, currentClanId || '', '', e.target.files[0].name, e.target.files[0]).then(
				(attachment: ApiMessageAttachment) => {
					setDataForUpdate({
						...dataForUpdate,
						webhookAvatarUrl: attachment.url
					});
				}
			);
		}
	};
	const clanId = useSelector(selectCurrentClanId) as string;
	const handleEditWebhook = async () => {
		const request: MezonUpdateClanWebhookByIdBody = {
			avatar: dataForUpdate.webhookAvatarUrl,
			webhook_name: dataForUpdate.webhookNameInput,
			clan_id: clanId
		};
		await dispatch(
			updateClanWebhookById({
				request: request,
				webhookId: webhookItem.id,
				clanId: clanId
			})
		);
		setHasChange(false);
	};

	const handleResetToken = async () => {
		const request: MezonUpdateClanWebhookByIdBody = {
			avatar: dataForUpdate.webhookAvatarUrl,
			webhook_name: dataForUpdate.webhookNameInput,
			clan_id: clanId,
			reset_token: true
		};

		try {
			await dispatch(
				updateClanWebhookById({
					request: request,
					webhookId: webhookItem.id,
					clanId: clanId
				})
			);

			toast.success('Token reset successfully!');
		} catch (error) {
			toast.error('Failed to reset token');
		}
	};

	const handleResetChange = () => {
		setDataForUpdate({
			webhookAvatarUrl: webhookItem.avatar,
			webhookNameInput: webhookItem.webhook_name
		});
		setHasChange(false);
	};

	const modalRef = useRef<HTMLDivElement>(null);

	return (
		<>
			<div ref={modalRef} tabIndex={-1} className="pt-[20px] mt-[12px] border-t dark:border-[#3b3d44]">
				<div className="flex gap-2">
					<div className="w-3/12 dark:text-[#b5bac1] text-textLightTheme">
						<input onChange={handleChooseFile} ref={avatarRef} type="file" hidden />
						<div className="relative w-fit">
							<div className="absolute right-0 top-0 p-[5px] bg-[#ffffff] rounded-full z-10 shadow-xl border">
								<Icons.SelectFileIcon />
							</div>
							<img
								src={dataForUpdate.webhookAvatarUrl}
								alt="Webhook avatar"
								className="aspect-square w-[100px] rounded-full hover:grayscale-[50%] cursor-pointer"
								onClick={() => avatarRef.current?.click()}
							/>
						</div>
						<div className="text-[10px] mt-[10px] text-center">
							Minimum Size: <b>128x128</b>
						</div>
					</div>
					<div className="w-9/12">
						<div className="flex gap-6 w-full">
							<div className="w-1/2">
								<div className="dark:text-[#b5bac1] text-textLightTheme text-[12px] mb-[10px]">
									<b>NAME</b>
								</div>
								<input
									onChange={(e) =>
										setDataForUpdate({
											...dataForUpdate,
											webhookNameInput: e.target.value
										})
									}
									type="text"
									value={dataForUpdate.webhookNameInput}
									className="w-full dark:text-[#b5bac1] text-textLightTheme dark:bg-[#1e1f22] bg-bgLightModeThird p-[10px] rounded-sm outline-none h-[50px]"
								/>
							</div>
							<div className="w-1/2 dark:text-[#b5bac1] text-textLightTheme">
								<div
									onClick={() => handleResetToken()}
									className="mt-7 w-full text-white bg-green-700 hover:bg-green-500 flex justify-center items-center rounded-sm outline-none h-[50px]"
								>
									Reset Token
								</div>
							</div>
						</div>
						<div className="max-sm:hidden block">
							<div className="border-t dark:border-[#3b3d44] my-[24px]" />
							<div className="flex items-center gap-[20px]">
								<div
									onClick={() => handleCopyUrl(webhookItem.url as string)}
									className="font-medium px-4 py-2 dark:bg-[#4e5058] bg-[#808084] dark:hover:bg-[#808084] hover:bg-[#4e5058] rounded-sm cursor-pointer"
								>
									Copy Webhook URL
								</div>
								<div onClick={openShowPopup} className="font-medium text-red-500 hover:underline cursor-pointer">
									Delete Webhook
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="max-sm:block hidden">
					<div className="border-t dark:border-[#3b3d44] my-[24px]" />
					<div className="flex items-center gap-[20px]">
						<div
							onClick={() => handleCopyUrl(webhookItem.url as string)}
							className="font-medium px-4 py-2 dark:bg-[#4e5058] bg-[#808084] dark:hover:bg-[#808084] hover:bg-[#4e5058] rounded-sm cursor-pointer"
						>
							Copy Clan Webhook URL
						</div>
						<div onClick={openShowPopup} className="font-medium text-red-500 hover:underline cursor-pointer">
							Delete Clan Webhook
						</div>
					</div>
				</div>
			</div>
			{hasChange && <ModalSaveChanges onSave={handleEditWebhook} onReset={handleResetChange} />}
			{isShowPopup && <DeleteClanWebhookPopup webhookItem={webhookItem} closeShowPopup={handleCloseDeletePopup} />}
		</>
	);
};

export default ClanWebhookItemModal;
