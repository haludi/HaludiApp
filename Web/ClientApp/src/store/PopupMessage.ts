import { Action, Reducer } from 'redux';
import {Variant} from "../components/PopupMessage";
import {AppThunkAction} from "./index";

export interface ComponentProps {
    message: string;
    onClose?: () => any;
    variant: Variant;
}

export interface State {
    notificationProps?: ComponentProps;
}

export interface ShowMessageAction  { 
    type: 'SHOW_MESSAGE' ;
    props: ComponentProps;
}
export interface HideErrorAction { type: 'HIDE_MESSAGE' }

export type KnownAction = ShowMessageAction | HideErrorAction;

export const actionCreators = {
    showError: (props: ComponentProps): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'SHOW_MESSAGE', props:props});
    },
    hideError: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'HIDE_MESSAGE'});
    },
};

export const reducer: Reducer<State> = (state: State | undefined, incomingAction: Action): State => {
    if (state === undefined) {
        return {};
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'SHOW_MESSAGE':
            return {notificationProps: {...action.props}};
        case 'HIDE_MESSAGE':
            return {};
        default:
            return state;
    }
};
