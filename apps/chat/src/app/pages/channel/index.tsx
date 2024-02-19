import {
  ChannelList,
  ChannelTopbar,
  FooterProfile,
  ServerHeader,
  MemberList,
} from '@mezon/components';
import ChannelMessages from './ChanneMessages';
import { useChat, useChatChannel } from '@mezon/core';
import { ChannelMessageBox } from './ChannelMessageBox';
import Setting from '../setting';
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@mezon/store';
import { ChannelTyping } from './ChannelTyping';
import { getIsShow } from 'libs/store/src/lib/showlistmember/showlistmember.slice';

export default function Server() {
    const isShow = useSelector(getIsShow);
    
    // TODO: move selector to store
    const isSending = useSelector((state: RootState) => state.messages.isSending);
    const { currentChanel, currentClan, userProfile } = useChat();
    const [openSetting, setOpenSetting] = useState(false);

    const handleOpenCreate = () => {
        setOpenSetting(true);
    };

    // New message always display in bottomn
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const { messages } = useChatChannel(currentChanel?.id ?? "");

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [isSending, [], messages]);
    // TODO: move clan related component to clan page
    return (
        <>
            <div className="hidden flex-col w-[272px] bg-bgSurface md:flex">
                <ServerHeader name={currentClan?.clan_name} type="channel" bannerImage={currentClan?.banner} />
                <ChannelList />
                <FooterProfile name={userProfile?.user?.username || ""} status={userProfile?.user?.online} avatar={userProfile?.user?.avatar_url || ""} openSetting={handleOpenCreate} />
            </div>
            <div className="flex flex-col flex-1 shrink min-w-0 bg-bgSecondary h-[100%] overflow-hidden">
                <ChannelTopbar channel={currentChanel} />
                <div className="flex h-heightWithoutTopBar flex-row ">
                    <div className="flex flex-col flex-1 w-full h-full">
                        <div className="overflow-y-auto bg-[#1E1E1E] max-w-widthMessageViewChat overflow-x-hidden max-h-heightMessageViewChat h-heightMessageViewChat" ref={messagesContainerRef}>
                            {currentChanel ? <ChannelMessages channelId={currentChanel?.id} /> : <ChannelMessages.Skeleton />}
                        </div>
                        <div className="flex-shrink-0 flex flex-col bg-[#1E1E1E] h-auto">
                        {currentChanel && <ChannelTyping  channelId={currentChanel?.id} />}
                        {currentChanel ? <ChannelMessageBox channelId={currentChanel?.id} /> : <ChannelMessageBox.Skeleton />}
                        </div>
                    </div>
                    {isShow &&(
                        <div className="w-[268px] bg-bgSurface  lg:flex hidden text-[#84ADFF]">
                            <MemberList />
                        </div>
                     )}
                </div>
            </div>
            <Setting
                open={openSetting}
                onClose={() => {
                    setOpenSetting(false);
                }}
            />
        </>
    );
}
