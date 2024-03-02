import { useAppNavigation, useAppParams } from '@mezon/core';
import { selectDefaultChannelIdByClanId } from '@mezon/store';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import ChannelMessages from './ChanneMessages';

export function ChannelIndex() {
	const { clanId } = useAppParams();
	const defaultChannelId = useSelector(selectDefaultChannelIdByClanId(clanId || ''));
	const { navigate } = useAppNavigation();

	useEffect(() => {
		if (defaultChannelId) {
			navigate(`./${defaultChannelId}`);
		}
	}, [defaultChannelId, navigate]);

	return (
		<div className="flex flex-col flex-1 shrink min-w-0 bg-bgSecondary h-[100%] overflow-hidden">
				<div className="flex h-heightWithoutTopBar flex-row ">
					<div className="flex flex-col flex-1 w-full h-full">
						<div className="overflow-y-auto bg-[#1E1E1E] max-w-widthMessageViewChat overflow-x-hidden max-h-heightMessageViewChat h-heightMessageViewChat">
							<ChannelMessages.Skeleton />
						</div>
						<div className="flex-shrink-0 flex flex-col bg-[#1E1E1E] h-auto">
							<ChannelMessages.Skeleton />
						</div>
					</div>
					(
					{/* <div className="w-[245px] bg-bgSurface  lg:flex hidden text-[#84ADFF]">
						<MemberList />
					</div> */}
					)
				</div>
			</div>
	);
}
