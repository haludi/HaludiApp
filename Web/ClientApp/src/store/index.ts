import * as WeatherForecasts from './WeatherForecasts';
import * as FuelTrackingRecords from './FuelTrackingRecordsStore';
import * as Counter from './Counter';
import * as PopupMessage from './PopupMessage';
import * as UserStore from './UserStore';

// The top-level state object
export interface ApplicationState {
    counter: Counter.CounterState | undefined;
    weatherForecasts: WeatherForecasts.WeatherForecastsState | undefined;
    fuelTrackingRecords: FuelTrackingRecords.FuelTrackingRecordsState | undefined;
    popupMessage: PopupMessage.State | undefined
    user: UserStore.State | undefined
}

// Whenever an action is dispatched, Redux will update each top-level application state property using
// the reducer with the matching name. It's important that the names match exactly, and that the reducer
// acts on the corresponding ApplicationState property type.
export const reducers = {
    counter: Counter.reducer,
    weatherForecasts: WeatherForecasts.reducer,
    fuelTrackingRecords: FuelTrackingRecords.reducer,
    popupMessage: PopupMessage.reducer,
    user: UserStore.reducer,
};

// This type can be used as a hint on action creators so that its 'dispatch' and 'getState' params are
// correctly typed to match your store.
export interface AppThunkAction<TAction> {
    (dispatch: (action: TAction) => void, getState: () => ApplicationState): void;
}
