import {
	channelsActions,
	ChannelsEntity,
	checkDuplicateChannelInCategory,
	checkDuplicateThread,
	selectAppChannelById,
	selectTheme,
	useAppDispatch
} from '@mezon/store';
import { Icons, Image, InputField, TextArea } from '@mezon/ui';
import { checkIsThread, IChannel, ValidateSpecialCharacters, ValidateURL } from '@mezon/utils';
import { unwrapResult } from '@reduxjs/toolkit';
import { Dropdown } from 'flowbite-react';
import { ApiUpdateChannelDescRequest, ChannelType } from 'mezon-js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import ModalAskChangeChannel from '../Modal/modalAskChangeChannel';

export type OverviewChannelProps = {
	channel: IChannel;
};

const OverviewChannel = (props: OverviewChannelProps) => {
	const { channel } = props;
	const appearanceTheme = useSelector(selectTheme);
	const channelApp = useSelector(selectAppChannelById(channel?.id) || {});
	const [appUrlInit, setAppUrlInit] = useState(channelApp?.url || '');
	const [appUrl, setAppUrl] = useState(appUrlInit);
	const dispatch = useAppDispatch();
	const [channelLabelInit, setChannelLabelInit] = useState(channel.channel_label || '');
	const [topicInit, setTopicInit] = useState('');
	const textAreaRef = useRef<HTMLTextAreaElement>(null);
	const [topic, setTopic] = useState(topicInit);
	const [channelLabel, setChannelLabel] = useState(channelLabelInit);
	const [checkValidate, setCheckValidate] = useState('');
	const [checkValidateUrl, setCheckValidateUrl] = useState(!ValidateURL().test(appUrlInit || ''));
	const [countCharacterTopic, setCountCharacterTopic] = useState(1024);
	const isThread = checkIsThread(channel as ChannelsEntity);

	const label = useMemo(() => {
		return isThread ? 'thread' : 'channel';
	}, [isThread]);

	const parentLabel = useMemo(() => {
		return isThread ? 'channel' : 'category';
	}, [isThread]);

	const messages = {
		INVALID_NAME: `Please enter a valid ${label} name (max 64 characters, only words, numbers, _ or -).`,
		DUPLICATE_NAME: `The ${label}  name already exists in the ${parentLabel} . Please enter another name.`,
		INVALID_URL: `Please enter a valid URL (e.g., https://example.com).`
	};

	const handleChangeTextArea = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setTopic(e.target.value);
			setCountCharacterTopic(1024 - e.target.value.length);
		},
		[topic, countCharacterTopic]
	);

	const debouncedSetChannelName = useDebouncedCallback(async (value: string) => {
		if (channelLabelInit && value.trim() === channelLabelInit.trim()) {
			setCheckValidate('');
			return;
		}

		const regex = ValidateSpecialCharacters();
		if (regex.test(value)) {
			const checkDuplicate = async (checkFunction: any, payload: any) => {
				await dispatch(checkFunction(payload))
					.then(unwrapResult)
					.then((result: any) => {
						if (result) {
							setCheckValidate(messages.DUPLICATE_NAME);
							return;
						}
						setCheckValidate('');
					});
			};

			if (isThread) {
				await checkDuplicate(checkDuplicateThread, {
					thread_name: value.trim(),
					channel_id: channel.parrent_id ?? ''
				});
			} else {
				await checkDuplicate(checkDuplicateChannelInCategory, {
					channelName: value.trim(),
					categoryId: channel.category_id ?? ''
				});
			}
			return;
		}

		setCheckValidate(messages.INVALID_NAME);
	}, 300);

	const handleDisplayChannelLabel = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setChannelLabel(value);
			debouncedSetChannelName(value);
		},
		[debouncedSetChannelName]
	);

	const handleDisplayAppUrl = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setAppUrl(value);
			const regex = ValidateURL();
			if (regex.test(value) && value !== '') {
				setCheckValidateUrl(false);
			} else {
				setCheckValidateUrl(true);
			}
		},
		[appUrl, checkValidateUrl]
	);

	const handleReset = useCallback(() => {
		setTopic(topicInit);
		setChannelLabel(channelLabelInit);
		setAppUrl(appUrlInit);
	}, [topicInit, channelLabelInit, appUrlInit]);

	const handleSave = useCallback(async () => {
		const updatedChannelLabel = channelLabel === channelLabelInit ? '' : channelLabel;
		const updatedAppUrl = appUrl === appUrlInit ? '' : appUrl;

		setChannelLabelInit(channelLabel);
		setAppUrlInit(appUrl);
		setTopicInit(topic);

		const updateChannel: ApiUpdateChannelDescRequest = {
			channel_id: channel.channel_id || '',
			channel_label: updatedChannelLabel,
			category_id: channel.category_id,
			app_url: updatedAppUrl
		};
		await dispatch(channelsActions.updateChannel(updateChannel));
	}, [channelLabel, channelLabelInit, appUrl, appUrlInit, topic, channel, dispatch]);

	useEffect(() => {
		const textArea = textAreaRef.current;
		if (textArea) {
			textArea.style.height = 'auto';
			textArea.style.height = textArea.scrollHeight + 'px';
		}
	}, [topic]);

	const slowModeValues = [
		'Off',
		'5 seconds',
		'10 seconds',
		'15 seconds',
		'30 seconds',
		'1 minute',
		'2 minutes',
		'5 minutes',
		'10 minutes',
		'15 minutes',
		'30 minutes',
		'1 hour',
		'2 hours',
		'6 hours'
	];

	const [slowModeDropdown, setSlowDropdown] = useState(slowModeValues[0]);

	const hideInactivityTimes = ['1 Hour', '24 Hours', '3 Days', '1 Week'];

	const [hideTimeDropdown, setHideTimeDropdown] = useState(hideInactivityTimes[2]);

	return (
		<div className="overflow-y-auto flex flex-col flex-1 shrink dark:bg-bgPrimary bg-bgLightModeSecond  w-1/2 pt-[94px] sbm:pb-7 sbm:pr-[10px] sbm:pl-[40px] p-4 overflow-x-hidden min-w-full sbm:min-w-[700px] 2xl:min-w-[900px] max-w-[740px] hide-scrollbar">
			<div className="dark:text-white text-black text-[15px]">
				<h3 className="mb-4 font-bold text-xl">Overview</h3>
				<p className="text-xs font-bold dark:text-textSecondary text-textSecondary800 uppercase mb-2">{label} name</p>
				<InputField
					type="text"
					placeholder={channelLabel}
					value={channelLabel}
					onChange={handleDisplayChannelLabel}
					className="dark:bg-black bg-white pl-3 py-2 w-full border-0 outline-none rounded"
					maxLength={Number(process.env.NX_MAX_LENGTH_NAME_ALLOWED)}
				/>
				{checkValidate && <p className="text-[#e44141] text-xs italic font-thin">{checkValidate}</p>}

				{channel.type === ChannelType.CHANNEL_TYPE_APP && (
					<>
						<hr className="border-t border-solid dark:border-borderDivider my-10" />
						<p className="text-xs font-bold dark:text-textSecondary text-textSecondary800 uppercase mb-2">App URL</p>
						<InputField
							type="text"
							placeholder={appUrl}
							value={appUrl}
							onChange={handleDisplayAppUrl}
							className="dark:bg-black bg-white pl-3 py-2 w-full border-0 outline-none rounded"
						/>
						{checkValidateUrl && <p className="text-[#e44141] text-xs italic font-thin">{messages.INVALID_URL}</p>}
					</>
				)}

				<hr className="border-t border-solid dark:border-borderDivider my-10" />
				<p className="text-xs font-bold dark:text-textSecondary text-textSecondary800 uppercase mb-2">{label} Topic</p>
				<div className="relative">
					<TextArea
						placeholder={`Let everyone know how to use this ${label}!`}
						className="resize-none h-auto min-h-[87px] w-full dark:bg-black bg-bgModifierHoverLight dark:text-white text-black overflow-y-hidden outline-none py-2 pl-3 pr-5 dark:border-none"
						value={topic}
						onChange={handleChangeTextArea}
						rows={1}
						refTextArea={textAreaRef}
						maxLength={1024}
					></TextArea>
					<p className="absolute bottom-2 right-2 text-[#AEAEAE]">{countCharacterTopic}</p>
				</div>
				<BottomBlock
					slowModeDropdown={slowModeDropdown}
					setSlowDropdown={setSlowDropdown}
					slowModeValues={slowModeValues}
					appearanceTheme={appearanceTheme}
					hideInactivityTimes={hideInactivityTimes}
					hideTimeDropdown={hideTimeDropdown}
					setHideTimeDropdown={setHideTimeDropdown}
				/>
			</div>
			{(channelLabelInit !== channelLabel || appUrlInit !== appUrl || topicInit !== topic) &&
				!checkValidate &&
				(!appUrl || !checkValidateUrl) && (
					<ModalAskChangeChannel onReset={handleReset} onSave={handleSave} className="relative mt-8 bg-transparent pr-0" />
				)}
		</div>
	);
};

