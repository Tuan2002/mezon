import { NoneToVoidFunction } from '@mezon/utils';
import { useRef } from 'react';
import usePreviousDeprecated from './usePreviousDeprecated';
import { useUnmountCleanup } from './useUnmountCleanup';

export function useSyncEffect<const T extends readonly any[]>(effect: (args: T | readonly []) => NoneToVoidFunction | void, dependencies: T) {
	const prevDeps = usePreviousDeprecated<T>(dependencies);
	const cleanupRef = useRef<NoneToVoidFunction>();

	if (!prevDeps || dependencies.some((d, i) => d !== prevDeps[i])) {
		cleanupRef.current?.();
		cleanupRef.current = effect(prevDeps || []) ?? undefined;
	}

	useUnmountCleanup(() => {
		cleanupRef.current?.();
	});
}
