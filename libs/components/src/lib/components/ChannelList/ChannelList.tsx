import { useAppNavigation, useCategorizedChannelsWeb, usePermissionChecker, useWindowSize } from '@mezon/core';
import {
	ChannelsEntity,
	ClansEntity,
	appActions,
	categoriesActions,
	selectAllChannelsFavorite,
	selectChannelById,
	selectChannelsByClanId,
	selectChannelsEntities,
	selectCtrlKFocusChannel,
	selectCurrentChannelId,
	selectCurrentClan,
	selectCurrentUserId,
	selectIsElectronDownloading,
	selectIsElectronUpdateAvailable,
	selectIsShowEmptyCategory,
	selectStatusStream,
	selectTheme,
	useAppDispatch,
	useAppSelector
} from '@mezon/store';
import { Icons } from '@mezon/ui';
import {
	ChannelStatusEnum,
	ChannelThreads,
	EPermission,
	ICategoryChannel,
	IChannel,
	createImgproxyUrl,
	isLinuxDesktop,
	isWindowsDesktop,
	toggleDisableHover
} from '@mezon/utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChannelType } from 'mezon-js';
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { CreateNewChannelModal } from '../CreateChannelModal';
import { MentionFloatButton } from '../MentionFloatButton';
import { ThreadLinkWrapper } from '../ThreadListChannel';
import CategorizedItem from './CategorizedChannels';
import { Events } from './ChannelListComponents';
import ChannelListItem, { ChannelListItemRef } from './ChannelListItem';
export type ChannelListProps = { className?: string };
export type CategoriesState = Record<string, boolean>;

function ChannelList() {
	const appearanceTheme = useSelector(selectTheme);
	return (
		<div onContextMenu={(event) => event.preventDefault()} id="channelList" className="h-full">
			<CreateNewChannelModal />
			<hr className="h-[0.08px] w-full dark:border-borderDivider border-white mx-2" />
			<div className={`flex-1 space-y-[21px] text-gray-300`}>
				<RowVirtualizerDynamic appearanceTheme={appearanceTheme} />
			</div>
		</div>
	);
}

const ChannelBannerAndEvents = memo(({ currentClan }: { currentClan: ClansEntity | null }) => {
	return (
		<>
			{currentClan?.banner && (
				<div className="h-[136px]">
					<img
						src={createImgproxyUrl(currentClan?.banner ?? '', { width: 300, height: 300, resizeType: 'fit' })}
						alt="imageCover"
						className="h-full w-full object-cover"
					/>
				</div>
			)}
			<div id="channel-list-top" className="self-stretch h-fit flex-col justify-start items-start gap-1 p-2 flex">
				<Events />
			</div>
		</>
	);
});

