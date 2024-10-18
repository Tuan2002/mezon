import { useCategory } from '@mezon/core';
import { selectAllChannelsFavorite, selectCurrentClan, selectIsShowEmptyCategory, selectTheme } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { ICategoryChannel } from '@mezon/utils';
import { memo, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { CreateNewChannelModal } from '../CreateChannelModal';
import CategorizedChannels from './CategorizedChannels';
import { Events } from './ChannelListComponents';
export type ChannelListProps = { className?: string };
export type CategoriesState = Record<string, boolean>;

function ChannelList() {
	const { categorizedChannels } = useCategory();
	const appearanceTheme = useSelector(selectTheme);
	const currentClan = useSelector(selectCurrentClan);
	const isShowEmptyCategory = useSelector(selectIsShowEmptyCategory);
	const channelFavorites = useSelector(selectAllChannelsFavorite);
	const [isExpandFavorite, setIsExpandFavorite] = useState<boolean>(false);
	const memoizedCategorizedChannels = useMemo(() => {
		return categorizedChannels.map((category: ICategoryChannel) => {
			if (!isShowEmptyCategory && category.channels.length === 0) {
				return null;
			}
			return <CategorizedChannels key={category.id} category={category} />;
		});
	}, [categorizedChannels, isShowEmptyCategory]);

	return (
		<div
			onContextMenu={(event) => event.preventDefault()}
			className={`overflow-y-scroll overflow-x-hidden w-[100%] h-[100%] pb-[10px] ${appearanceTheme === 'light' ? 'customSmallScrollLightMode' : 'thread-scroll'}`}
			id="channelList"
			role="button"
		>
			{<CreateNewChannelModal />}
			{currentClan?.banner && (
				<div className="h-[136px]">
					{currentClan?.banner && <img src={currentClan?.banner} alt="imageCover" className="h-full w-full object-cover" />}
				</div>
			)}
			<div className="self-stretch h-fit flex-col justify-start items-start gap-1 p-2 flex">
				<Events />
			</div>
			<hr className="h-[0.08px] w-full dark:border-borderDivider border-white mx-2" />
			<div className={`overflow-y-scroll flex-1 pt-3 space-y-[21px]  text-gray-300 scrollbar-hide`}>
				<div className="dark:text-channelTextLabel text-colorTextLightMode flex items-center px-0.5 w-full font-title tracking-wide dark:hover:text-gray-100 hover:text-black uppercase text-sm font-semibold px-2">
					{isExpandFavorite ? <Icons.ArrowDown /> : <Icons.ArrowRight />}
					<span className="one-line">Favorite channel</span>
					<div>
						{channelFavorites.map((item, index) => (
							<div key={index}>{item}</div>
						))}
					</div>
				</div>
				{memoizedCategorizedChannels}
			</div>
		</div>
	);
}

export default memo(ChannelList);
