import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';
import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {ShowMessageAction} from "./PopupMessage";

export interface State {
    email?: string; 
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
    
    static getHeader = function (): {} {
        const user = LoggedUser.get();
        if(!user)
            throw new Error("Not authorize");

        return  {Authorization: "bearer " + user.token};
    };

    static postRequest = function<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>{
        const header = LoggedUser.getHeader();
        const innerConfig = {...config, headers: header};
        return axios.post(url, data, innerConfig);
    };

    static getRequest = function<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R>{
        const header = LoggedUser.getHeader();
        const innerConfig = {...config, headers: header};
        return axios.get(url, innerConfig);
    };
}

interface RequestRegisterAction {
    type: 'REQUEST_REGISTER';
}

interface ReceiveRegisterAction {
    type: 'RECEIVE_REGISTER';
    user: User;
}

interface ErrorRegisterAction {
    type: 'ERROR_REGISTER';
}

type KnownRegisterAction = RequestRegisterAction | ReceiveRegisterAction | ErrorRegisterAction | ShowMessageAction;

interface RequestLoginAction {
    type: 'REQUEST_LOGIN';
}

interface ReceiveLoginAction {
    type: 'RECEIVE_LOGIN';
    user: User;
}

interface ErrorLoginAction {
    type: 'ERROR_LOGIN';
}

type KnownLoginAction = RequestLoginAction | ReceiveLoginAction | ErrorLoginAction | ShowMessageAction;

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
            })
            .catch(r => {
                dispatch({type: "ERROR_REGISTER"});
                dispatch({
                    type: 'SHOW_MESSAGE',
                    props:{
                        message: r.message,
                        variant: "error"
                    }});
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
            .catch(r=>{
                dispatch({type: "ERROR_LOGIN"});
                dispatch({
                    type: 'SHOW_MESSAGE',
                    props:{
                        message: r.message,
                        variant: "error"
                    }});
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
                email: action.user.email,
                registerInProgress: false,
            };
        case 'ERROR_REGISTER':
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
                email: action.user.email,
                registerInProgress: false,
            };
        case 'ERROR_LOGIN':
            return {
                ...state,
                registerInProgress: false,
            };
        case 'LOGOUT':
            return {
                ...state,
                email: undefined,
            };
        default:
            return state;
    }
};
