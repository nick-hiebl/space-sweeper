import { useSyncExternalStore } from 'react';

type Callback = () => void;

type Unsubscribe = Callback;

export type ExternalStore<T> = {
	subscribe: (onUpdated: Callback) => Unsubscribe;
	getSnapshot: () => T;
	triggerUpdate: Callback;
};

export const createExternalStore = <T>(getSnapshot: () => T): ExternalStore<T> => {
	const subscribers: Callback[] = [];

	const onSubscribe = (callback: Callback): Unsubscribe => {
		subscribers.push(callback);

		return () => {
			const index = subscribers.findIndex(subscriber => subscriber === callback);

			if (index === -1) {
				return;
			}

			subscribers.splice(index, 1);
		};
	};

	const triggerUpdate = () => {
		for (const subscriber of subscribers) {
			subscriber();
		}
	};

	return {
		subscribe: onSubscribe,
		getSnapshot,
		triggerUpdate,
	};
};

export const useExternalStore = <T>(store: ExternalStore<T>) => {
	return useSyncExternalStore(store.subscribe, store.getSnapshot);
};