const RowVirtualizerDynamic = memo(({ appearanceTheme }: { appearanceTheme: string }) => {
	const channelRefs = useRef<Record<string, ChannelListItemRef | null>>({});
	const categorizedChannels = useCategorizedChannelsWeb();
	const currentClan = useSelector(selectCurrentClan);
	const isShowEmptyCategory = useSelector(selectIsShowEmptyCategory);
	const streamPlay = useSelector(selectStatusStream);
	const isElectronUpdateAvailable = useSelector(selectIsElectronUpdateAvailable);
	const IsElectronDownloading = useSelector(selectIsElectronDownloading);
	const ctrlKFocusChannel = useSelector(selectCtrlKFocusChannel);
	const channels = useSelector(selectChannelsEntities);
	const dispatch = useAppDispatch();

	const channelsInClan = useAppSelector((state) => selectChannelsByClanId(state, currentClan?.clan_id as string));
	const findFirstChannelWithBadgeCount = (channels: ChannelsEntity[] = []) =>
		channels?.find((item) => item?.count_mess_unread && item?.count_mess_unread > 0) || null;
	const firstChannelWithBadgeCount = findFirstChannelWithBadgeCount(channelsInClan);

	const data = useMemo(
		() => [
			{ type: 'bannerAndEvents' },
			{ type: 'favorites' },
			...(isShowEmptyCategory
				? categorizedChannels
				: categorizedChannels.filter(
						(item) =>
							((item as ICategoryChannel).channels && (item as ICategoryChannel).channels.length > 0) ||
							(item as ICategoryChannel).channels === undefined
					))
		],
		[categorizedChannels, isShowEmptyCategory]
	) as ICategoryChannel[];
	const currentChannelId = useSelector(selectCurrentChannelId);

	const parentRef = useRef<HTMLDivElement>(null);
	const count = data.length;
	const virtualizer = useVirtualizer({
		count,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 45
	});

	const items = virtualizer.getVirtualItems();

	const [height, setHeight] = useState(0);
	const clanTopbarEle = 60;

	const calculateHeight = useCallback(() => {
		const clanFooterEle = document.getElementById('clan-footer');
		const totalHeight = clanTopbarEle + (clanFooterEle?.clientHeight || 0) + 2;
		const outsideHeight = totalHeight;
		const titleBarHeight = isWindowsDesktop || isLinuxDesktop ? 21 : 0;
		setHeight(window.innerHeight - outsideHeight - titleBarHeight);
	}, []);

	useWindowSize(() => {
		calculateHeight();
	});

	useEffect(() => {
		calculateHeight();
	}, [data, streamPlay, IsElectronDownloading, isElectronUpdateAvailable]);

	const channelFavorites = useSelector(selectAllChannelsFavorite);
	const [isExpandFavorite, setIsExpandFavorite] = useState<boolean>(true);

	const handleExpandFavoriteChannel = () => {
		setIsExpandFavorite(!isExpandFavorite);
	};

	const findScrollIndex = () => {
		const categoryId = firstChannelWithBadgeCount?.id;
		const index = data.findIndex((item) => item.id === categoryId);
		const currentScrollIndex = virtualizer.getVirtualItems().findIndex((item) => item.index === index);
		const currentScrollPosition = virtualizer.scrollElement?.scrollTop;
		const targetScrollPosition = virtualizer.getVirtualItems()[currentScrollIndex]?.start;

		return { index, currentScrollIndex, currentScrollPosition, targetScrollPosition };
	};

	useLayoutEffect(() => {
		if (!ctrlKFocusChannel?.id || !channelRefs?.current) return;
		if (!virtualizer.getVirtualItems().length) return;

		const focusChannel = ctrlKFocusChannel;
		const { id, parentId } = focusChannel as { id: string; parentId: string };
		const categoryId = channels[id]?.category_id;
		const index = data.findIndex((item) => item.id === id);
		if (index <= 0) return;

		const currentScrollIndex = virtualizer.getVirtualItems().findIndex((item) => item.index === index);
		const currentScrollPosition = virtualizer.scrollElement?.scrollTop;
		const targetScrollPosition = virtualizer.getVirtualItems()[currentScrollIndex]?.start;
		if (currentScrollIndex === -1 || targetScrollPosition !== currentScrollPosition) {
			virtualizer.scrollToIndex(index, { align: 'center' });
		}

		setTimeout(() => {
			dispatch(categoriesActions.setCtrlKFocusChannel(null));
		}, 100);
	});

	const scrollTimeoutId2 = useRef<NodeJS.Timeout | null>(null);
	const userId = useSelector(selectCurrentUserId);
	const [hasAdminPermission, hasClanPermission, hasChannelManagePermission] = usePermissionChecker([
		EPermission.administrator,
		EPermission.manageClan,
		EPermission.manageChannel
	]);
	const isClanOwner = currentClan?.creator_id === userId;
	const permissions = useMemo(
		() => ({
			hasAdminPermission,
			hasClanPermission,
			hasChannelManagePermission,
			isClanOwner
		}),
		[hasAdminPermission, hasClanPermission, hasChannelManagePermission, isClanOwner]
	);

	const handleScrollChannelIntoView = useCallback(() => {
		const { index, currentScrollIndex, currentScrollPosition, targetScrollPosition } = findScrollIndex();
		if (currentScrollIndex === -1 || targetScrollPosition !== currentScrollPosition) {
			virtualizer.scrollToIndex(index, { align: 'center' });
		}
	}, [firstChannelWithBadgeCount]);

	const isChannelRefOutOfViewport = () => {
		const { currentScrollIndex } = findScrollIndex();
		return currentScrollIndex === -1;
	};

	return (
		<div
			ref={parentRef}
			style={{
				height: height
			}}
			className={`thread-scroll`}
			onWheelCapture={() => {
				toggleDisableHover(parentRef.current, scrollTimeoutId2);
			}}
		>
			<div
				style={{
					height: virtualizer.getTotalSize(),
					width: '100%',
					position: 'relative'
				}}
			>
				{firstChannelWithBadgeCount && isChannelRefOutOfViewport() && (
					<div className={'sticky top-0 z-10 w-full flex justify-center'}>
						<MentionFloatButton onClick={handleScrollChannelIntoView} />
					</div>
				)}
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						transform: `translateY(${items[0]?.start ?? 0}px)`
					}}
				>
					{items.map((virtualRow) => {
						const item = data[virtualRow.index];
						if (virtualRow.index === 0) {
							return (
								<div key={virtualRow.key} data-index={virtualRow.index} ref={virtualizer.measureElement}>
									<ChannelBannerAndEvents currentClan={currentClan} />
								</div>
							);
						} else if (virtualRow.index === 1) {
							return (
								<div key={virtualRow.key} data-index={virtualRow.index} ref={virtualizer.measureElement}>
									<FavoriteChannelsSection
										isExpandFavorite={isExpandFavorite}
										handleExpandFavoriteChannel={handleExpandFavoriteChannel}
										channelFavorites={channelFavorites}
									/>
								</div>
							);
						} else if (item.channels) {
							return (
								<div
									style={{ padding: '10px 0' }}
									key={virtualRow.key}
									data-index={virtualRow.index}
									ref={virtualizer.measureElement}
								>
									<CategorizedItem key={item.id} category={item} channelRefs={channelRefs} />
								</div>
							);
						} else {
							if ((item as IChannel).parrent_id === '0') {
								return (
									<div key={virtualRow.key} data-index={virtualRow.index} ref={virtualizer.measureElement}>
										<ChannelListItem
											isActive={currentChannelId === item.id}
											key={item.id}
											channel={item as ChannelThreads}
											permissions={permissions}
										/>
									</div>
								);
							} else {
								return (
									<div key={virtualRow.key} data-index={virtualRow.index} ref={virtualizer.measureElement}>
										<ThreadLinkWrapper
											key={item.id}
											isActive={currentChannelId === item.id}
											thread={item}
											isFirstThread={(data[virtualRow.index - 1] as IChannel).parrent_id === '0'}
											isCollapsed={false}
										/>
									</div>
								);
							}
						}
					})}
				</div>
			</div>
		</div>
	);
});

