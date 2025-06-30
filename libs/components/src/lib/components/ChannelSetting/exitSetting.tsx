import { Icons } from '@mezon/ui';

export type ModalExitProps = {
	onClose: () => void;
};
const ExitSetting = (props: ModalExitProps) => {
	const { onClose } = props;
	const handleClose = () => {
		onClose();
	};

	return (
<<<<<<< HEAD
		<div className="dark:bg-bgPrimary bg-white w-1/12 xl:w-1/5 flex-grow hidden sbm:block">
			<div className="w-1/4 text-black ml-5 pt-[94px]">
				<div className="w-fit flex flex-col items-center gap-2 text-bgPrimary dark:text-[#a8a6a6] group">
					<div
						onClick={handleClose}
						className="rounded-full p-[10px] border-2 hover:bg-bgLightModeThird dark:bg-transparent dark:group-hover:text-white dark:border-[#a8a6a6] dark:group-hover:border-white border-black cursor-pointer"
					>
=======
		<div className=" w-1/12 xl:w-1/5 flex-grow hidden sbm:block">
			<div className="w-1/4 ml-5 pt-[94px]">
				<div className="w-fit flex flex-col items-center gap-2 group">
					<div onClick={handleClose} className="rounded-full p-[10px] border-2 border-theme-primary cursor-pointer">
>>>>>>> 06ab538934c3ae1bbe6b509c2aa723ac47503acc
						<Icons.CloseButton className="w-4" />
					</div>
					<div className="font-semibold text-[13px] ">ESC</div>
				</div>
			</div>
		</div>
	);
};

export default ExitSetting;
