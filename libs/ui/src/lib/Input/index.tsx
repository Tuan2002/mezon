import { selectTheme } from '@mezon/store';
import React from 'react';
import { useSelector } from 'react-redux';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'dangerouslySetInnerHTML'> {
	type: string;
	label?: string;
	className?: string;
	required?: boolean;
	maxLength?: number;
	onkeypress?: any;
	needOutline?: boolean;
}

const InputField: React.FC<InputProps> = ({ type, className, maxLength, label, required, needOutline, ...rest }) => {
	const appearanceTheme = useSelector(selectTheme);
	return (
		<div className="w-full">
			<div className={'text-[14px]'}>
				{label}
				{required && <span className={'text-colorDanger'}> *</span>}
			</div>
			<input
				type={type}
				className={`bg-theme-input font-[400] text-theme-message px-[16px] rounded-lg w-full  ${needOutline ? '' : 'outline-none'}  ${className} `}
				{...rest}
				maxLength={maxLength}
				multiple
			/>
		</div>
	);
};

export default InputField;
