import { MemberList } from '@mezon/components';
import { selectCurrentChannel, selectIsShowMemberList } from '@mezon/store';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ChannelMessages from './ChanneMessages';
import { ChannelMessageBox } from './ChannelMessageBox';
import { ChannelTyping } from './ChannelTyping';

export default function ChannelLayout() {
	const isShow = useSelector(selectIsShowMemberList);
	const currentChanel = useSelector(selectCurrentChannel);

	const messagesContainerRef = useRef<HTMLDivElement>(null);

	const [isCloseEmoji, setIsCloseEmoji] = useState<boolean>(false);
	const handleCloseEmoji = () => {
		setIsCloseEmoji(!isCloseEmoji);
	};

	return (
		<div onClick={handleCloseEmoji} className="flex flex-col flex-1 shrink min-w-0 bg-bgSecondary h-[100%] overflow-hidden">
			<div className="flex h-heightWithoutTopBar flex-row ">
				<div className="flex flex-col flex-1 w-full h-full">
					<div
						className="overflow-y-auto bg-[#1E1E1E] max-w-widthMessageViewChat overflow-x-hidden max-h-heightMessageViewChat h-heightMessageViewChat"
						ref={messagesContainerRef}
					>
						{currentChanel ? <ChannelMessages channelId={currentChanel?.id} /> : <ChannelMessages.Skeleton />}
					</div>
					<div className="flex-shrink-0 flex flex-col bg-[#1E1E1E] h-auto relative">
						{currentChanel && <ChannelTyping channelId={currentChanel?.id} />}
						{currentChanel ? (
							<ChannelMessageBox clanId={currentChanel.clan_id} controlEmoji={isCloseEmoji} channelId={currentChanel?.id} />
						) : (
							<ChannelMessageBox.Skeleton />
						)}
					</div>
				</div>
				{isShow && (
					<div className="w-[245px] bg-bgSurface  lg:flex hidden text-[#84ADFF] relative">
						<MemberList />
					</div>
				)}
			</div>
		</div>
	);
}
