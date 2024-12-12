import { useBottomSheetModal } from '@gorhom/bottom-sheet';
import { Icons } from '@mezon/mobile-components';
import { Block, Fonts, size, useTheme } from '@mezon/mobile-ui';
import { auditLogList } from '@mezon/store';
import { RootState, auditLogFilterActions, selectActionAuditLog, selectCurrentClanId, selectUserAuditLog, useAppDispatch } from '@mezon/store-mobile';
import { ActionLog, UserAuditLog } from '@mezon/utils';
import { FlashList } from '@shopify/flash-list';
import { MezonapiListAuditLog } from 'mezon-js/api.gen';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { IMezonMenuSectionProps, MezonBottomSheet, MezonMenu } from '../../componentUI';
import { APP_SCREEN, MenuClanScreenProps } from '../../navigation/ScreenTypes';
import { AuditLogItem } from './AuditLogItem/AuditLogItem';
import EmptyAuditLog from './EmptyAuditLog/EmptyAuditLog';
import { style } from './styles';
type ClanSettingsScreen = typeof APP_SCREEN.MENU_CLAN.AUDIT_LOG;

export default function AuditLogComponent({ navigation }: MenuClanScreenProps<ClanSettingsScreen>) {
	const { themeValue } = useTheme();
	const dispatch = useAppDispatch();
	const [auditLogData, setAuditLogData] = useState<MezonapiListAuditLog>();
	const filterBSRef = useRef(null);
	const { dismiss } = useBottomSheetModal();
	const actionAuditLog = useSelector(selectActionAuditLog);
	const userAuditLog = useSelector(selectUserAuditLog);
	const currentClanId = useSelector(selectCurrentClanId) as string;
	const { t } = useTranslation('auditLog');
	const loadingStatus = useSelector((state: RootState) => state?.auditlog?.loadingStatus);
	const styles = style(themeValue);

	const displayUserName = useMemo(() => {
		return userAuditLog?.userName && userAuditLog?.userName !== UserAuditLog.ALL_USER_AUDIT
			? userAuditLog?.userName
			: UserAuditLog.ALL_USER_AUDIT;
	}, [userAuditLog?.userName]);

	const displayActionLog = useMemo(() => {
		return actionAuditLog && actionAuditLog !== ActionLog.ALL_ACTION_AUDIT ? actionAuditLog : ActionLog.ALL_ACTION_AUDIT;
	}, [actionAuditLog]);

	useEffect(() => {
		navigation.setOptions({
			headerTitle: t('auditLogComponent.title'),
			headerLeft: () => (
				<TouchableOpacity style={styles.headerLeftBtn} onPress={() => navigation.goBack()}>
					<Icons.ArrowLargeLeftIcon height={Fonts.size.s_20} width={Fonts.size.s_20} color={themeValue.textStrong} />
				</TouchableOpacity>
			),
			headerRight: () => (
				<TouchableOpacity style={styles.headerRightBtn} onPress={handleOnPressFilter}>
					<Text style={styles.headerRightText}>{t('auditLogComponent.filterBtn')}</Text>
				</TouchableOpacity>
			)
		});
	}, []);

	useEffect(() => {
		return () => {
			resetAuditLogOption();
		};
	}, []);

	const fetchAudiLogList = async (body) => {
		const response = await dispatch(auditLogList(body));
		if (response) {
			setAuditLogData(response?.payload);
		}
	};

	const resetAuditLogOption = () => {
		dispatch(
			auditLogFilterActions.setUser({
				userId: '',
				userName: ''
			})
		);
		dispatch(auditLogFilterActions.setAction(null));
	};

	useEffect(() => {
		if (currentClanId) {
			const body = {
				actionLog: actionAuditLog === ActionLog.ALL_ACTION_AUDIT ? '' : actionAuditLog,
				userId: userAuditLog?.userId ?? '',
				clanId: currentClanId ?? '',
				page: 1,
				pageSize: 10000,
				noCache: true
			};
			fetchAudiLogList(body);
		}
	}, [actionAuditLog, userAuditLog]);

	const menu = useMemo(
		() =>
			[
				{
					items: [
						{
							title: t('auditLogComponent.filterByUser'),
							onPress: () => {
								navigation.navigate(APP_SCREEN.MENU_CLAN.FILTER_BY_USER);
								dismiss();
							}
						},
						{
							title: t('auditLogComponent.filterByAction'),
							onPress: () => {
								navigation.navigate(APP_SCREEN.MENU_CLAN.FILTER_BY_ACTION);
								dismiss();
							}
						}
					]
				}
			] as IMezonMenuSectionProps[],
		[]
	);
	const handleOnPressFilter = () => {
		filterBSRef?.current?.present();
	};

	const renderAditLogItem = ({ item }) => <AuditLogItem data={item} />;
	return (
		<Block paddingVertical={size.s_10} width={'100%'} height={'100%'} backgroundColor={themeValue.primary}>
			<TouchableOpacity onPress={handleOnPressFilter} activeOpacity={0.5} style={styles.filterBtn}>
				<Block gap={size.s_10} alignItems="center" flexDirection="row" marginRight={size.s_10}>
					<Block maxWidth={200} marginLeft={size.s_20} backgroundColor={themeValue.tertiary} padding={size.s_6} borderRadius={size.s_6}>
						<Text style={styles.textFilterBtn} numberOfLines={1}>
							{displayUserName}
						</Text>
					</Block>
					<Block maxWidth={200} backgroundColor={themeValue.tertiary} padding={size.s_6} borderRadius={size.s_6}>
						<Text style={styles.textFilterBtn} numberOfLines={1}>
							{displayActionLog}
						</Text>
					</Block>
					<Icons.ChevronSmallRightIcon width={size.s_18} height={size.s_18} color={themeValue.text} />
				</Block>
			</TouchableOpacity>
			<Block flex={1} paddingHorizontal={size.s_20} paddingVertical={size.s_10}>
				{loadingStatus === 'loaded' && !auditLogData?.logs?.length ? (
					<EmptyAuditLog />
				) : (
					<FlashList
						showsVerticalScrollIndicator={false}
						data={auditLogData?.logs}
						renderItem={renderAditLogItem}
						removeClippedSubviews={true}
						keyExtractor={(item) => item?.id?.toString()}
						estimatedItemSize={size.s_50}
					/>
				)}
			</Block>
			<MezonBottomSheet snapPoints={['20%']} ref={filterBSRef}>
				<Block paddingHorizontal={size.s_20}>
					<MezonMenu menu={menu} />
				</Block>
			</MezonBottomSheet>
		</Block>
	);
}
