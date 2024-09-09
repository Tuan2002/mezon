import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Block, Text, size, useTheme } from '@mezon/mobile-ui';
import { memo } from 'react';
import Backdrop from '../../../../temp-ui/MezonBottomSheet/backdrop';
import { EAdvancedPermissionSetting } from '../../types/channelPermission.enum';
import { IAdvancedSettingBSProps } from '../../types/channelPermission.type';

export const AdvancedSettingBS = memo(({ bottomSheetRef, channel, onDismiss, currentAdvancedPermissionType }: IAdvancedSettingBSProps) => {
	const { themeValue } = useTheme();
	return (
		<BottomSheetModal
			ref={bottomSheetRef}
			snapPoints={['70%']}
			style={{
				borderTopLeftRadius: size.s_14,
				borderTopRightRadius: size.s_14,
				overflow: 'hidden'
			}}
			backdropComponent={Backdrop}
			onDismiss={onDismiss}
			backgroundStyle={{ backgroundColor: themeValue.primary }}
		>
			<Block paddingHorizontal={size.s_14} flex={1}>
				<Text color={themeValue.white} h3>
					{currentAdvancedPermissionType === EAdvancedPermissionSetting.AddMember ? 'Add Member' : 'Add role'}
				</Text>
				<Text color={themeValue.text}>{'Updating...'}</Text>
				<BottomSheetScrollView>
					<Block>{/* TODO */}</Block>
				</BottomSheetScrollView>
			</Block>
		</BottomSheetModal>
	);
});
