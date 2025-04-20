import { useAuth } from '@mezon/core';
import { createApplication, useAppDispatch } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { ApiAddAppRequest } from 'mezon-js/api.gen';
import { FormEvent, useState } from 'react';

interface ICreateAppPopup {
	togglePopup: () => void;
}

type CreationType = 'application' | 'bot';

const CreateAppPopup = ({ togglePopup }: ICreateAppPopup) => {
	const [formValues, setFormValues] = useState({
		name: '',
		url: ''
	});
	const [isUrlValid, setIsUrlValid] = useState(true);
	const [isCheckedForPolicy, setIsChecked] = useState(false);
	const [isShadowBot, setIsShadowBot] = useState(false);
	const [notification, setNotification] = useState<React.JSX.Element | null>(null);
	const [creationType, setCreationType] = useState<CreationType>('application');
	const { userProfile } = useAuth();
	const dispatch = useAppDispatch();
	const typeApplication = creationType === 'application';
	const isFormValid = !!formValues.name && (creationType === 'bot' || (formValues.url !== '' && isUrlValid)) && isCheckedForPolicy;

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!formValues.name) {
			setNotification(
				<div className="p-3 dark:bg-[#6b373b] bg-[#fbc5c6] border border-red-500 rounded-md">
					A name is required to create your new {creationType}.
				</div>
			);
			return;
		}
		if (typeApplication) {
			if (!formValues.url) {
				setNotification(
					<div className="p-3 dark:bg-[#6b373b] bg-[#fbc5c6] border border-red-500 rounded-md">
						URL is required to create your new application.
					</div>
				);
				return;
			}
			if (!isUrlValid) {
				setNotification(
					<div className="p-3 dark:bg-[#6b373b] bg-[#fbc5c6] border border-red-500 rounded-md">
						Please enter a valid URL (e.g., https://example.com).
					</div>
				);
				return;
			}
		}

		setNotification(null);
		const createRequest: ApiAddAppRequest = {
			appname: formValues.name,
			creator_id: userProfile?.user?.id ?? '',
			role: 0,
			is_shadow: isShadowBot,
			app_url: typeApplication ? formValues.url : ''
		};
		await dispatch(createApplication({ request: createRequest }));
		togglePopup();
	};

	const handleTogglePolicyCheckBox = () => {
		setIsChecked(!isCheckedForPolicy);
	};

	const handleCheckForShadow = () => {
		setIsShadowBot(!isShadowBot);
	};

	const handleInputOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormValues((prev) => ({
			...prev,
			[name]: value
		}));

		if (name === 'url') {
			try {
				new URL(value);
				setIsUrlValid(true);
			} catch {
				setIsUrlValid(false);
			}
		}
	};
	const handleCreationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedType = e.target.value as CreationType;
		setCreationType(selectedType);
		if (selectedType === 'bot') {
			setFormValues((prev) => ({ ...prev, url: '' }));
			setIsUrlValid(true);
		}
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center z-50 bg-[#000000c9]">
			<form className="relative z-10 w-[450px]" onSubmit={handleSubmit}>
				<div className="dark:bg-[#313338] bg-white pt-[16px] px-[16px] flex flex-col gap-5 pb-5 rounded-t-md">
					<div className="dark:text-textDarkTheme text-textLightTheme text-[20px] font-semibold">
						Create a {typeApplication ? 'new application' : 'bot'}
					</div>
					{notification}
					<div className="flex flex-col gap-2">
						<div className="text-[12px] font-semibold">
							TYPE <span className="text-red-600">*</span>
						</div>
						<select
							value={creationType}
							onChange={handleCreationTypeChange}
							className="bg-bgLightModeThird dark:bg-[#1e1f22] outline-primary p-[10px] rounded-sm"
						>
							<option value="application">Create an application</option>
							<option value="bot">Create a Bot</option>
						</select>
					</div>

					<div className="flex flex-col gap-2">
						<div className="text-[12px] font-semibold">
							NAME <span className="text-red-600">*</span>
						</div>
						<input
							name="name"
							value={formValues.name}
							onChange={handleInputOnchange}
							type="text"
							className="bg-bgLightModeThird dark:bg-[#1e1f22] outline-primary p-[10px] rounded-sm"
						/>
					</div>
					{typeApplication && (
						<div className="flex flex-col gap-2">
							<div className="text-[12px] font-semibold">
								URL <span className="text-red-600">*</span>
							</div>
							<input
								name="url"
								value={formValues.url}
								onChange={handleInputOnchange}
								type="text"
								className="bg-bgLightModeThird dark:bg-[#1e1f22] outline-primary p-[10px] rounded-sm"
							/>
							{!isUrlValid && <div className="text-red-500 text-sm">Please enter a valid URL (e.g., https://example.com).</div>}
						</div>
					)}
					{creationType === 'bot' && (
						<div className="flex gap-2">
							<input checked={isShadowBot} onChange={handleCheckForShadow} type="checkbox" className="w-6" />
							<div className="flex-1 flex gap-1">
								<div>Shadow Bot </div>
								<Icons.ShadowBotIcon className="w-6" />
							</div>
						</div>
					)}
					<div className="flex gap-2">
						<input checked={isCheckedForPolicy} onChange={handleTogglePolicyCheckBox} type="checkbox" className="w-6" />
						<div className="flex-1">
							By clicking Create, you agree to the Mezon{' '}
							<span className="text-blue-500 hover:underline">Developer Terms of Service</span> and{' '}
							<span className="text-blue-500 hover:underline">Developer Policy</span>
						</div>
					</div>
				</div>
				<div className="dark:bg-[#2b2d31] bg-[#f2f3f5] dark:text-textDarkTheme text-textLightTheme flex justify-end items-center gap-4 p-[16px] text-[14px] font-medium border-t dark:border-[#1e1f22] rounded-b-md">
					<div className="hover:underline cursor-pointer" onClick={togglePopup}>
						Cancel
					</div>
					<button
						type="submit"
						disabled={!isFormValid}
						className={`rounded px-[20px] py-[9px] cursor-pointer text-white ${isFormValid ? 'bg-blue-600 hover:bg-blue-800' : 'bg-gray-400 cursor-not-allowed'}`}
					>
						Create
					</button>
				</div>
			</form>
		</div>
	);
};

export default CreateAppPopup;
