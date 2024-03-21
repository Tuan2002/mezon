import { Hashtag } from '../Icons';

export type ChatWelComeProp = {
	type: string;
	name?: string;
	avatarDM?: string;
};

function ChatWelCome({ type, name, avatarDM }: ChatWelComeProp) {
	return (
		<div className="space-y-2 px-4 mb-4 mt-[250px]">
			{type === 'CHANNEL' ? (
				<div className="h-[75px] w-[75px] rounded-full bg-zinc-700 flex items-center justify-center pl-2">
					<Hashtag defaultFill="#ffffff" defaultSize="w-10 h-10 mb-2" />
				</div>
			) : (
				<img className="h-[75px] w-[75px] rounded-full flex items-center justify-center" src={avatarDM} />
			)}
			<p className="text-xl md:text-3xl font-bold pt-1" style={{ wordBreak: 'break-word' }}>
				{type === 'CHANNEL' ? 'Welcome to #' : ''} {name}
			</p>
			<p className="text-zinc-400 text-sm">
				{type === 'CHANNEL' ? `This is the start of the #${name} channel.` : `This is the start of your conversation with ${name}`}
			</p>
		</div>
	);
}

export default ChatWelCome;
