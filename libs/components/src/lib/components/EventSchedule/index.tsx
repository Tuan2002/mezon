import { EventManagementEntity, selectChannelById, useAppSelector } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { EEventStatus, openVoiceChannel } from '@mezon/utils';
import Tooltip from 'rc-tooltip';
import React from 'react';
import { timeFomat } from '../ChannelList/EventChannelModal/timeFomatEvent';

type EventScheduleProps = {
	event: EventManagementEntity;
	className?: string;
};

const EventSchedule: React.FC<EventScheduleProps> = ({ event, className }) => {
	const channelVoice = useAppSelector((state) => selectChannelById(state, event?.channel_voice_id ?? '')) || {};
	const eventIsUpcoming = event?.event_status === EEventStatus.UPCOMING;
	const eventIsOngoing = event?.event_status === EEventStatus.ONGOING;
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
		<Tooltip
			overlay={
				<div className="p-2 dark:bg-[#2B2D31] bg-bgLightMode dark:text-[#E6E6E6] text-black max-w-max">
					<p>{`Event: ${event.title}`}</p>
					<p>{eventStatusNotice}</p>
					<p>{timeFomat(event.start_time ?? '')}</p>
				</div>
			}
		>
			<div className={className} onClick={handleOpenVoiceChannel}>
				<Icons.IconEvents defaultSize={`w-4 h-4 ${cssEventStatus}`} />
			</div>
		</Tooltip>
	);
};

export default EventSchedule;
