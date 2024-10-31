import { directActions, useAppDispatch } from '@mezon/store';
import { ChannelType } from 'mezon-js';
import { ApiCreateChannelDescRequest } from 'mezon-js/api.gen';
import { useCallback, useMemo } from 'react';

export function useSilentSendMess() {
	const dispatch = useAppDispatch();
	const createSilentSendMess = useCallback(
		async (userId: string) => {
			const bodyCreateDm: ApiCreateChannelDescRequest = {
				type: ChannelType.CHANNEL_TYPE_DM,
				channel_private: 1,
				user_ids: [userId],
				clan_id: '0'
			};
			const response = await dispatch(directActions.createNewDirectMessage(bodyCreateDm));
			const resPayload = response.payload as ApiCreateChannelDescRequest;

			return resPayload;
		},
		[dispatch]
	);

	return useMemo(
		() => ({
			createSilentSendMess
		}),
		[createSilentSendMess]
	);
}
