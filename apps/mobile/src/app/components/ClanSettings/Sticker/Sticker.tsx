import { QUALITY_IMAGE_UPLOAD } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { createSticker, selectCurrentClanId, selectStickersByClanId, useAppDispatch } from '@mezon/store-mobile';
import { handleUploadEmoticon, useMezon } from '@mezon/transport';
import { LIMIT_SIZE_UPLOAD_IMG } from '@mezon/utils';
import { Snowflake } from '@theinternetfolks/snowflake';
import { Buffer as BufferMobile } from 'buffer';
import { ApiClanStickerAddRequest } from 'mezon-js/api.gen';
import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, Text, View } from 'react-native';
import { openCropper } from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import MezonButton, { EMezonButtonSize, EMezonButtonTheme } from '../../../componentUI/MezonButton2';
import { handleSelectImage, IFile } from '../../../componentUI/MezonImagePicker';
import { StickerList } from './StickerList';
import { style } from './styles';

export function StickerSetting({ navigation }) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const timerRef = useRef<any>(null);
	const { sessionRef, clientRef } = useMezon();
	const currentClanId = useSelector(selectCurrentClanId) || '';
	const listSticker = useSelector(selectStickersByClanId(currentClanId));
	const availableLeft = useMemo(() => 50 - listSticker?.length, [listSticker]);
	const dispatch = useAppDispatch();
	const { t } = useTranslation(['clanStickerSetting']);

	const handleUploadImage = useCallback(async (file: IFile) => {
		if (Number(file.size) > Number(LIMIT_SIZE_UPLOAD_IMG / 2)) {
			Toast.show({
				type: 'error',
				text1: t('toast.errorSizeLimit')
			});
			return;
		}

		const session = sessionRef.current;
		const client = clientRef.current;
		if (!client || !session) {
			throw new Error('Client or file is not initialized');
		}

		const arrayBuffer = BufferMobile.from(file?.fileData, 'base64');

		const id = Snowflake.generate();
		const path = 'stickers/' + id + '.webp';
		const attachment = await handleUploadEmoticon(client, session, path, file as unknown as File, true, arrayBuffer);

		return {
			id,
			url: attachment.url
		};
	}, []);

	const handleUploadSticker = useCallback(async () => {
		const file = await handleSelectImage();

		if (file) {
			timerRef.current = setTimeout(
				async () => {
					if (file.type === 'image/gif' || file.type === 'image/png') {
						if (Number(file.size) > Number(LIMIT_SIZE_UPLOAD_IMG / 2)) {
							Toast.show({
								type: 'error',
								text1: t('toast.errorSizeLimit')
							});
							return;
						}
						const { id, url } = await handleUploadImage(file);

						const category = 'Among Us';

						const request: ApiClanStickerAddRequest = {
							id: id,
							category: category,
							clan_id: currentClanId,
							shortname: 'sticker_00',
							source: url
						};

						dispatch(createSticker({ request: request, clanId: currentClanId }));
					} else {
						const croppedFile = await openCropper({
							path: file.uri,
							mediaType: 'photo',
							includeBase64: true,
							compressImageQuality: QUALITY_IMAGE_UPLOAD,
							width: 320,
							height: 320
						});

						// TODO: check category
						const category = 'Among Us';

						if (Number(croppedFile.size) > Number(LIMIT_SIZE_UPLOAD_IMG / 2)) {
							Toast.show({
								type: 'error',
								text1: t('toast.errorSizeLimit')
							});
							return;
						}

						const { id, url } = await handleUploadImage({
							fileData: croppedFile?.data,
							name: file.name,
							uri: croppedFile.path,
							size: croppedFile.size,
							type: croppedFile.mime
						});

						const request: ApiClanStickerAddRequest = {
							id: id,
							category: category,
							clan_id: currentClanId,
							shortname: 'sticker_00',
							source: url
						};

						dispatch(createSticker({ request: request, clanId: currentClanId }));
					}
				},
				Platform.OS === 'ios' ? 500 : 0
			);
		}
	}, [currentClanId, dispatch, handleUploadImage, t]);

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={{ backgroundColor: themeValue.primary }}>
				<MezonButton
					title={t('btn.upload')}
					type={EMezonButtonTheme.SUCCESS}
					size={EMezonButtonSize.MD}
					rounded={true}
					containerStyle={styles.btn}
					onPress={handleUploadSticker}
					titleStyle={styles.btnTitle}
				/>

				<Text style={styles.text}>{t('content.description')}</Text>
				<Text style={[styles.text, styles.textTitle]}>{t('content.requirements')}</Text>
				<Text style={styles.text}>{t('content.reqType')}</Text>
				<Text style={styles.text}>{t('content.reqDim')}</Text>
				<Text style={styles.text}>{t('content.reqSize')}</Text>

				<Text style={[styles.text, styles.textTitle]}>{t('content.available', { left: availableLeft })}</Text>
				<StickerList listSticker={listSticker} clanID={currentClanId} />
			</ScrollView>
		</View>
	);
}
