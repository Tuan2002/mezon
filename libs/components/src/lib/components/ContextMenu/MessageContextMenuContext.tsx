import { SHOW_POSITION } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ShowContextMenuParams, useContextMenu } from 'react-contexify';
import MessageContextMenu from './MessageContextMenu';

const MESSAGE_CONTEXT_MENU_ID = 'message-context-menu';

type MessageContextMenuContextValue = {
	showMessageContextMenu: (
		event: React.MouseEvent<HTMLElement>,
		messageId: string,
		mode: ChannelStreamMode,
		props?: Partial<MessageContextMenuProps>
	) => void;
	setPositionShow: (showPostion: SHOW_POSITION) => void;
	posShowMenu: string;
	setImageURL: (url: string) => void;
	imageSrc: string;
};

export type MessageContextMenuProps = {
	messageId: string;
	position?: ShowContextMenuParams['position'];
};

export const MessageContextMenuContext = createContext<MessageContextMenuContextValue>({
	showMessageContextMenu: () => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
	},

	setPositionShow: () => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
	},
	posShowMenu: SHOW_POSITION.NONE,
	setImageURL: () => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
	},
	imageSrc: ''
});

export const MessageContextMenuProvider = ({ children }: { children: React.ReactNode }) => {
	const messageIdRef = useRef<string>('');
	const [elementTarget, setElementTarget] = useState<HTMLElement | null>(null);
	const [activeMode, setActiveMode] = useState<ChannelStreamMode>(ChannelStreamMode.STREAM_MODE_CHANNEL);
	const [posShowMenu, setPosShowMenu] = useState<string>(SHOW_POSITION.NONE);
	const [imageSrc, setImageSrc] = useState<string>(SHOW_POSITION.NONE);

	const { show } = useContextMenu({
		id: MESSAGE_CONTEXT_MENU_ID
	});

	const menu = useMemo(() => {
		return (
			<MessageContextMenu id={MESSAGE_CONTEXT_MENU_ID} messageId={messageIdRef.current} elementTarget={elementTarget} activeMode={activeMode} />
		);
	}, [messageIdRef.current, elementTarget, activeMode]);

	const setPositionShow = useCallback((pos: string) => {
		setPosShowMenu(pos);
	}, []);

	const setImageURL = useCallback((src: string) => {
		setImageSrc(src);
	}, []);

	const showContextMenu = useCallback(
		(event: React.MouseEvent<HTMLElement>, props: MessageContextMenuProps) => {
			const position = props.position || null;
			show({
				event,
				props,
				position
			});
		},
		[show]
	);

	const showMessageContextMenu = useCallback(
		(event: React.MouseEvent<HTMLElement>, messageId: string, mode: ChannelStreamMode, props?: Partial<MessageContextMenuProps>) => {
			messageIdRef.current = messageId;
			setElementTarget(event.target as HTMLElement);
			setActiveMode(mode);
			const niceProps = {
				messageId,
				...props
			};
			showContextMenu(event, niceProps);
		},
		[]
	);

	const value = useMemo(
		() => ({
			showMessageContextMenu,
			setPositionShow,
			posShowMenu,
			setImageURL,
			imageSrc
		}),
		[showMessageContextMenu, setPositionShow, posShowMenu, setImageURL, imageSrc]
	);

	return (
		<MessageContextMenuContext.Provider value={value}>
			{children}
			{menu}
		</MessageContextMenuContext.Provider>
	);
};

export const useMessageContextMenu = () => useContext(MessageContextMenuContext);
