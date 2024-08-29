import { CheckIcon, isEqual } from '@mezon/mobile-components';
import { Colors, useTheme } from '@mezon/mobile-ui';
import { categoriesActions, selectCategoryById, useAppDispatch } from '@mezon/store-mobile';
import { UserShieldIcon } from 'libs/mobile-components/src/lib/icons2';
import { ApiUpdateCategoryDescRequest } from 'mezon-js/api.gen';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { APP_SCREEN, MenuClanScreenProps } from '../../navigation/ScreenTypes';
import { IMezonMenuItemProps, IMezonMenuSectionProps, MezonConfirm, MezonInput, MezonMenu } from '../../temp-ui';
import { style } from './styles';

type ScreenCategorySetting = typeof APP_SCREEN.MENU_CLAN.CATEGORY_SETTING;
export default function CategorySetting({ navigation, route }: MenuClanScreenProps<ScreenCategorySetting>) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { t } = useTranslation(['categorySetting']);
	const dispatch = useAppDispatch();
    const { categoryId } = route.params;
    const category = useSelector(selectCategoryById(categoryId || ''));
	const [isVisibleDeleteCategoryModal, setIsVisibleDeleteCategoryModal] = useState<boolean>(false);
	const [categorySettingValue, setCategorySettingValue] = useState<string>('');
	const [currentSettingValue, setCurrentSettingValue] = useState<string>('');

    const isNotChanged = useMemo(() => {
        if (!currentSettingValue) return true
		return isEqual(categorySettingValue, currentSettingValue);
	}, [categorySettingValue, currentSettingValue]);

    navigation.setOptions({
		headerRight: () => (
			<Pressable onPress={() => handleSaveCategorySetting()}>
				<Text style={[styles.saveChangeButton, !isNotChanged ? styles.changed : styles.notChange]}>{t('confirm.save')}</Text>
			</Pressable>
		),
	});

    useEffect(() => {
		if (category?.category_id) {
			setCategorySettingValue(category?.category_name);
			setCurrentSettingValue(category?.category_name);
		}
	}, [category]);

    const permissionMenu = useMemo(
		() =>
			[
				{
					title: t('fields.categoryPermission.permission'),
					expandable: true,
					icon: <UserShieldIcon color={themeValue.text} />,
				},
			] satisfies IMezonMenuItemProps[],
		[],
	);

    const deleteMenu = useMemo(
		() =>
			[
				{
					title: t('fields.categoryDelete.delete'),
					textStyle: { color: 'red' },
					onPress: () => handlePressDeleteCategory(),
				},
			] satisfies IMezonMenuItemProps[],
		[],
	);
    
    const menu = useMemo(
		() =>
			[
				{
					items: permissionMenu,
					bottomDescription: t('fields.categoryPermission.description'),
				},
                {
                    items: deleteMenu
                }
			] satisfies IMezonMenuSectionProps[],
		[],
	);

	const handleUpdateValue = (text: string) => {
		setCurrentSettingValue(text);
	};

    const handleSaveCategorySetting = async () => {
        const request: ApiUpdateCategoryDescRequest = {
            category_id: category?.category_id || '',
            category_name: currentSettingValue,
        }
        dispatch(categoriesActions.updateCategory({
            clanId: category?.clan_id || '',
            request: request
        }))

		navigation?.goBack();
		Toast.show({
			type: 'success',
			props: {
				text2: t('toast.updated'),
				leadingIcon: <CheckIcon color={Colors.green} />,
			},
		});
	};

	const handleDeleteCategory = async () => {
		await dispatch(categoriesActions.deleteCategory({ 
            clanId: category.clan_id as string, 
            categoryId: category.id as string 
        }));

        navigation.navigate(APP_SCREEN.HOME);
	};

	const handleDeleteModalVisibleChange = (visible: boolean) => {
		setIsVisibleDeleteCategoryModal(visible);
	};

	const handlePressDeleteCategory = () => {
		setIsVisibleDeleteCategoryModal(true);
	};

	return (
		<ScrollView style={styles.container}>
            <MezonInput
                label={t('fields.categoryName.title')}
                value={currentSettingValue}
                onTextChange={handleUpdateValue}
            />

            <MezonMenu menu={menu} />

			<MezonConfirm
				visible={isVisibleDeleteCategoryModal}
				onVisibleChange={handleDeleteModalVisibleChange}
				onConfirm={handleDeleteCategory}
				title={t('confirm.delete.title')}
				confirmText={t('confirm.delete.confirmText')}
				content={t('confirm.delete.content', {
					categoryName: category?.category_name,
				})}
			/>
		</ScrollView>
	);
}