import { Icons } from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import { useNavigation } from '@react-navigation/native';
import { Dispatch, SetStateAction, memo } from 'react';
import { TouchableOpacity } from 'react-native';
import { APP_SCREEN } from '../../../../../../navigation/ScreenTypes';
import AttachmentSwitcher from '../../AttachmentPicker/AttachmentSwitcher';
import { IModeKeyboardPicker } from '../../BottomKeyboardPicker';
import { style } from '../ChatBoxBottomBar/style';

interface IChatMessageLeftAreaProps {
	isAvailableSending: boolean;
	isShowAttachControl: boolean;
	setIsShowAttachControl: Dispatch<SetStateAction<boolean>>;
	isShowCreateThread?: boolean;
	modeKeyBoardBottomSheet: IModeKeyboardPicker;
	handleKeyboardBottomSheetMode: (mode: IModeKeyboardPicker) => void;
}

export const ChatMessageLeftArea = memo(
	({
		isAvailableSending,
		isShowAttachControl,
		setIsShowAttachControl,
		isShowCreateThread,
		modeKeyBoardBottomSheet,
		handleKeyboardBottomSheetMode,
	}: IChatMessageLeftAreaProps) => {
		const { themeValue } = useTheme();
		const styles = style(themeValue);
		const navigation = useNavigation<any>();
		return (
			<Block flexDirection="row" gap={size.s_6}>
				{isAvailableSending && !isShowAttachControl ? (
					<TouchableOpacity style={[styles.btnIcon]} onPress={() => setIsShowAttachControl(!isShowAttachControl)}>
						<Icons.ChevronSmallLeftIcon width={size.s_22} height={size.s_22} color={themeValue.textStrong} />
					</TouchableOpacity>
				) : (
					<>
						<Block style={styles.btnIcon}>
							<AttachmentSwitcher onChange={handleKeyboardBottomSheetMode} mode={modeKeyBoardBottomSheet} />
						</Block>
						{isShowCreateThread && (
							<TouchableOpacity
								style={[styles.btnIcon]}
								onPress={() => navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.CREATE_THREAD })}
							>
								<Icons.ThreadPlusIcon width={size.s_22} height={size.s_22} color={themeValue.textStrong} />
							</TouchableOpacity>
						)}
					</>
				)}
			</Block>
		);
	},
);
