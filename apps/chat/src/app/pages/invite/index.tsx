import { useInvite } from '@mezon/core';
import { useNavigate, useParams } from 'react-router-dom';

import { authActions, channelsActions, inviteActions, selectInviteById, selectIsClickInvite, selectIsLogin, useAppDispatch } from '@mezon/store';
import { Button, Modal } from 'flowbite-react';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export default function InvitePage() {
	const { inviteId: inviteIdParam } = useParams();
	const selectInvite = useSelector(selectInviteById(inviteIdParam || ''));
	const navigate = useNavigate();
	const { inviteUser } = useInvite();
	const isLogin = useSelector(selectIsLogin);
	const dispatch = useDispatch();

	useEffect(() => {
		if (!isLogin) {
			dispatch(authActions.setRedirectUrl(`/invite/${inviteIdParam}`));
			navigate('/login');
		}
	}, [isLogin, inviteIdParam, dispatch, navigate]);

	const clanName = useMemo(() => {
		return selectInvite?.clan_name || '';
	}, [selectInvite]);
	const channelName = useMemo(() => {
		return selectInvite?.channel_label || '';
	}, [selectInvite]);
	const clanId = useMemo(() => {
		return selectInvite?.clan_id || '';
	}, [selectInvite]);
	const channeId = useMemo(() => {
		return selectInvite?.channel_id || '';
	}, [selectInvite]);
	const userJoined = useMemo(() => {
		return selectInvite?.user_joined;
	}, [selectInvite]);

	const joinChannel = async () => {
		if (inviteIdParam) {
			await inviteUser(inviteIdParam).then((res) => {
				if (res.channel_id && res.clan_id) {
					navigate(`/chat/clans/${res.clan_id}/channels/${res.channel_id}`);
				}
			});
			if (selectInvite.channel_desc) {
				const channel = { ...selectInvite.channel_desc, id: selectInvite.channel_desc.channel_id as string };
				dispatch(channelsActions.add({ clanId: selectInvite.channel_desc?.clan_id as string, channel: { ...channel, active: 1 } }));
			}
		}
	};

	const handleJoinChannel = () => {
		joinChannel();
		handleBackNavigate();
	};

	const isClickInvite = useSelector(selectIsClickInvite);
	const handleCancelJoin = () => {
		if (isClickInvite) navigate(-1);
		else navigate(`/chat/direct`);
		handleBackNavigate();
	};

	const appDispatch = useAppDispatch();
	const handleBackNavigate = () => {
		appDispatch(inviteActions.setIsClickInvite(false));
	};

	useEffect(() => {
		if (userJoined) {
			navigate(`/chat/clans/${clanId}/channels/${channeId}`);
			toast.info('You are already a member!');
		}
	}, []);

	return (
		<Modal show={!userJoined} size={'md'}>
			{/* <Modal.Header></Modal.Header> */}
			<Modal.Body className="bg-bgDisable rounded-tl-[5px] rounded-tr-[5px]">
				<div className="flex flex-col justify-center items-center pb-24">
					<div className="w-[70px] h-[70px] rounded-lg flex justify-center items-center text-contentSecondary text-[25px] bg-zinc-900 ">
						{clanName.charAt(0).toUpperCase()}
					</div>
					<p className="text-base text-gray-400 dark:text-gray-400 text-[18px] mt-3 ">You've been invited to join</p>
					<p className="text-4xl text-white font-semibold mt-4">{clanName}</p>
					{channelName && <p className="text-4xl text-white text-[18px]">#{channelName}</p>}
				</div>
			</Modal.Body>
			{/* <Modal.Footer> */}
			<div className="flex justify-center flex-row items-center gap-4 pb-8 bg-bgDisable rounded-bl-[5px] rounded-br-[5px]">
				<Button color="gray" className="outline-none font-semibold rounded" onClick={handleCancelJoin}>
					No, Thanks
				</Button>
				<Button color="blue" onClick={handleJoinChannel} className="font-semibold rounded">
					Join Mezon
				</Button>
			</div>
			{/* </Modal.Footer> */}
		</Modal>
	);
}
