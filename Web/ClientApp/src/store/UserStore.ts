import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';
import axios from "axios";

export interface State {
    loginInProgress?: boolean;
    registerInProgress?: boolean;
}

export interface User {
    token: string;
    email: string;
}

export type RegisterField = "email" | "password";
export type RegisterViewModel = { [K in RegisterField] : string }

export type LoginField = "email" | "password";
export type LoginViewModel = { [K in RegisterField] : string }

export class LoggedUser {
    private static theKey = "user";
    static get = function(): User| undefined {
        const jsonUser = localStorage.getItem(LoggedUser.theKey);
        if(!jsonUser)
            return;

        return JSON.parse(jsonUser) as User;
    };

    static set = function(user: User): void {
        localStorage.setItem(LoggedUser.theKey, JSON.stringify(user));
    };

    static remove = function(): void {
        localStorage.removeItem(LoggedUser.theKey);
    };
}

interface RequestRegisterAction {
    type: 'REQUEST_REGISTER';
}

interface ReceiveRegisterAction {
    type: 'RECEIVE_REGISTER';
    user: User;
}

type KnownRegisterAction = RequestRegisterAction | ReceiveRegisterAction;

interface RequestLoginAction {
    type: 'REQUEST_LOGIN';
}

interface ReceiveLoginAction {
    type: 'RECEIVE_LOGIN';
    user: User;
}

type KnownLoginAction = RequestLoginAction | ReceiveLoginAction;

interface Logout {
    type: 'LOGOUT';
}

type KnownAction = KnownRegisterAction | KnownLoginAction | Logout;

export const actionCreators = {
    register: (viewModel: RegisterViewModel, onSuccess: () => void): AppThunkAction<KnownRegisterAction> => (dispatch, getState) => {
        const user = LoggedUser.get();
        if (user && user.email === viewModel.email)
            return;
        
        axios.post(`/api/v1/user/register`, viewModel)
            .then(response => response.data as Promise<{token: string}>)
            .then(data => {
                LoggedUser.set({email: viewModel.email, token: data.token});
                dispatch({ type: 'RECEIVE_REGISTER', user: {email: viewModel.email, token: data.token}});
                onSuccess();
            });

        dispatch({ type: 'REQUEST_REGISTER'});
    },
    login: (viewModel: LoginViewModel, onSuccess: () => void): AppThunkAction<KnownLoginAction> => (dispatch, getState) => {
        const user = LoggedUser.get();
        if (user && user.email === viewModel.email)
            return;

        axios.post(`/api/v1/user/login`, {email: viewModel.email, password: viewModel.password})
            .then(response => response.data as Promise<{token: string}>)
            .then(data => {
                LoggedUser.set({email: viewModel.email, token: data.token});
                dispatch({ type: 'RECEIVE_LOGIN', user: {email: viewModel.email, token: data.token}});
                onSuccess();
            })
            .catch(()=>{

                let a = 0;
            });

        dispatch({ type: 'REQUEST_LOGIN'});
    },
    logout: (): AppThunkAction<Logout> => (dispatch, getState) => {
        LoggedUser.remove();
        dispatch({ type: 'LOGOUT'});
    },
};

const unloadedState: State = { };

export const reducer: Reducer<State> = (state: State | undefined, incomingAction: Action): State => {
    if (state === undefined) {
        return unloadedState;
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_REGISTER':
            return {
                ...state,
                registerInProgress: true
            };
        case 'RECEIVE_REGISTER':
            return {
                ...state,
                registerInProgress: false,
            };
        case 'REQUEST_LOGIN':
            return {
                ...state,
                registerInProgress: true
            };
        case 'RECEIVE_LOGIN':
            return {
                ...state,
                registerInProgress: false,
            };
        case 'LOGOUT':
            return {
                ...state,
            };
        default:
            return state;
    }
};
