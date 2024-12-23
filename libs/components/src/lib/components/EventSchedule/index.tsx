import { EventManagementEntity, selectChannelById, useAppSelector } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { EEventStatus, openVoiceChannel } from '@mezon/utils';
import Tippy from '@tippy.js/react';
import React from 'react';
import { timeFomat } from '../ChannelList/EventChannelModal/timeFomatEvent';

type EventScheduleProps = {
	event: EventManagementEntity;
	className: string;
};

const EventSchedule: React.FC<EventScheduleProps> = ({ event, className }) => {
	const channelVoice = useAppSelector((state) => selectChannelById(state, event?.channel_voice_id ?? '')) || {};
	const eventIsUpcoming = Number(event?.event_status) === EEventStatus.UPCOMING;
	const eventIsOngoing = Number(event?.event_status) === EEventStatus.ONGOING;
	const nearestEventAvaiable = eventIsUpcoming || eventIsOngoing;
	if (!nearestEventAvaiable) return null;
	const eventStatusNotice = eventIsUpcoming
		? 'The event will begin shortly. Get ready!'
		: eventIsOngoing
			? 'The event is happening now!'
			: 'Event has ended.';

	const cssEventStatus = eventIsUpcoming ? 'text-purple-500' : eventIsOngoing ? 'text-green-500' : 'dark:text-zinc-400 text-colorTextLightMode';

	const handleOpenVoiceChannel = () => {
		if (channelVoice?.meeting_code) {
			openVoiceChannel(channelVoice.meeting_code);
		}
	};

	return (
		<Tippy
			content={
				<div style={{ width: 'max-content' }}>
					<p>{`Event: ${event.title}`}</p>
					<p>{eventStatusNotice}</p>
					<p>{timeFomat(event.start_time ?? '')}</p>
				</div>
			}
		>
			<div className={className} onClick={handleOpenVoiceChannel}>
				<Icons.IconEvents defaultSize={`w-4 h-4 ${cssEventStatus}`} />
			</div>
		</Tippy>
	);
};

export default EventSchedule;
