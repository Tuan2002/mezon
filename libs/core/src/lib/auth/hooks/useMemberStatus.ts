import { selectMemberCustomStatusById, selectMemberStatusById, useAppSelector } from '@mezon/store';
import { UsersClanEntity } from '@mezon/utils';
import { safeJSONParse } from 'mezon-js';
import { useMemo } from 'react';
import { useAuth } from './useAuth';

export function useMemberStatus(memberId: string) {
	const memberStatus = useAppSelector((state) => selectMemberStatusById(state, memberId));

	return {
		status: memberStatus.status,
		isMobile: memberStatus.isMobile
	};
}

export function useMemberCustomStatus(memberId: string, isDM?: boolean) {
	const memberStatus = useAppSelector((state) => selectMemberCustomStatusById(state, memberId, isDM));
	return memberStatus;
}

export function useMemberActiveStatus(user: UsersClanEntity) {
	const { userProfile } = useAuth();
	const status = useMemo(() => {
		if (user?.user?.metadata) {
			return user?.user?.metadata;
		}
		if (userProfile?.user?.metadata) {
			const metadata = safeJSONParse(userProfile?.user?.metadata);
			return metadata;
		}
	}, [user?.user?.metadata, userProfile?.user?.metadata]);

	return status?.user_status;
}
