import { selectCurrentChannelId, selectCurrentClanId, selectTheme } from '@mezon/store';
import { handleUploadFile, useMezon } from '@mezon/transport';
import { TextArea, TimePicker } from '@mezon/ui';
import { ContenSubmitEventProps } from '@mezon/utils';
import { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import { ModalErrorTypeUpload, ModalOverData } from '../../../ModalError';
import { compareDate, compareTime } from '../timeFomatEvent';

export type EventInfoModalProps = {
	contentSubmit: ContenSubmitEventProps;
	choiceLocation: boolean;
	timeStartDefault: string;
	timeEndDefault: string;
	setErrorTime: (status: boolean) => void;
	setContentSubmit: React.Dispatch<React.SetStateAction<ContenSubmitEventProps>>;
};

const EventInfoModal = (props: EventInfoModalProps) => {
	const { contentSubmit, timeStartDefault, setErrorTime, setContentSubmit, choiceLocation } = props;
	const [countCharacterDescription, setCountCharacterDescription] = useState(1000);
	const [errorStart, setErrorStart] = useState(false);
	const [errorEnd, setErrorEnd] = useState(false);
	const [checkDaySame, setCheckDaySame] = useState(true);
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	const currentClanId = useSelector(selectCurrentClanId) || '';
	const currentChannelId = useSelector(selectCurrentChannelId) || '';

	const frequencies = [
		'Does not repeat',
		'Weekly on Friday',
		'Every other Friday',
		'Monthly on the first Friday',
		'Annually on 03 May',
		'Every weekday (Monday to Friday)',
	];

	const handleDateChangeStart = (date: Date) => {
		setContentSubmit((prev) => ({ ...prev, selectedDateStart: date }));
	};

	const handleDateChangeEnd = (date: Date) => {
		setContentSubmit((prev) => ({ ...prev, selectedDateEnd: date }));
		setCheckDaySame(compareDate(contentSubmit.selectedDateStart, date));
	};

	const handleChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setContentSubmit((prev) => ({ ...prev, description: e.target.value }));
		setCountCharacterDescription(1000 - e.target.value.length);
	};

	const handleChangeTimeStart = (e: any) => {
		const time = e.target.value;
		setContentSubmit((prev) => ({ ...prev, timeStart: time }));
		setErrorStart(!compareTime(timeStartDefault, time, true));
	};

	const handleChangeTimeEnd = (e: any) => {
		setContentSubmit((prev) => ({ ...prev, timeEnd: e.target.value }));
		if ((checkDaySame && compareTime(contentSubmit.timeStart, e.target.value)) || !checkDaySame) {
			setErrorEnd(false);
		} else {
			setErrorEnd(true);
		}
	};

	const appearanceTheme = useSelector(selectTheme);
	const [openModal, setOpenModal] = useState(false);
	const [openModalType, setOpenModalType] = useState(false);
	const { sessionRef, clientRef } = useMezon();
	const handleFile = (e: any) => {
		const file = e?.target?.files[0];
		const sizeImage = file?.size;
		const session = sessionRef.current;
		const client = clientRef.current;
		if (!file) return;
		if (!client || !session) {
			throw new Error('Client or file is not initialized');
		}
		const allowedTypes = ['image/jpeg', 'image/png'];
		if (!allowedTypes.includes(file.type)) {
			setOpenModalType(true);
			e.target.value = null;
			return;
		}

		if (sizeImage > 1000000) {
			setOpenModal(true);
			e.target.value = null;
			return;
		}
		handleUploadFile(client, session, currentClanId, currentChannelId, file?.name, file).then((attachment: any) => {
			setContentSubmit((prev) => ({ ...prev, logo: attachment.url ?? '' }));
		});
	};

	useEffect(() => {
		if (!checkDaySame) {
			setErrorEnd(false);
		}
		if (checkDaySame && !compareTime(contentSubmit.timeStart, contentSubmit.timeEnd) && choiceLocation) {
			setErrorEnd(true);
		}
	}, [checkDaySame, contentSubmit.timeStart, contentSubmit.timeEnd, choiceLocation]);

	useEffect(() => {
		if (errorEnd || errorStart) {
			setErrorTime(true);
		} else {
			setErrorTime(false);
		}
	}, [errorEnd, errorStart, setErrorTime]);

	return (
		<div className="max-h-[500px] overflow-y-auto hide-scrollbar">
			<div className="mb-4">
				<h3 className="uppercase text-[11px] font-semibold inline-flex gap-x-2">
					Event Topic
					<p className="w-fit h-fit text-left text-xs font-medium leading-[150%] text-[#dc2626]">✱</p>
				</h3>
				<input
					type="text"
					name="location"
					placeholder="What's your event?"
					onChange={(e) => setContentSubmit((prev) => ({ ...prev, topic: e.target.value }))}
					value={contentSubmit.topic}
					className={`font-[400] rounded w-full dark:text-white text-black outline-none text-[15px]border dark:border-black p-2 focus:outline-none focus:border-white-500 dark:bg-black bg-bgModifierHoverLight ${appearanceTheme === 'light' ? 'lightEventInputAutoFill' : ''}`}
					maxLength={64}
				/>
			</div>
			<div className="mb-4 flex gap-x-4">
				<div className="w-1/2">
					<h3 className="uppercase text-[11px] font-semibold inline-flex gap-x-2">
						Start Date
						<p className="w-fit h-fit text-left text-xs font-medium leading-[150%] text-[#dc2626]">✱</p>
					</h3>
					<DatePicker
						className="dark:bg-black bg-bgModifierHoverLight dark:text-white text-black p-2 rounded outline-none w-full"
						wrapperClassName="w-full"
						selected={contentSubmit.selectedDateStart}
						onChange={handleDateChangeStart}
						dateFormat="dd/MM/yyyy"
						minDate={new Date()}
					/>
				</div>
				<div className="w-1/2">
					<h3 className="uppercase text-[11px] font-semibold inline-flex gap-x-2">
						Start Time
						<p className="w-fit h-fit text-left text-xs font-medium leading-[150%] text-[#dc2626]">✱</p>
					</h3>
					<TimePicker value={contentSubmit.timeStart} name="timeStart" handleChangeTime={handleChangeTimeStart} />
				</div>
			</div>
			{choiceLocation && (
				<div className="mb-4 flex gap-x-4">
					<div className="w-1/2">
						<h3 className="uppercase text-[11px] font-semibold inline-flex gap-x-2">
							End Date
							<p className="w-fit h-fit text-left text-xs font-medium leading-[150%] text-[#dc2626]">✱</p>
						</h3>
						<DatePicker
							className="dark:bg-black bg-bgModifierHoverLight dark:text-white text-black p-2 rounded outline-none w-full"
							wrapperClassName="w-full"
							selected={contentSubmit.selectedDateEnd}
							onChange={handleDateChangeEnd}
							dateFormat="dd/MM/yyyy"
							minDate={new Date()}
						/>
					</div>
					<div className="w-1/2">
						<h3 className="uppercase text-[11px] font-semibold inline-flex gap-x-2">
							End Time
							<p className="w-fit h-fit text-left text-xs font-medium leading-[150%] text-[#dc2626]">✱</p>
						</h3>
						<TimePicker value={contentSubmit.timeEnd} name="timeEnd" handleChangeTime={handleChangeTimeEnd} />
					</div>
				</div>
			)}
			<div className="mb-4">
				<h3 className="uppercase text-[11px] font-semibold">Event Frequency</h3>
				<select
					name="frequency"
					className="block w-full dark:bg-black bg-bgModifierHoverLight dark:text-white text-black border dark:border-black rounded p-2 font-normal text-sm tracking-wide outline-none border-none"
				>
					{frequencies.map((frequency) => (
						<option key={frequency} value={frequency}>
							{frequency}
						</option>
					))}
				</select>
				{errorStart && <p className="text-[#e44141] text-xs font-thin">The start time must be in the future.</p>}
				{errorEnd && <p className="text-[#e44141] text-xs font-thin">The end time must be bigger than start time.</p>}
			</div>
			<div className="mb-4">
				<h3 className="uppercase text-[11px] font-semibold">Description</h3>
				<div className="relative">
					<TextArea
						placeholder="Let everyone know how to use this channel!"
						className="resize-none h-auto min-h-[87px] w-full dark:bg-black bg-bgModifierHoverLight dark:text-white text-black overflow-y-hidden outline-none py-2 pl-3 pr-5"
						value={contentSubmit.description}
						onChange={handleChangeTextArea}
						rows={1}
						refTextArea={textAreaRef}
						maxLength={1000}
					></TextArea>
					<p className="absolute bottom-2 right-2 text-[#AEAEAE]">{countCharacterDescription}</p>
				</div>
			</div>
			<div className="mb-4">
				<h3 className="uppercase text-[11px] font-semibold">Cover Image</h3>
				<label>
					<div
						className="text-white font-medium bg-bgSelectItem hover:bg-bgSelectItemHover rounded px-4 py-2 my-2 w-fit"
						onChange={(e) => handleFile(e)}
					>
						Upload Image
					</div>
					<input type="file" onChange={(e) => handleFile(e)} className="w-full text-sm text-slate-500 hidden" />
				</label>
				{contentSubmit.logo && <img src={contentSubmit.logo} alt="logo" className="max-h-[180px] rounded w-full object-cover" />}
			</div>
			<ModalOverData openModal={openModal} handleClose={() => setOpenModal(false)} />

			<ModalErrorTypeUpload openModal={openModalType} handleClose={() => setOpenModalType(false)} />
		</div>
	);
};

export default EventInfoModal;
