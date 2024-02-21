import { MemberProfile } from '@mezon/components';
import { ChannelMembersEntity, selectCurrentChannelId, selectMembersByChannelId } from '@mezon/store';
import { useSelector } from 'react-redux';

export type MemberListProps = { className?: string };

function MemberList() {
	const currentChannelId = useSelector(selectCurrentChannelId);
	const rawMembers = useSelector(selectMembersByChannelId(currentChannelId));
	return (
		<>
			<div className="self-stretch h-[268px] flex-col justify-start items-start flex p-[24px] pt-[16px] pr-[24px] pb-[16px] pl-[16px] gap-[24px]">
				{/* {members.map((role: any) => ( */}
				{/* <div key={role.id}> */}
				<div>
					{/* {role.title && ( */}
					<p className="mb-3 text-[#AEAEAE] text-[14px] font-bold flex items-center gap-[4px] font-title text-xs tracking-wide uppercase">
						{/* {role.title} */}
						MEMBER
					</p>
					{/* )} */}
					{
						<div className="flex flex-col gap-4">
							{/* {role?.users.filter((obj: ChannelMembersEntity) => obj.user?.online).map((user: ChannelMembersEntity) => ( */}
							{rawMembers
								.filter((obj: ChannelMembersEntity) => obj.user?.online)
								.map((user: ChannelMembersEntity) => (
									<MemberProfile
										numberCharacterCollapse={30}
										avatar={user?.user?.avatar_url ?? ''}
										name={user?.user?.username ?? ''}
										status={user.user?.online}
										isHideStatus={true}
										isHideIconStatus={false}
										key={user.id}
										textColor="[#AEAEAE]"
									/>
								))}
						</div>
					}
					{
						<div>
							<p className="mt-7 mb-3 text-[#AEAEAE] text-[14px] font-bold flex items-center gap-[4px] font-title text-xs tracking-wide uppercase">
								Offline
							</p>
							<div className="flex flex-col gap-4">
								{/* {role?.users.filter((obj: ChannelMembersEntity) => !obj.user?.online).map((user: ChannelMembersEntity) => ( */}
								{rawMembers
									.filter((obj: ChannelMembersEntity) => !obj.user?.online)
									.map((user: ChannelMembersEntity) => (
										<div key={user.id} className="opacity-60">
											<MemberProfile
												numberCharacterCollapse={30}
												avatar={user?.user?.avatar_url ?? ''}
												name={user?.user?.username ?? ''}
												status={user.user?.online}
												isHideStatus={true}
												isHideIconStatus={true}
												key={user.id}
												textColor="[#AEAEAE]"
											/>
										</div>
									))}
							</div>
						</div>
					}
				</div>
				{/* ))} */}
			</div>
		</>
	);
}

export default MemberList;
