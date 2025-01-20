import { useAppNavigation, useMenu } from '@mezon/core';
import {
	ChannelsEntity,
	channelsActions,
	selectChannelById,
	selectCurrentClan,
	selectCurrentVoiceChannelId,
	selectShowScreen,
	useAppDispatch
} from '@mezon/store';
import { Icons } from '@mezon/ui';
import { ChannelType } from 'mezon-js';
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export type VoiceControlPanelProps = {
	readonly channelCurrent: ChannelsEntity | null | undefined;
};

function VoiceControlPanel({ channelCurrent }: VoiceControlPanelProps) {
	const dispatch = useAppDispatch();
	const currentClan = useSelector(selectCurrentClan);
	const showScreen = useSelector(selectShowScreen);
	const currentVoiceChannelId = useSelector(selectCurrentVoiceChannelId);
	const currentVoiceChannel = useSelector((state) => selectChannelById(state, currentVoiceChannelId));

	const startScreenShare = useCallback(() => {
		console.error('not implemented');
	}, []);

	const stopScreenShare = useCallback(() => {
		console.error('not implemented');
	}, []);

	const leaveVoiceChannel = useCallback(() => {
		console.error('not implemented');
	}, []);

	const openCamera = useCallback(() => {
		console.error('not implemented');
	}, []);

	const { toChannelPage } = useAppNavigation();
	const channelPath = toChannelPage(currentVoiceChannelId, currentVoiceChannel?.clan_id || '');

	useEffect(() => {
		if (channelCurrent?.type === ChannelType.CHANNEL_TYPE_GMEET_VOICE) {
			dispatch(channelsActions.setCurrentVoiceChannelId(channelCurrent.id));
		}
	}, []);

	const { setStatusMenu } = useMenu();
	const handleClick = () => {
		setStatusMenu(false);
	};

	return (
		<div className="p-2 absolute w-full bottom-[57px] dark:bg-bgSecondary600 bg-bgLightModeThird border-b-[1px] border-borderDivider">
			<div className="flex items-center gap-2 justify-between">
				<div>
					<div className="flex items-center whitespace-nowrap text-ellipsis overflow-hidden pb-[2px]">
						<WifiButton />
						<button>
							<div className="text-[14px] font-bold text-green-600 hover:underline">Voice Connected</div>
						</button>
					</div>

					<button className="text-[12px] font-normal dark:text-gray-400 text-colorTextLightMode hover:underline" onClick={handleClick}>
						<Link to={channelPath}>
							{currentVoiceChannel?.channel_label}/ {currentClan?.clan_name}
						</Link>
					</button>
				</div>
				<div className="flex">
					<button className="button w-[20px] h-[20px]">
						<Icons.LookBlankIcon />
					</button>
					<button className="button" onClick={leaveVoiceChannel}>
						<Icons.PhoneIcon />
					</button>
				</div>
			</div>
			<div className="actionButtons">
				<div className="flex items-center button-icon dark:bg-bgPrimary bg-bgModifierHoverLight hover:bg-bgLightModeButton dark:hover:bg-bgSecondary group">
					<button className="w-[18px] h-[20px]" onClick={openCamera}>
						<Icons.CameraIcon />
					</button>
				</div>
				<div className="flex items-center button-icon dark:bg-bgPrimary bg-bgModifierHoverLight hover:bg-bgLightModeButton dark:hover:bg-bgSecondary group">
					<button className="w-[18px] h-[20px]" onClick={showScreen ? stopScreenShare : startScreenShare}>
						<Icons.ShareIcon />
					</button>
				</div>
				<div className="flex items-center button-icon dark:bg-bgPrimary bg-bgModifierHoverLight hover:bg-bgLightModeButton dark:hover:bg-bgSecondary group">
					<button className="w-[18px] h-[20px]">
						<Icons.RocketIcon />
					</button>
				</div>
				<div className="flex items-center button-icon dark:bg-bgPrimary bg-bgModifierHoverLight hover:bg-bgLightModeButton dark:hover:bg-bgSecondary group">
					<button className="w-[18px] h-[20px]">
						<Icons.BellIcon />
					</button>
				</div>
			</div>
		</div>
	);
}

function WifiButton() {
	return (
		<button className="text-green-600 mr-[4px] ">
			<Icons.WifiIcon />
		</button>
	);
}

export default VoiceControlPanel;
