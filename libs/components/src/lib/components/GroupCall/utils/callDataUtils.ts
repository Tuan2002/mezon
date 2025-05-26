import { safeJSONParse } from 'mezon-js';

export interface CallSignalingData {
	is_video: boolean;
	group_id: string;
	group_name: string;
	group_avatar?: string;
	caller_id: string;
	caller_name: string;
	caller_avatar?: string;
	meeting_code?: string;
	clan_id?: string;
	timestamp: number;
	participants: string[];
	action?: string;
	reason?: string;
}

export interface GroupCallData {
	groupId: string;
	groupName: string;
	groupAvatar?: string;
	meetingCode?: string;
	clanId?: string;
	participants: string[];
	callerInfo: {
		id: string;
		name: string;
		avatar?: string;
	};
}

/**
 * Create comprehensive call signaling data
 */
export const createCallSignalingData = (params: {
	isVideo: boolean;
	groupId: string;
	groupName: string;
	groupAvatar?: string;
	callerId: string;
	callerName: string;
	callerAvatar?: string;
	meetingCode?: string;
	clanId?: string;
	participants: string[];
	action?: string;
	reason?: string;
}): CallSignalingData => ({
	is_video: params.isVideo,
	group_id: params.groupId,
	group_name: params.groupName,
	group_avatar: params.groupAvatar,
	caller_id: params.callerId,
	caller_name: params.callerName,
	caller_avatar: params.callerAvatar,
	meeting_code: params.meetingCode,
	clan_id: params.clanId,
	timestamp: Date.now(),
	participants: params.participants,
	action: params.action,
	reason: params.reason
});

/**
 * Parse signaling data from WebRTC event
 */
export const parseSignalingData = (jsonData?: string): CallSignalingData | null => {
	if (!jsonData) return null;

	try {
		return safeJSONParse(jsonData);
	} catch {
		return null;
	}
};

/**
 * Create group call data from signaling
 */
export const createGroupCallDataFromSignaling = (signaling: CallSignalingData): GroupCallData => ({
	groupId: signaling.group_id,
	groupName: signaling.group_name || 'Group Call',
	groupAvatar: signaling.group_avatar,
	meetingCode: signaling.meeting_code,
	clanId: signaling.clan_id,
	participants: signaling.participants || [],
	callerInfo: {
		id: signaling.caller_id,
		name: signaling.caller_name,
		avatar: signaling.caller_avatar
	}
});

/**
 * Create participant joined data
 */
export const createParticipantJoinedData = (params: { participantId: string; participantName: string; participantAvatar?: string }) => ({
	participant_id: params.participantId,
	participant_name: params.participantName,
	participant_avatar: params.participantAvatar,
	timestamp: Date.now()
});

/**
 * Create participant left data
 */
export const createParticipantLeftData = (params: { participantId: string; participantName: string }) => ({
	participant_id: params.participantId,
	participant_name: params.participantName,
	timestamp: Date.now()
});

/**
 * Create cancel data for call
 */
export const createCancelData = (params: { isVideo: boolean; groupId: string; callerId: string; callerName: string; reason?: string }) => ({
	is_video: params.isVideo,
	group_id: params.groupId,
	caller_id: params.callerId,
	caller_name: params.callerName,
	timestamp: Date.now(),
	reason: params.reason || 'cancelled'
});

/**
 * Create quit data for call
 */
export const createQuitData = (params: { isVideo: boolean; groupId: string; callerId: string; callerName: string; action: string }) => ({
	is_video: params.isVideo,
	group_id: params.groupId,
	caller_id: params.callerId,
	caller_name: params.callerName,
	timestamp: Date.now(),
	action: params.action
});
