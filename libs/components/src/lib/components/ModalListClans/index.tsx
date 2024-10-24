import { selectBadgeCountByClanId, useAppDispatch } from '@mezon/store';
import { Image } from '@mezon/ui';
import { IClan } from '@mezon/utils';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import NavLinkComponent from '../NavLink';

export type SidebarClanItemProps = {
	option: IClan;
	linkClan: string;
	active?: boolean;
	pathname: string;
};

const SidebarClanItem = ({ option, linkClan, active, pathname }: SidebarClanItemProps) => {
	const currentClanPath = pathname.split('/channels')[0];
	const isSameClan = currentClanPath === linkClan;
	const dispatch = useAppDispatch();

	const handleClick = (e: React.MouseEvent) => {
		if (isSameClan) {
			e.preventDefault();
		}
	};

	const badgeCountClan = useSelector(selectBadgeCountByClanId(option.clan_id ?? '')) || 0;

	return (
		<div className="relative">
			<NavLink to={linkClan} onClick={handleClick}>
				<NavLinkComponent active={active}>
					{option.logo ? (
						<Image
							src={option.logo || ''}
							alt={option.clan_name || ''}
							placeholder="blur"
							width={48}
							blurdataurl={option.logo}
							className="min-w-12 min-h-12 object-cover clan"
						/>
					) : (
						option.clan_name && (
							<div className="w-[48px] h-[48px] dark:bg-bgTertiary bg-bgLightMode rounded-full flex justify-center items-center dark:text-contentSecondary text-textLightTheme text-[20px] clan">
								{(option.clan_name || '').charAt(0).toUpperCase()}
							</div>
						)
					)}
				</NavLinkComponent>
			</NavLink>
			{badgeCountClan > 0 ? (
				<div className="w-[20px] h-[20px] flex items-center justify-center text-[13px] font-medium rounded-full bg-colorDanger absolute bottom-[-3px] right-[-3px] border-[2px] border-solid dark:border-bgPrimary border-white">
					{badgeCountClan}
				</div>
			) : (
				<></>
			)}
		</div>
	);
};

export default SidebarClanItem;
