import { DmTopbar } from '@mezon/components';
import { useAppNavigation, useAppParams } from '@mezon/core';
import { useEffect } from 'react';
import ChannelMessages from '../../channel/ChanneMessages';

export default function DirectMessageIndex() {
	const { directId } = useAppParams();
	const { navigate } = useAppNavigation();

	useEffect(() => {
		if (!directId) {
			navigate(`../friends`);
		}
	}, [directId, navigate]);

	return (
		<div className="flex flex-col flex-1 shrink min-w-0 bg-bgSecondary h-[100%]">
			<DmTopbar.Skeleton />
			<div className="flex h-heightWithoutTopBar flex-row ">
				<div className="flex flex-col flex-1">
					<div className="overflow-y-auto bg-bgSecondary  max-h-heightMessageViewChat h-heightMessageViewChat">
						<ChannelMessages.Skeleton />
					</div>
				</div>
			</div>
		</div>
	);
}
