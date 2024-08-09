import { useThreads } from '@mezon/core';

export type NavLinkProps = {
	readonly active?: boolean;
	readonly children?: React.ReactElement | string;
};

function NavLinkComponent({ active, children }: NavLinkProps) {
	const { setTurnOffThreadMessage } = useThreads();

	return (
		<div className="group block relative rounded-3xl">
			<div className="flex absolute -left-2 items-center h-full">
				<div
					className={`${active ? 'h-10' : 'h-5 scale-0 opacity-0 group-hover:opacity-100 group-hover:scale-100'
					} w-0.5 transition-all duration-200 origin-left bg-primary`}
				></div>
			</div>

			<div className="group-active:translate-y-px" onClick={() => setTurnOffThreadMessage()}>
				<div
					className={`${active
						? 'rounded-xl bg-brand text-white dark:bg-bgTertiary dark:bg-bgLightModeButton'
						: 'text-gray-100 group-hover:bg-brand group-hover:text-white group-hover:rounded-xl rounded-3xl dark:group-hover:bg-bgTertiary group-hover:bg-bgLightModeButton'
						} flex items-center justify-center w-12 h-12 transition-all duration-200 overflow-hidden `}
				>
					{children}
				</div>
			</div>
		</div>
	);
}

export default NavLinkComponent;
