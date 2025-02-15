import { selectCurrentChannelId, selectDmGroupCurrentId, selectTypingUserIdsByChannelId, useAppSelector } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { EUserStatus } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import { directMessageValueProps } from '../DmList/DMListItem';
import { UserStatusIcon } from '../MemberProfile';

type StatusUserProps = {
	status?: { status?: boolean; isMobile?: boolean };
	isMemberDMGroup: boolean;
	isMemberChannel: boolean;
	isListDm: boolean;
	directMessageValue?: directMessageValueProps;
	userId?: string;
	isTyping?: boolean;
	sizeStatusIcon?: string;
	customStatus?: EUserStatus;
};

const StatusUser = memo((props: StatusUserProps) => {
	const {
		customStatus,
		status,
		isMemberChannel,
		isMemberDMGroup,
		isListDm,
		directMessageValue,
		userId = '',
		isTyping = true,
		sizeStatusIcon
	} = props;
	const currentDMChannelID = useSelector(selectDmGroupCurrentId);
	const currentChannelID = useSelector(selectCurrentChannelId);
	const typingListMemberDMIds = useAppSelector((state) => selectTypingUserIdsByChannelId(state, currentDMChannelID || ''));
	const typingListMemberChannelIds = useAppSelector((state) => selectTypingUserIdsByChannelId(state, currentChannelID || ''));
	const typingListDMIds = useAppSelector((state) => selectTypingUserIdsByChannelId(state, directMessageValue?.dmID || ''));
	const checkDmGroup = Number(directMessageValue?.type) === ChannelType.CHANNEL_TYPE_GROUP;

	let checkTypingUser = false;

	switch (true) {
		case isMemberDMGroup:
			checkTypingUser = !!typingListMemberDMIds?.some((item) => item.id === userId);
			break;
		case isMemberChannel:
			checkTypingUser = !!typingListMemberChannelIds?.some((item) => item.id === userId);
			break;

		case isListDm:
			checkTypingUser = !!typingListDMIds?.some((item) => directMessageValue?.userId?.includes(item.id));
			break;

		default:
			checkTypingUser = false;
			break;
	}

	const renderTypingIndicator = () => (
		<span
			className={`absolute bottom-0 inline-flex items-center justify-center gap-1 p-[3px] text-sm text-white dark:bg-bgSecondary bg-bgLightMode ${
				checkTypingUser ? 'rounded-lg -right-2' : 'rounded-full right-[-4px]'
			}`}
		>
			<Icons.IconLoadingTyping bgFill="bg-colorSuccess" />
		</span>
	);

	const renderStatusIcon = () => {
		if (isTyping && checkTypingUser) {
			return <Icons.IconLoadingTyping bgFill="bg-colorSuccess" />;
		}

		if (status?.status === false) {
			return <Icons.OfflineStatus defaultSize={sizeStatusIcon} />;
		}

		if (status?.status) {
			if (customStatus) {
				return <UserStatusIcon status={customStatus} />;
			}

			if (status?.isMobile) {
				return <Icons.IconMobileDevice defaultSize="w-3 h-3" />;
			}

			return <Icons.OnlineStatus defaultSize={sizeStatusIcon} />;
		}

		return <Icons.OfflineStatus defaultSize={sizeStatusIcon} />;
	};

	return checkDmGroup ? (
		isTyping && checkTypingUser ? (
			renderTypingIndicator()
		) : null
	) : (
		<span
			className={`absolute bottom-0 inline-flex items-center justify-center gap-1 p-[3px] text-sm text-white dark:bg-bgSecondary bg-bgLightMode ${
				checkTypingUser ? 'rounded-lg -right-2' : 'rounded-full right-[-4px]'
			}`}
		>
			{renderStatusIcon()}
		</span>
	);
});

export default StatusUser;
