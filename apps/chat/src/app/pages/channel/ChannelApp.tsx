import { Loading } from '@mezon/ui';
import { ApiChannelAppResponse } from 'mezon-js/api.gen';
import { RefObject } from 'react';

export function ChannelApps({
	appChannel,
	miniAppRef,
	miniAppDataHash
}: {
	appChannel: ApiChannelAppResponse;
	miniAppRef: RefObject<HTMLIFrameElement>;
	miniAppDataHash: string;
}) {
	const serverUrl = process.env.NX_CHAT_APP_MEET_WS_URL;

	return appChannel?.url ? (
		<iframe ref={miniAppRef} title={appChannel?.url} src={`${appChannel?.url}#${miniAppDataHash}`} className="w-full h-full"></iframe>
	) : (
		<div className="w-full h-full flex items-center justify-center">
			<Loading />
		</div>
	);
}
