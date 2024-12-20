import {
	auditLogList,
	selectActionAuditLog,
	selectAllAuditLogData,
	selectChannelById,
	selectCurrentClan,
	selectMemberClanByUserId,
	selectRoleByRoleId,
	selectTotalCountAuditLog,
	selectUserAuditLog,
	useAppDispatch,
	useAppSelector
} from '@mezon/store';
import { Icons } from '@mezon/ui';
import { ActionLog, convertTimeString, createImgproxyUrl, getAvatarForPrioritize } from '@mezon/utils';
import { ApiAuditLog } from 'mezon-js/api.gen';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AvatarImage } from '../../../AvatarImage/AvatarImage';

interface MainAuditLogProps {
	pageSize: number;
	setPageSize: Dispatch<SetStateAction<number>>;
	currentPage: number;
	setCurrentPage: Dispatch<SetStateAction<number>>;
	selectedDate: string;
}

const MainAuditLog = ({ pageSize, setPageSize, currentPage, setCurrentPage, selectedDate }: MainAuditLogProps) => {
	const auditLogData = useSelector(selectAllAuditLogData);
	const totalCount = useSelector(selectTotalCountAuditLog);
	const currentClan = useSelector(selectCurrentClan);
	const auditLogFilterAction = useSelector(selectActionAuditLog);
	const auditLogFilterUser = useSelector(selectUserAuditLog);
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (currentClan?.clan_id) {
			const body = {
				noCache: true,
				actionLog: auditLogFilterAction ?? '',
				userId: auditLogFilterUser?.userId ?? '',
				clanId: currentClan?.clan_id ?? '',
				date_log: selectedDate
			};
			dispatch(auditLogList(body));
		}
	}, [selectedDate]);

	return (
		<div className="flex flex-col">
			<div className="border-b-[1px] dark:border-[#616161] my-[32px]" />
			{auditLogData && auditLogData.length > 0 ? (
				auditLogData.map((log) => <AuditLogItem key={log.id} logItem={log} />)
			) : (
				<div className="flex flex-col items-center justify-center text-center py-10 max-w-[440px] mx-auto">
					<div className="flex flex-col items-center justify-center text-center max-w-[300px]">
						<div className="text-lg font-semibold text-gray-300">NO LOGS YET</div>
						<p className="text-gray-500 mt-2">Once moderators begin moderating, you can moderate the moderation here.</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default MainAuditLog;

type AuditLogItemProps = {
	logItem: ApiAuditLog;
};

const AuditLogItem = ({ logItem }: AuditLogItemProps) => {
	const auditLogTime = convertTimeString(logItem?.time_log as string);
	const userAuditLogItem = useAppSelector(selectMemberClanByUserId(logItem?.user_id ?? ''));
	const userName = userAuditLogItem?.user?.username;
	const userMention = useAppSelector(selectMemberClanByUserId(logItem?.entity_id ?? ''));
	const clanRole = useSelector(selectRoleByRoleId(logItem?.entity_id ?? ''));
	const userNameMention = userMention?.user?.username;
	const channel = useAppSelector((state) => selectChannelById(state, logItem?.channel_id || ''));
	const avatar = getAvatarForPrioritize(userAuditLogItem?.clan_avatar, userAuditLogItem?.user?.avatar_url);

	return (
		<div className="dark:text-[#b5bac1] text-textLightTheme p-[10px] flex gap-3 items-center border dark:border-black border-[#d1d4d9] rounded-md dark:bg-[#2b2d31] bg-bgLightSecondary mb-4">
			<div className="w-10 h-10 rounded-full">
				<div className="w-10 h-10">
					{userAuditLogItem ? (
						<AvatarImage
							alt={userName || ''}
							userName={userName}
							className="min-w-10 min-h-10 max-w-10 max-h-10"
							srcImgProxy={createImgproxyUrl(avatar ?? '', { width: 300, height: 300, resizeType: 'fit' })}
							src={avatar}
						/>
					) : (
						<Icons.AvatarUser />
					)}
				</div>
			</div>
			<div>
				<div className="">
					{(logItem?.action_log === ActionLog.ADD_MEMBER_CHANNEL_ACTION_AUDIT ||
						logItem?.action_log === ActionLog.REMOVE_MEMBER_CHANNEL_ACTION_AUDIT ||
						logItem?.action_log === ActionLog.ADD_ROLE_CHANNEL_ACTION_AUDIT ||
						logItem?.action_log === ActionLog.REMOVE_ROLE_CHANNEL_ACTION_AUDIT ||
						logItem?.action_log === ActionLog.ADD_MEMBER_THREAD_ACTION_AUDIT ||
						logItem?.action_log === ActionLog.REMOVE_MEMBER_THREAD_ACTION_AUDIT ||
						logItem?.action_log === ActionLog.ADD_ROLE_THREAD_ACTION_AUDIT ||
						logItem?.action_log === ActionLog.REMOVE_ROLE_THREAD_ACTION_AUDIT) &&
					logItem?.channel_id !== '0' ? (
						<span>
							<span>{userName}</span>{' '}
							<span className="lowercase">
								{logItem?.action_log === ActionLog.ADD_MEMBER_CHANNEL_ACTION_AUDIT ||
								logItem?.action_log === ActionLog.ADD_ROLE_CHANNEL_ACTION_AUDIT ||
								logItem?.action_log === ActionLog.ADD_MEMBER_THREAD_ACTION_AUDIT ||
								logItem?.action_log === ActionLog.ADD_ROLE_THREAD_ACTION_AUDIT
									? 'add'
									: 'remove'}{' '}
								{logItem?.action_log === ActionLog.ADD_MEMBER_CHANNEL_ACTION_AUDIT ||
								logItem?.action_log === ActionLog.REMOVE_MEMBER_CHANNEL_ACTION_AUDIT ||
								logItem?.action_log === ActionLog.ADD_MEMBER_THREAD_ACTION_AUDIT ||
								logItem?.action_log === ActionLog.REMOVE_MEMBER_THREAD_ACTION_AUDIT
									? userNameMention
									: clanRole?.title}{' '}
								({logItem?.entity_id}) to channel
							</span>
							<strong className="dark:text-white text-black font-medium">
								{' '}
								#{channel?.channel_label || logItem.channel_label} ({channel?.channel_id || logItem.channel_id})
							</strong>
						</span>
					) : (
						<span>
							<span>{userName}</span> <span className="lowercase">{logItem?.action_log}</span>
							<strong className="dark:text-white text-black font-medium">
								{' '}
								#{logItem?.entity_name || logItem?.entity_id} {logItem?.entity_name && `(${logItem?.entity_id})`}
							</strong>
						</span>
					)}
				</div>
				<div className="text-sm text-gray-500">{auditLogTime}</div>
			</div>
		</div>
	);
};
