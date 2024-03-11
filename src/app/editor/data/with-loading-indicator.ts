import {
  patchState,
  signalStoreFeature,
  withMethods,
  withState,
} from '@ngrx/signals';

export const withLoadingIndicator = () =>
  signalStoreFeature(
    withState({ isLoading: false }),
    withMethods((state) => ({
      setLoading(value: boolean) {
        patchState(state, { isLoading: value });
      },
    })),
  );
