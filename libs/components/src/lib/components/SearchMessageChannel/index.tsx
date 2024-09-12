import { Icons, UserMentionList } from '@mezon/components';
import { useSearchMessages, useThreads } from '@mezon/core';
import {
	appActions,
	searchMessagesActions,
	selectCurrentChannel,
	selectCurrentClanId,
	selectDmGroupCurrentId,
	selectIsSearchMessage,
	selectIsShowMemberList,
	selectTheme,
	selectValueInputSearchMessage,
	useAppDispatch
} from '@mezon/store';
import { SearchFilter, SIZE_PAGE_SEARCH } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Mention, MentionsInput, OnChangeHandlerFunc, SuggestionDataItem } from 'react-mentions';
import { useSelector } from 'react-redux';
import SearchMessageChannelModal from './SearchMessageChannelModal';
import SelectGroup from './SelectGroup';
import darkMentionsInputStyle from './StyleSearchMessagesDark';
import lightMentionsInputStyle from './StyleSearchMessagesLight';

import { hasKeySearch, searchFieldName } from './constant';
import SelectItemUser from './SelectItemUser';

type SearchMessageChannelProps = {
	mode?: ChannelStreamMode;
};
interface ExtendedSuggestionDataItem extends SuggestionDataItem {
	subDisplay?: string;
}