interface IBottomBlockProps {
	slowModeValues: string[];
	appearanceTheme?: string;
	slowModeDropdown: string;
	setSlowDropdown: (value: string) => void;
	hideInactivityTimes: string[];
	hideTimeDropdown: string;
	setHideTimeDropdown: (value: string) => void;
}

const BottomBlock = ({
	slowModeValues,
	appearanceTheme,
	slowModeDropdown,
	setSlowDropdown,
	hideInactivityTimes,
	hideTimeDropdown,
	setHideTimeDropdown
}: IBottomBlockProps) => {
	const logoImgSrc = useMemo(() => {
		if (appearanceTheme === 'light') {
			return 'assets/images/channel_setting_logo_light.svg';
		}
		return 'assets/images/channel_setting_logo_dark.svg';
	}, [appearanceTheme]);

	return (
		<div className="flex flex-col gap-10 mt-10 text-sm text-colorTextLightMode dark:text-textPrimary">
			<hr className="border-t border-solid dark:border-borderDivider" />
			<div className="flex flex-col gap-2">
				<div className="text-xs font-bold dark:text-textSecondary text-textSecondary800 uppercase">SlowMode</div>
				<div className="w-full relative">
					<Dropdown
						trigger="click"
						renderTrigger={() => (
							<div className="w-full h-[50px] rounded-md dark:bg-[#1e1f22] bg-bgModifierHoverLight flex flex-row px-3 justify-between items-center">
								<p className="truncate max-w-[90%]">{slowModeDropdown}</p>
								<div>
									<Icons.ArrowDownFill />
								</div>
							</div>
						)}
						label=""
						placement="bottom-end"
						className={`dark:bg-black bg-white border-none ml-[3px] py-[6px] px-[8px] max-h-[200px] overflow-y-scroll w-[200px] ${appearanceTheme === 'light' ? 'customSmallScrollLightMode' : 'thread-scroll'} z-20`}
					>
						{slowModeValues.map((item, index) => {
							return <Dropdown.Item onClick={() => setSlowDropdown(item)} key={index} children={item} className="truncate" />;
						})}
					</Dropdown>
				</div>
				<div>
					Members will be restricted to sending one message and creating one thread per specified interval, unless they have ‘Manage
					Channel’ or ‘Manage Messages’ permissions.
				</div>
			</div>
			<hr className="border-t border-solid dark:border-borderDivider" />
			<div className="flex flex-col gap-3">
				<div className="flex justify-between">
					<div className="font-semibold text-base dark:text-white text-black">Age-Restricted Channel</div>
					<input
						className="peer relative h-4 w-8 cursor-pointer appearance-none rounded-lg
														bg-slate-300 transition-colors after:absolute after:top-0 after:left-0 after:h-4 after:w-4 after:rounded-full
														after:bg-slate-500 after:transition-all checked:bg-blue-200 checked:after:left-4 checked:after:bg-blue-500
														hover:bg-slate-400 after:hover:bg-slate-600 checked:hover:bg-blue-300 checked:after:hover:bg-blue-600
														focus:outline-none checked:focus:bg-blue-400 checked:after:focus:bg-blue-700 focus-visible:outline-none disabled:cursor-not-allowed
														disabled:bg-slate-200 disabled:after:bg-slate-300"
						type="checkbox"
					/>
				</div>
				<div>
					Users will need to confirm they are of legal age to view the content in this channel. Age-restricted channels are exempt from the
					explicit content filter.
				</div>
			</div>
			<hr className="border-t border-solid dark:border-borderDivider" />
			<div className="flex flex-col gap-2">
				<div className="text-xs font-bold dark:text-textSecondary text-textSecondary800 uppercase">Hide After Inactivity</div>
				<div className="w-full relative">
					<Dropdown
						trigger="click"
						renderTrigger={() => (
							<div className="w-full h-[50px] rounded-md dark:bg-[#1e1f22] bg-bgModifierHoverLight flex flex-row px-3 justify-between items-center">
								<p className="truncate max-w-[90%]">{hideTimeDropdown}</p>
								<div>
									<Icons.ArrowDownFill />
								</div>
							</div>
						)}
						label=""
						placement="bottom-end"
						className={`dark:bg-black bg-white border-none ml-[3px] py-[6px] px-[8px] max-h-[200px] overflow-y-scroll w-[200px] ${appearanceTheme === 'light' ? 'customSmallScrollLightMode' : 'thread-scroll'} z-20`}
					>
						{hideInactivityTimes.map((item, index) => {
							return <Dropdown.Item onClick={() => setHideTimeDropdown(item)} key={index} children={item} className="truncate" />;
						})}
					</Dropdown>
				</div>
				<div>New threads will not show in the channel list after being inactive for the specified duration.</div>
			</div>
			<div className="flex justify-center pb-10">
				<Image src={logoImgSrc} alt={'channelSettingLogo'} width={48} height={48} className="object-cover w-[280px]" />
			</div>
		</div>
	);
};

export default OverviewChannel;
