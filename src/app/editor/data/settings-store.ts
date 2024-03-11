import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { withLoadingIndicator } from './with-loading-indicator';
import { withLocalStorageSync } from './with-local-storage-sync';

export interface SettingsState {
  isLoading: boolean;

  canvasBackgroundColor: string;

  zoom: {
    step: number;
    min: number;
    max: number;
  };

  selection: {
    width: number;
    strokeStyle: string;
    distance: number;
  };

  hover: {
    threshold: number;
    width: number;
    strokeStyle: string;
    distance: number;
    dash: number[];
  };

  preview: {
    color: string;
    dash: number[];
  };
}

const initialState: SettingsState = {
  isLoading: false,

  canvasBackgroundColor: '#20a050',

  zoom: {
    step: 0.1,
    min: 0.1,
    max: 10,
  },
  selection: {
    width: 2,
    strokeStyle: '#ffff00',
    distance: 3,
  },

  hover: {
    threshold: 10,
    width: 2,
    strokeStyle: '#ffff00',
    distance: 6,
    dash: [3, 3],
  },

  preview: {
    color: '#ffff00',
    dash: [3, 3],
  },
};

export const SettingsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withLoadingIndicator(), // my custom extension
  withLocalStorageSync('ngdrawing-settings'), // my custom extension

  withMethods((state) => ({
    load() {
      state.setLoading(true);

      // time-consuming loading here (e.g. from API/Backend)...

      patchState(state, {
        /*canvasBackgroundColor: theLoadedValue, etc. */
      });

      state.setLoading(false);
    },
    save() {
      state.saveToLocalStorage();

      // storing to backend here...
    },
    reset() {
      state.resetLocalStorage();
      patchState(state, initialState);

      // storing to backend here...
    },
    updateCanvasBackgroundColor(canvasBackgroundColor: string): void {
      console.log(canvasBackgroundColor);

      patchState(state, () => ({ canvasBackgroundColor }));
    },
    updateZoomStep(step: number): void {
      console.log('new zoom step is', step);

      patchState(state, (state) => ({ zoom: { ...state.zoom, step } }));
    },
    updateZoomMin(min: number): void {
      patchState(state, (state) => ({ zoom: { ...state.zoom, min } }));
    },
    updateZoomMax(max: number): void {
      patchState(state, (state) => ({ zoom: { ...state.zoom, max } }));
    },
    updateSelectionWidth(width: number): void {
      patchState(state, (state) => ({
        selection: { ...state.selection, width },
      }));
    },
    updateSelectionStrokeStyle(strokeStyle: string): void {
      patchState(state, (state) => ({
        selection: { ...state.selection, strokeStyle },
      }));
    },
    updateSelectionDistance(distance: number): void {
      patchState(state, (state) => ({
        selection: { ...state.selection, distance },
      }));
    },
    updateHoverThreshold(threshold: number): void {
      patchState(state, (state) => ({ hover: { ...state.hover, threshold } }));
    },
    updateHoverWidth(width: number): void {
      patchState(state, (state) => ({ hover: { ...state.hover, width } }));
    },
    updateHoverStrokeStyle(strokeStyle: string): void {
      patchState(state, (state) => ({
        hover: { ...state.hover, strokeStyle },
      }));
    },
    updateHoverDistance(distance: number): void {
      patchState(state, (state) => ({ hover: { ...state.hover, distance } }));
    },
    updatePreviewColor(color: string): void {
      patchState(state, (state) => ({ preview: { ...state.preview, color } }));
    },
  })),

  withHooks({
    onInit(store) {
      // first try the method of my withLocalStorageSync extension
      if (store.loadFromLocalStorage()) {
        return;
      }

      // alternatively try the method defined above
      store.load();
    },
  }),
);
