import { useMemo } from 'react';

type TimePickerProps = {
	name: string;
	value: string;
	handleChangeTime: (e: any) => void;
};

function TimePicker(props: TimePickerProps) {
	const { name, value, handleChangeTime } = props;
	// if value is H:MM => HH:MM
	const formattedValue = useMemo(() => {
		const [hour, minute] = value.split(':');
		const normalizedHour = hour.padStart(2, '0');
		const normalizedMinute = minute.padStart(2, '0');
		return `${normalizedHour}:${normalizedMinute}`;
	}, [value]);
	const renderOptions = useMemo(() => {
		const options = [];
		for (let hour = 0; hour < 24; hour++) {
			for (let minute = 0; minute < 60; minute += 15) {
				const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
				options.push(
					<option key={timeString} value={timeString}>
						{timeString}
					</option>
				);
			}
		}
		return options;
	}, []);

	return (
		<select
			name={name}
			onChange={handleChangeTime}
			className="block w-full dark:bg-black bg-bgModifierHoverLight dark:text-white text-black border dark:border-black rounded p-2 font-normal text-sm tracking-wide outline-none border-none"
			value={formattedValue}
		>
			{renderOptions}
		</select>
	);
}

export default TimePicker;
