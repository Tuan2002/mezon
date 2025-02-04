import { Icons } from '@mezon/ui';

interface IVideoButoonProps {
	isEnable: boolean;
}
export function VideoButoon({ isEnable }: IVideoButoonProps) {
	return (
		<div className="relative leading-5 h-6">
			<button className="focus-visible:outline-none" onContextMenu={(e) => e.preventDefault()}>
				{isEnable ? (
					<Icons.IconMeetDM className="size-6 dark:hover:text-white hover:text-black dark:text-[#B5BAC1] text-colorTextLightMode" />
				) : (
					<Icons.VideoDisable className="size-6 text-red-600" />
				)}
			</button>
		</div>
	);
}
