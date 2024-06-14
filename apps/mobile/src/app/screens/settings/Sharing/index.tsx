import { useCategory, useDirect, useReference } from '@mezon/core';
import { CloseIcon, FileIcon, PenIcon, SearchIcon, SendIcon, abbreviateText } from '@mezon/mobile-components';
import { Colors, size, verticalScale } from '@mezon/mobile-ui';
import { channelsActions, directActions, getStoreAsync, selectCurrentClan } from '@mezon/store-mobile';
import { handleUploadFileMobile, useMezon } from '@mezon/transport';
import { cloneDeep, debounce } from 'lodash';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import RNFS from 'react-native-fs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { IFile } from '../../home/homedrawer/components/AttachmentPicker/Gallery';
import { styles } from './styles';

export const Sharing = ({ data, onClose }) => {
	const { listDM } = useDirect();
	const { categorizedChannels } = useCategory();
	const currentClan = useSelector(selectCurrentClan);
	const mezon = useMezon();
	const dispatch = useDispatch();
	const [dataText, setDataText] = useState<string>('');
	const [dataShareTo, setDataShareTo] = useState<any>([]);
	const [searchText, setSearchText] = useState<string>('');
	const [channelSelected, setChannelSelected] = useState<any>();
	const inputSearchRef = useRef<any>();
	const dataMedia = useMemo(() => {
		return data.filter((data: { contentUri: any }) => !!data?.contentUri);
	}, [data]);
	const { attachmentDataRef, setAttachmentData } = useReference();

	useEffect(() => {
		if (data) {
			if (data?.length === 1 && data?.[0]?.weblink) {
				setDataText(data?.[0]?.weblink);
			}
		}
	}, [data]);

	useEffect(() => {
		if (searchText) {
			handleSearchShareTo();
		} else {
			setDataShareTo([]);
		}
	}, [searchText]);

	useEffect(() => {
		if (dataMedia?.length) {
			convertFileFormat();
		}
	}, [dataMedia]);

	function flattenData(categorizedChannels: any) {
		return categorizedChannels.reduce((result: any, category: any) => {
			const { category_id, category_name } = category;

			category.channels.forEach((channel: any) => {
				if (channel.type !== ChannelType.CHANNEL_TYPE_VOICE) {
					result.push({
						...channel,
						category_id,
						category_name,
					});
					channel.threads.forEach((thread: any) => {
						const { id: thread_id } = thread;

						result.push({
							...thread,
							category_id,
							category_name,
							thread_id,
						});
					});
				}
			});

			return result;
		}, []);
	}

	const flattenedData = useMemo(() => flattenData(cloneDeep(categorizedChannels)), [categorizedChannels]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedSetSearchText = useCallback(
		debounce((text) => setSearchText(text), 300),
		[],
	);

	const generateChannelMatch = (data: any, DMList: any, searchText: string) => {
		return [...DMList, ...data].filter((channel: { channel_label?: string | number }) =>
			channel.channel_label?.toString()?.toLowerCase()?.includes(searchText?.toLowerCase()),
		);
	};

	const handleSearchShareTo = async () => {
		const matchedChannels = generateChannelMatch(flattenedData, listDM, searchText);
		setDataShareTo(matchedChannels || []);
	};

	const onChooseSuggestion = async (channel: any) => {
		// Send to DM message
		if (channel.type === ChannelStreamMode.STREAM_MODE_DM || channel.type === ChannelStreamMode.STREAM_MODE_GROUP) {
			const store = await getStoreAsync();
			store.dispatch(
				directActions.joinDirectMessage({
					directMessageId: channel.id,
					channelName: channel.channel_label,
					type: channel.type,
				}),
			);
		}

		setChannelSelected(channel);
	};

	const sendToDM = async (dataSend: { text: any }) => {
		mezon.joinChatDirectMessage(channelSelected.id, '', ChannelType.CHANNEL_TYPE_DM);
		await mezon.socketRef.current.writeChatMessage(
			'DM',
			channelSelected.id,
			'',
			ChannelStreamMode.STREAM_MODE_DM,
			{ t: dataSend.text },
			[],
			attachmentDataRef || [],
			[],
		);
	};

	const sendToGroup = async (dataSend: { text: any }) => {
		if (channelSelected.parrent_id !== '0') {
			await mezon.joinChatChannel(channelSelected.id);
		} else {
			await mezon.joinChatThread(channelSelected.id);
		}

		await mezon.socketRef.current.writeChatMessage(
			currentClan.id,
			channelSelected.channel_id,
			channelSelected.channel_label,
			ChannelStreamMode.STREAM_MODE_CHANNEL,
			{ t: dataSend.text },
			[], //mentions
			attachmentDataRef || [], //attachments
			[], //references
			false, //anonymous
			false, //mentionEveryone
		);
		const timestamp = Date.now() / 1000;
		dispatch(channelsActions.setChannelLastSeenTimestamp({ channelId: channelSelected.channel_id, timestamp }));
	};

	const onSend = async () => {
		const dataSend = {
			text: dataText,
		};
		// Send to DM message
		if (channelSelected.type === ChannelStreamMode.STREAM_MODE_DM || channelSelected.type === ChannelStreamMode.STREAM_MODE_GROUP) {
			await sendToDM(dataSend);
		} else {
			await sendToGroup(dataSend);
		}
		onClose();
	};

	const convertFileFormat = async () => {
		const fileFormats = await Promise.all(
			dataMedia.map(async (media) => {
				const fileData = await RNFS.readFile(media.contentUri, 'base64');

				return {
					uri: media.contentUri,
					name: media?.fileName || media?.contentUri,
					type: media?.mimeType,
					fileData,
				};
			}),
		);
		handleFiles(fileFormats);
		// setAttachmentData({
		// 	url: filePath,
		// 	filename: image?.filename || image?.uri,
		// 	filetype: Platform.OS === 'ios' ? `${file?.node?.type}/${image?.extension}` : file?.node?.type,
		// });
	};

	const handleFiles = (files: IFile | any) => {
		const session = mezon.sessionRef.current;
		const client = mezon.clientRef.current;
		if (!files || !client || !session || !currentClan.id) {
			throw new Error('Client or files are not initialized');
		}

		const promises = Array.from(files).map((file: IFile | any) => {
			const ms = new Date().getTime();
			const fullFilename = `${currentClan.id}/${channelSelected?.channel_id}/${ms}`.replace(/-/g, '_') + '/' + file.name;
			return handleUploadFileMobile(client, session, fullFilename, file);
		});

		Promise.all(promises).then((attachments) => {
			attachments.forEach((attachment) => handleFinishUpload(attachment));
		});
	};

	const handleFinishUpload = useCallback(
		(attachment: ApiMessageAttachment) => {
			setAttachmentData(attachment);
		},
		[setAttachmentData],
	);

	function removeAttachmentByUrl(urlToRemove: string, fileName: string) {
		const removedAttachment = attachmentDataRef.filter((attachment) => {
			if (attachment.url === urlToRemove) {
				return false;
			}
			return !(fileName && attachment.filename === fileName);
		});

		setAttachmentData(removedAttachment);
	}

	const renderFileView = (attachment: ApiMessageAttachment) => {
		const splitFiletype = attachment.filetype.split('/');
		const type = splitFiletype[splitFiletype.length - 1];
		return (
			<View style={styles.fileViewer}>
				<FileIcon width={verticalScale(30)} height={verticalScale(30)} color={Colors.bgViolet} />
				<View style={{ maxWidth: '75%' }}>
					<Text style={styles.fileName} numberOfLines={1}>
						{abbreviateText(attachment.filename)}
					</Text>
					<Text style={styles.typeFile} numberOfLines={1}>
						{type}
					</Text>
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.wrapper}>
			<View style={styles.header}>
				<TouchableOpacity onPress={onClose}>
					<CloseIcon width={size.s_28} height={size.s_28} />
				</TouchableOpacity>
				<Text style={styles.titleHeader}>Share</Text>
				{channelSelected ? (
					<TouchableOpacity onPress={onSend}>
						<SendIcon width={size.s_28} height={size.s_20} />
					</TouchableOpacity>
				) : (
					<View style={{ width: size.s_28 }} />
				)}
			</View>
			<ScrollView style={styles.container} keyboardShouldPersistTaps={'handled'}>
				<View style={styles.rowItem}>
					<Text style={styles.title}>Message preview</Text>
					{!!attachmentDataRef?.length && (
						<View style={[styles.inputWrapper, { marginBottom: size.s_16 }]}>
							<ScrollView horizontal style={styles.wrapperMedia}>
								{attachmentDataRef?.map((media, index) => {
									const isFile = !media.filetype.includes('video') && !media.filetype.includes('image');

									return (
										<View
											key={`${media?.url}_${index}_media_sharing`}
											style={[styles.wrapperItemMedia, isFile && { height: size.s_60, width: size.s_50 * 3 }]}
										>
											{isFile ? renderFileView(media) : <FastImage source={{ uri: media?.url }} style={styles.itemMedia} />}
											<TouchableOpacity
												style={styles.iconRemoveMedia}
												onPress={() => removeAttachmentByUrl(media.url ?? '', media?.filename || '')}
											>
												<CloseIcon width={size.s_18} height={size.s_18} />
											</TouchableOpacity>
										</View>
									);
								})}
							</ScrollView>
						</View>
					)}

					<View style={styles.inputWrapper}>
						<View style={styles.iconLeftInput}>
							<PenIcon width={size.s_18} />
						</View>
						<TextInput
							style={styles.textInput}
							value={dataText}
							onChangeText={(text) => setDataText(text)}
							placeholder={'Add a Comment (Optional)'}
							placeholderTextColor={Colors.tertiary}
						/>
						{!!dataText?.length && (
							<TouchableOpacity activeOpacity={0.8} onPress={() => setDataText('')} style={styles.iconRightInput}>
								<CloseIcon width={size.s_18} />
							</TouchableOpacity>
						)}
					</View>
				</View>

				<View style={styles.rowItem}>
					<Text style={styles.title}>Share to</Text>
					<View style={styles.inputWrapper}>
						{channelSelected ? (
							<FastImage source={{ uri: channelSelected?.channel_avatar?.[0] || currentClan?.logo }} style={styles.iconLeftInput} />
						) : (
							<View style={styles.iconLeftInput}>
								<SearchIcon width={size.s_18} height={size.s_18} />
							</View>
						)}
						{channelSelected ? (
							<Text style={styles.textChannelSelected}>{channelSelected?.channel_label}</Text>
						) : (
							<TextInput
								ref={inputSearchRef}
								style={styles.textInput}
								onChangeText={debouncedSetSearchText}
								placeholder={'Select a channel or category...'}
								placeholderTextColor={Colors.tertiary}
							/>
						)}
						{channelSelected ? (
							<TouchableOpacity
								activeOpacity={0.8}
								onPress={() => {
									setChannelSelected(undefined);
									inputSearchRef?.current?.focus?.();
								}}
								style={styles.iconRightInput}
							>
								<CloseIcon width={size.s_18} />
							</TouchableOpacity>
						) : (
							!!searchText?.length && (
								<TouchableOpacity
									activeOpacity={0.8}
									onPress={() => {
										setSearchText('');
										inputSearchRef?.current?.clear?.();
									}}
									style={styles.iconRightInput}
								>
									<CloseIcon width={size.s_18} />
								</TouchableOpacity>
							)
						)}
					</View>
				</View>

				{!!dataShareTo?.length && (
					<View style={styles.rowItem}>
						<Text style={styles.title}>Suggestions</Text>
						{dataShareTo?.map((channel: any, index: number) => {
							return (
								<TouchableOpacity
									onPress={() => onChooseSuggestion(channel)}
									style={styles.itemSuggestion}
									key={`${channel?.id}_${index}_suggestion`}
								>
									<FastImage source={{ uri: channel?.channel_avatar?.[0] || currentClan?.logo }} style={styles.logoSuggestion} />
									<Text style={styles.titleSuggestion} numberOfLines={1}>
										{channel?.channel_label}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
};