const SearchMessageChannel = ({ mode }: SearchMessageChannelProps) => {
	const dispatch = useAppDispatch();
	const isActive = useSelector(selectIsShowMemberList);
	const { fetchSearchMessages, currentPage } = useSearchMessages();
	const currentClanId = useSelector(selectCurrentClanId);
	const currentChannel = useSelector(selectCurrentChannel);
	const currentDmGroupId = useSelector(selectDmGroupCurrentId);

	const valueInputSearch = useSelector(selectValueInputSearchMessage(currentChannel?.channel_id as string));

	const isSearchMessage = useSelector(selectIsSearchMessage(currentChannel?.channel_id as string));

	const userListData = UserMentionList({
		channelID: mode === ChannelStreamMode.STREAM_MODE_CHANNEL ? (currentChannel?.id ?? '') : (currentDmGroupId ?? ''),
		channelMode: mode
	});

	const userListDataSearchByMention = userListData.map((user) => {
		return {
			id: user?.id ?? '',
			display: user?.username ?? '',
			avatarUrl: user?.avatarUrl ?? '',
			subDisplay: user?.display
		};
	});

	const { setIsShowCreateThread } = useThreads();
	const [expanded, setExpanded] = useState(false);
	const [isShowSearchMessageModal, setIsShowSearchMessageModal] = useState(false);
	const [isShowSearchOptions, setIsShowSearchOptions] = useState('');
	const [valueDisplay, setValueDisplay] = useState<string>('');
	const [search, setSearch] = useState<any | undefined>();
	const inputRef = useRef<HTMLInputElement>(null);
	const searchRef = useRef<HTMLInputElement | null>(null);

	const handleInputClick = () => {
		setExpanded(true);
		if (!hasKeySearch(valueInputSearch)) {
			setIsShowSearchMessageModal(true);
		}
	};

	const handleOutsideClick = (event: MouseEvent) => {
		const targetIsOutside = inputRef.current && !inputRef.current.contains(event.target as Node);

		if (targetIsOutside && !valueInputSearch) {
			setExpanded(false);
			setIsShowSearchMessageModal(false);
			dispatch(searchMessagesActions.setIsSearchMessage({ channelId: currentChannel?.channel_id as string, isSearchMessage: false }));
		}
		if (targetIsOutside && valueInputSearch) {
			setExpanded(true);
			setIsShowSearchMessageModal(false);
		}
	};

	const handleChange: OnChangeHandlerFunc = (event, newValue, newPlainTextValue, mentions) => {
		const value = event.target.value;
		dispatch(searchMessagesActions.setValueInputSearch({ channelId: currentChannel?.id ?? '', value }));
		setValueDisplay(newPlainTextValue);
		const filter: SearchFilter[] = [];
		if (mentions.length === 0) {
			filter.push(
				{
					field_name: 'content',
					field_value: value
				},
				{ field_name: 'channel_id', field_value: currentChannel?.id },
				{ field_name: 'clan_id', field_value: currentClanId as string }
			);
		}
		for (const mention of mentions) {
			const convertMention = mention.display.split(':');
			filter.push(
				{ field_name: searchFieldName[convertMention[0]], field_value: convertMention[1] },
				{ field_name: 'channel_id', field_value: currentChannel?.id }
			);
		}
		setSearch({ ...search, filters: filter, from: 1, size: SIZE_PAGE_SEARCH });
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement> | KeyboardEvent<HTMLInputElement>) => {
		if (valueInputSearch && event.key === 'Enter') {
			setIsShowSearchMessageModal(false);
			dispatch(searchMessagesActions.setIsSearchMessage({ channelId: currentChannel?.channel_id as string, isSearchMessage: true }));
			setIsShowCreateThread(false, currentChannel?.parrent_id !== '0' ? currentChannel?.parrent_id : currentChannel.channel_id);
			if (isActive) dispatch(appActions.setIsShowMemberList(!isActive));
			if (search) {
				fetchSearchMessages(search);
			}
		}
	};

	const handleSearchIcon = () => {
		searchRef.current?.focus();
		setExpanded(true);
	};

	const handleClose = () => {
		dispatch(searchMessagesActions.setValueInputSearch({ channelId: currentChannel?.id ?? '', value: '' }));
		setValueDisplay('');
		dispatch(searchMessagesActions.setIsSearchMessage({ channelId: currentChannel?.channel_id as string, isSearchMessage: false }));
		if (!isSearchMessage) dispatch(appActions.setIsShowMemberList(!isActive));
		searchRef.current?.focus();
	};

	const handleClickSearchOptions = (value: string) => {
		dispatch(
			searchMessagesActions.setValueInputSearch({
				channelId: currentChannel?.id ?? '',
				value: hasKeySearch(value ?? '') ? value : valueInputSearch + value
			})
		);
		searchRef.current?.focus();
	};

	useEffect(() => {
		if (search) {
			fetchSearchMessages({ ...search, from: currentPage });
		}
	}, [currentPage]);

	useEffect(() => {
		document.addEventListener('click', handleOutsideClick);
		return () => {
			document.removeEventListener('click', handleOutsideClick);
		};
	}, [valueInputSearch]);

	const appearanceTheme = useSelector(selectTheme);

	const handleFocus = () => {
		console.log('focus');
	};

	return (
		<div className="relative" ref={inputRef}>
			<div
				className={`transition-all duration-300 ${
					expanded ? 'w-80' : 'w-40'
				} h-8 pl-2 pr-2 py-3 dark:bg-bgTertiary bg-bgLightTertiary rounded items-center inline-flex`}
			>
				<MentionsInput
					inputRef={searchRef}
					placeholder="Search"
					value={valueInputSearch ?? ''}
					style={appearanceTheme === 'light' ? lightMentionsInputStyle : darkMentionsInputStyle}
					onChange={handleChange}
					className="w-full mr-[10px] dark:bg-transparent bg-transparent dark:text-white text-colorTextLightMode rounded-md focus-visible:!border-0 focus-visible:!outline-none focus-visible:[&>*]:!outline-none"
					allowSpaceInQuery={true}
					singleLine={true}
					onClick={handleInputClick}
					onKeyDown={handleKeyDown}
					customSuggestionsContainer={(children: React.ReactNode) => {
						return (
							<div
								className={`absolute left-0 top-10 pb-3 ${valueInputSearch ? 'pt-0' : 'pt-3'} rounded dark:bg-bgProfileBody bg-bgLightPrimary z-[9999] w-widthModalSearch min-h-heightModalSearch shadow`}
							>
								{valueInputSearch && (
									<div className="first:mt-0 mt-3 p-3 rounded-t dark:bg-bgSecondary600 border-b border-borderDivider last:border-b-0 last:bottom-b-0">
										<div className="flex items-center justify-between">
											<div className="flex flex-row items-center flex-1 overflow-x-hidden">
												<h3 className="text-xs font-medium text-textLightTheme dark:text-textPrimary uppercase mr-1 flex-shrink-0">
													Search for:
												</h3>
												<p className="text-sm font-semibold w-full mr-[10px] whitespace-normal text-ellipsis overflow-x-hidden">
													{valueDisplay}
												</p>
											</div>
											<button className="px-1 h-5 w-10 text-xs text-textLightTheme dark:text-textPrimary font-semibold rounded bg-borderDividerLight dark:bg-borderDividerLight">
												Enter
											</button>
										</div>
									</div>
								)}
								<SelectGroup groupName="From user">{children}</SelectGroup>
							</div>
						);
					}}
				>
					<Mention
						appendSpaceOnAdd={true}
						data={userListDataSearchByMention ?? []}
						trigger="from:"
						displayTransform={(id: any, display: any) => {
							return `from:${display}`;
						}}
						renderSuggestion={(suggestion) => {
							return <SelectItemUser title="from: " content={suggestion.display} onClick={() => setIsShowSearchOptions('')} />;
						}}
						className="dark:bg-[#3B416B] bg-bgLightModeButton"
					/>

					<Mention
						appendSpaceOnAdd={true}
						data={userListDataSearchByMention ?? []}
						trigger="mentions:"
						displayTransform={(id: any, display: any) => {
							return `mentions:${display}`;
						}}
						renderSuggestion={(suggestion) => {
							return <SelectItemUser title="mentions: " content={suggestion.display} onClick={() => setIsShowSearchOptions('')} />;
						}}
						className="dark:bg-[#3B416B] bg-bgLightModeButton"
					/>
				</MentionsInput>
			</div>
			<div className="w-6 h-6 flex flex-row items-center pl-1 absolute right-1 bg-transparent top-1/2 transform -translate-y-1/2">
				<button
					onClick={handleSearchIcon}
					className={`${valueInputSearch ? 'z-0 opacity-0 rotate-0' : 'z-10 opacity-100 rotate-90'} w-4 h-4 absolute transition-transform`}
				>
					<Icons.Search className="w-4 h-4 dark:text-white text-colorTextLightMode" />
				</button>
				<button
					onClick={handleClose}
					className={`${valueInputSearch ? 'z-10 opacity-100 rotate-90' : 'z-0 opacity-0 rotate-0'} w-4 h-4 absolute transition-transform`}
				>
					<Icons.Close defaultSize="w-4 h-4" />
				</button>
			</div>
			{isShowSearchMessageModal && !hasKeySearch(valueInputSearch ?? '') && (
				<SearchMessageChannelModal
					hasKeySearch={hasKeySearch(valueInputSearch ?? '')}
					valueInputSearch={valueInputSearch}
					valueDisplay={valueDisplay}
					isShowSearchOptions={isShowSearchOptions}
					onClickSearchOptions={handleClickSearchOptions}
				/>
			)}
		</div>
	);
};

export default SearchMessageChannel;
