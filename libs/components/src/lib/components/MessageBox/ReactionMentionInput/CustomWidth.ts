const clanWidth = '72px';
const channelListWidth = '272px';
const memberWidth = '245px';
const memberWidthThread = '500px';
const widthResultSearch = '420px';
const margin = '16px';
const dmUserProfile = '340px';
const dmGroupMemberList = '241px';

export const widthMessageViewChat = `calc(100vw - ${clanWidth} - ${channelListWidth} - ${memberWidth} - ${margin})`;
export const widthMessageViewChatThread = `calc(100vw - ${clanWidth} - ${channelListWidth} - ${memberWidthThread} - ${margin})`;
export const widthThumbnailAttachment = `calc(100vw - ${clanWidth} - ${channelListWidth} - ${margin})`;
export const widthSearchMessage = `calc(100vw - ${clanWidth} - ${channelListWidth} - ${widthResultSearch} - ${margin})`;
export const widthDmUserProfile = `calc(100vw - ${clanWidth} - ${channelListWidth} - ${dmUserProfile} - ${margin})`;
export const widthDmGroupMemberList = `calc(100vw - ${clanWidth} - ${channelListWidth} - ${dmGroupMemberList} - ${margin})`;