const FavoriteChannelsSection = ({
	isExpandFavorite,
	handleExpandFavoriteChannel,
	channelFavorites
}: {
	isExpandFavorite: boolean;
	handleExpandFavoriteChannel: () => void;
	channelFavorites: string[];
}) => (
	<div>
		<div
			className="dark:text-channelTextLabel text-colorTextLightMode flex items-center px-0.5 w-full font-title tracking-wide dark:hover:text-gray-100 hover:text-black uppercase text-sm font-semibold px-2"
			onClick={handleExpandFavoriteChannel}
		>
			{isExpandFavorite ? <Icons.ArrowDown /> : <Icons.ArrowRight />}
			<span className="one-line">Favorite channel</span>
		</div>
		{isExpandFavorite ? (
			<div className="w-[94%] mx-auto">
				{channelFavorites ? channelFavorites.map((id, index) => <FavoriteChannel key={index} channelId={id} />) : ''}
			</div>
		) : null}
	</div>
);
type FavoriteChannelProps = {
	channelId: string;
};

const FavoriteChannel = ({ channelId }: FavoriteChannelProps) => {
	const channel = useAppSelector((state) => selectChannelById(state, channelId)) || {};
	const theme = useSelector(selectTheme);
	const dispatch = useAppDispatch();
	const { navigate, toChannelPage } = useAppNavigation();
	const handleJumpChannel = (channel: ChannelsEntity) => {
		dispatch(appActions.setIsShowCanvas(false));
		dispatch(categoriesActions.setCtrlKFocusChannel({ id: channel?.id, parentId: channel?.parrent_id ?? '' }));
		const channelUrl = toChannelPage(channel?.id ?? '', channel?.clan_id ?? '');
		navigate(channelUrl);
	};
	return (
		Object.keys(channel).length > 0 && (
			<div
				onClick={() => handleJumpChannel(channel)}
				className="flex gap-2 rounded-md w-full px-2 py-1 mt-1 items-center hover:dark:bg-bgModifierHover hover:bg-bgModifierHoverLight"
			>
				<div className={`relative  ${channel.type !== ChannelType.CHANNEL_TYPE_STREAMING ? 'mt-[-5px]' : ''}`}>
					{channel.channel_private === ChannelStatusEnum.isPrivate && channel.type === ChannelType.CHANNEL_TYPE_GMEET_VOICE && (
						<Icons.SpeakerLocked defaultSize="w-5 h-5 dark:text-channelTextLabel" />
					)}
					{channel.channel_private === ChannelStatusEnum.isPrivate && channel.type === ChannelType.CHANNEL_TYPE_CHANNEL && (
						<Icons.HashtagLocked defaultSize="w-5 h-5 dark:text-channelTextLabel" />
					)}
					{channel.channel_private === undefined && channel.type === ChannelType.CHANNEL_TYPE_GMEET_VOICE && (
						<Icons.Speaker defaultSize="w-5 h-5 dark:text-channelTextLabel" />
					)}
					{channel.channel_private !== 1 && channel.type === ChannelType.CHANNEL_TYPE_CHANNEL && (
						<Icons.Hashtag defaultSize="w-5 h-5 dark:text-channelTextLabel" />
					)}
					{channel.channel_private === undefined && channel.type === ChannelType.CHANNEL_TYPE_STREAMING && (
						<Icons.Stream defaultSize="w-5 h-5 dark:text-channelTextLabel" />
					)}
					{channel.type === ChannelType.CHANNEL_TYPE_APP && <Icons.AppChannelIcon className={'w-5 h-5'} fill={theme} />}
				</div>
				{channel.channel_label}
			</div>
		)
	);
};

const ChannelListMem = memo(ChannelList, () => true);

ChannelListMem.displayName = 'ChannelListMem';

export default ChannelListMem;
