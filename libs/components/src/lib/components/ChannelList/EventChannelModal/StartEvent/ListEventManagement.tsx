import { EventManagementEntity, selectAllChannelsByUser, useAppSelector } from '@mezon/store';
import { OptionEvent } from '@mezon/utils';
import { useRef } from 'react';
import ItemEventManagement from '../ModalCreate/itemEventManagement';

type ListEventManagementProps = {
	allEventManagement: EventManagementEntity[];
	onOpenDetailItem: (status: boolean) => void;
	openModelUpdate: () => void;
	onUpdateEventId: (id: string) => void;
};

const ListEventManagement = (props: ListEventManagementProps) => {
	const { allEventManagement, onOpenDetailItem, openModelUpdate, onUpdateEventId } = props;
	const listChannelsRef = useRef(useAppSelector(selectAllChannelsByUser));

	return allEventManagement.map((event, index) => {
		return (
			<div key={index}>
				<ItemEventManagement
					topic={event.title || ''}
					voiceChannel={event.channel_id || ''}
					titleEvent={event.title || ''}
					address={event.address}
					option={event.address ? OptionEvent.OPTION_LOCATION : OptionEvent.OPTION_SPEAKER}
					logoRight={event.logo}
					start={event.start_time || ''}
					end={event.end_time || ''}
					event={event}
					setOpenModalDetail={onOpenDetailItem}
					createTime={event.create_time}
					openModelUpdate={openModelUpdate}
					onEventUpdateId={onUpdateEventId}
				/>
			</div>
		);
	});
};

export default ListEventManagement;
