import { ACTIVE_TAB } from '@mezon/mobile-components';
import { Block } from '@mezon/mobile-ui';
import {
	DirectEntity,
	selectAllChannelsByUser,
	selectAllUsersByUser,
	selectMessageSearchByChannelId,
	selectTotalResultSearchMessage
} from '@mezon/store-mobile';
import { IChannel, SearchItemProps, compareObjects } from '@mezon/utils';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ChannelsSearchTab from '../../../ChannelsSearchTab';
import MembersSearchTab from '../../../MembersSearchTab';
import MessagesSearchTab from '../../../MessagesSearchTab';
import HeaderTabSearch from './HeaderTabSearch';

interface ISearchMessagePageProps {
	currentChannel: IChannel | DirectEntity;
	searchText: string;
}

export function normalizeString(str: string): string {
	if (!str?.length) return;
	return str
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toUpperCase();
}
function SearchMessagePage({ searchText, currentChannel }: ISearchMessagePageProps) {
	const { t } = useTranslation(['searchMessageChannel']);
	const [activeTab, setActiveTab] = useState<number>(ACTIVE_TAB.MEMBER);
	const listChannels = useSelector(selectAllChannelsByUser);
	const totalResult = useSelector(selectTotalResultSearchMessage);
	const allUsesInAllClans = useSelector(selectAllUsersByUser);
	const messageSearchByChannelId = useSelector(selectMessageSearchByChannelId(currentChannel?.channel_id as string));

	const normalizeSearchText = useMemo(() => {
		return normalizeString(searchText);
	}, [searchText]);

	const channelsSearch = useMemo(() => {
		if (!searchText) return listChannels;
		return (
			listChannels?.filter((channel) => {
				return normalizeString(channel?.channel_label).includes(normalizeSearchText);
			}) || []
		).sort((a: SearchItemProps, b: SearchItemProps) => compareObjects(a, b, searchText, 'channel_label'));
	}, [listChannels, searchText, normalizeSearchText]);

	const listMembers = useMemo(() => {
		return allUsesInAllClans?.map((itemUserClan) => ({
			id: itemUserClan?.id ?? '',
			name: itemUserClan?.display_name ?? '',
			avatarUser: itemUserClan?.avatar_url ?? '',
			user: {
				username: itemUserClan?.display_name ?? '',
				avatar_url: itemUserClan?.avatar_url ?? '',
				id: itemUserClan?.id ?? ''
			}
		}));
	}, [allUsesInAllClans]);
	const membersSearch = useMemo(() => {
		if (!searchText) return listMembers;
		return listMembers
			?.filter((member) => {
				return normalizeString(member?.user?.username)?.includes(normalizeSearchText);
			})
			.sort((a: SearchItemProps, b: SearchItemProps) => compareObjects(a, b, searchText, 'display_name'));
	}, [listMembers, searchText, normalizeSearchText]);

	const TabList = useMemo(() => {
		return [
			{
				title: t('members'),
				quantitySearch: searchText && membersSearch?.length
			},
			{
				title: t('channels'),
				quantitySearch: searchText && channelsSearch?.length
			},
			{
				title: t('Messages'),
				quantitySearch: totalResult
			}
		];
	}, [channelsSearch, membersSearch, searchText, t, totalResult]);

	function handelHeaderTabChange(index: number) {
		setActiveTab(index);
	}

	const renderContent = () => {
		switch (activeTab) {
			case ACTIVE_TAB.MESSAGES:
				return <MessagesSearchTab messageSearchByChannelId={messageSearchByChannelId} />;
			case ACTIVE_TAB.MEMBER:
				return <MembersSearchTab listMemberSearch={membersSearch} />;
			case ACTIVE_TAB.CHANNEL:
				return <ChannelsSearchTab listChannelSearch={channelsSearch} />;
			default:
				return <Block></Block>;
		}
	};

	return (
		<Block height={'100%'} width={'100%'}>
			<HeaderTabSearch tabList={TabList} activeTab={activeTab} onPress={handelHeaderTabChange} />
			<Block>{renderContent()}</Block>
		</Block>
	);
}

export default React.memo(SearchMessagePage);
