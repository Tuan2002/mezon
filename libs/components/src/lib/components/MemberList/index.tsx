import { ChannelsEntity, selectCloseMenu, selectCurrentChannel, useAppSelector } from '@mezon/store';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import ListMember from './listMember';

export type MemberListProps = { className?: string };

function MemberList() {
	const currentChannel = useAppSelector(selectCurrentChannel);
	return <MemberListContent currentChannel={currentChannel} />;
}

const MemberListContent = memo(({ currentChannel }: { currentChannel: ChannelsEntity | null }) => {
	const closeMenu = useSelector(selectCloseMenu);
	return (
		<div className={`self-stretch h-full flex-col justify-start items-start flex gap-[24px] w-full ${closeMenu ? 'pt-20' : 'pt-0'}`}>
			<div className="w-full">
				<div className="flex flex-col gap-4 pr-[2px]">
					<ListMember />
				</div>
			</div>
		</div>
	);
});

export default memo(MemberList);
