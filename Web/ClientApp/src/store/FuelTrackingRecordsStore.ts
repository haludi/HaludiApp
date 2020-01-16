import {Action, Reducer} from 'redux';
import {AppThunkAction} from './';
import * as PopupMessage from './PopupMessage'
import { LoggedUser } from "./UserStore";

// -----------------
// STATE - This defines the type of data maintained in the Redux store.
interface IPanelPictures {
    bumpPanelPicture?: File;
    bumpPanelUlr?: string;
    motorbikePanelPicture?: File;
    MotorbikePanelUlr?: string;
    date?: Date;
}

interface PostState {
    errorMessage?: string;
}

export interface FuelTrackingRecordsState {
    isLoading?: boolean;
    loadingError?: string;
    isPostingTakeFtrPhotos?: boolean;
    postFillDetailsState?: PostState;
    startIndex?: number;
    panelPictures: IPanelPictures;
    records: FuelTrackingRecord[];
}

export interface FuelTrackingRecord {
    id?: string;
    dateTime: string;
    fuelFilled?: number;
    cost?: number;
    mileage?: number;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface RequestFuelTrackingRecordsAction {
    type: 'REQUEST_FUEL_TRACKING_RECORDS';
    startIndex: number;
    pageSize: number;
}
interface ReceiveFuelTrackingRecordsAction {
    type: 'RECEIVE_FUEL_TRACKING_RECORDS';
    startIndex: number;
    records: FuelTrackingRecord[];
}
interface ErrorFuelTrackingRecordsAction {
    type: 'ERROR_FUEL_TRACKING_RECORDS';
    errorMessage: string;
}
type KnownGetAction = RequestFuelTrackingRecordsAction | ReceiveFuelTrackingRecordsAction | ErrorFuelTrackingRecordsAction;


interface RequestTakePhotosAction {
    type: 'REQUEST_TAKE_FTR_PHOTOS';
}
interface ReceiveTakePhotosAction {
    type: 'RESPOND_TAKE_FTR_PHOTOS';
    record: FuelTrackingRecord;
    //DOTO to add new element to list
}
interface ErrorTakePhotosAction {
    type: 'ERROR_TAKE_FTR_PHOTOS';
    //DOTO to add new element to list
}
type KnownTakeFtrPhotosAction = RequestTakePhotosAction | ReceiveTakePhotosAction | ErrorTakePhotosAction | PopupMessage.ShowMessageAction;


interface RequestFillDataAction {
    type: 'REQUEST_FILL_FTR_DETAIL';
}
interface ReceiveFillDataAction {
    type: 'RECEIVE_FILL_FTR_DETAIL';
    recordId: string;
}
type KnownFillDataAction = RequestFillDataAction | ReceiveFillDataAction | PopupMessage.ShowMessageAction;


export enum Panel {
    bump = 1,
    motorbike,
}
interface AddPanelPictureAction {
    type: 'ADD_PANEL_PICTURE';
    panel: Panel;
    picture: File;
    url?: string;
}
interface CleanPanelPicturesAction {
    type: 'CLEAN_PANEL_PICTURES';
}
interface CommitPanelPicturesAction {
    type: 'COMMIT_PANEL_PICTURES';
    date: Date; 
}
type KnownPanelPictureAction = AddPanelPictureAction | CleanPanelPicturesAction | CommitPanelPicturesAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestFuelTrackingRecords: (startIndex: number, pageSize: number): AppThunkAction<KnownGetAction> => (dispatch, getState) => {
        const appState = getState();
        if (appState && appState.fuelTrackingRecords && startIndex !== appState.fuelTrackingRecords.startIndex) {
            LoggedUser.getRequest<FuelTrackingRecord[]>("fuelTracking/first-step?pageNo=0&pageSize=10")
                .then(r => {
                    dispatch({ type: 'RECEIVE_FUEL_TRACKING_RECORDS', startIndex: startIndex, records: r.data });
                })
                .catch(e =>{
                    dispatch({ type: 'ERROR_FUEL_TRACKING_RECORDS', errorMessage: e.message});
                });

            dispatch({ type: 'REQUEST_FUEL_TRACKING_RECORDS', startIndex: startIndex , pageSize: pageSize});
        }
    },
    takeFtrPhotos: (date: Date | null, onSuccess: () => any): AppThunkAction<KnownTakeFtrPhotosAction> => (dispatch, getState) => {
        const appState = getState();

        if (appState && appState.fuelTrackingRecords && appState.fuelTrackingRecords.panelPictures) {
            let pictures = appState.fuelTrackingRecords.panelPictures;
            if(pictures.motorbikePanelPicture && pictures.bumpPanelPicture)
            {
                let form = new FormData();
                form.append("bumpPanelPicture", pictures.bumpPanelPicture);
                form.append("motorbikePanelPicture", pictures.motorbikePanelPicture);
                if(date)
                    form.append("date", date.toUTCString());

                LoggedUser.postRequest<FuelTrackingRecord>(`/api/v1/fuel-tracking/take-photos`, form)
                    .then(r => {
                        dispatch({ type: 'RESPOND_TAKE_FTR_PHOTOS', record: r.data});
                        dispatch({type: 'SHOW_MESSAGE', props: {message: "Record created", variant: "success"}});
                        onSuccess();
                    })
                    .catch(r => {
                        dispatch({ type: 'ERROR_TAKE_FTR_PHOTOS'});
                        dispatch({ 
                            type: 'SHOW_MESSAGE', 
                            props:{
                                message: r.message, 
                                variant: "error"
                            }});
                    });

                dispatch({ type: 'REQUEST_TAKE_FTR_PHOTOS'});
            }
        }
    },
    fillFtrDetails: (record: FuelTrackingRecord, onSuccess: ()=>void, onFail: ()=>void): AppThunkAction<KnownFillDataAction> => (dispatch, getState) => {
        if(record.id == null  || record.fuelFilled == null || record.cost == null || record.mileage == null)
            return;

        LoggedUser.postRequest('/api/v1/fuel-tracking/fill-detail', record)
            .then(r => {
                onSuccess();
                // @ts-ignore
                dispatch({ type: 'RECEIVE_FILL_FTR_DETAIL', recordId: record.id});
            })
            .catch(r =>{
                onFail();
                dispatch({
                    type: 'SHOW_MESSAGE',
                    props:{
                        message: r.message,
                        variant: "error"
                    }});
            });
        
        dispatch({ type: 'REQUEST_FILL_FTR_DETAIL'});
    },
    addPanelPicture: (panel: Panel, picture: File): AppThunkAction<AddPanelPictureAction> => (dispatch, getState) => {
        let reader = new FileReader();
        
        reader.onloadend = (e) => {
            if(typeof reader.result === 'string')
                dispatch({ type: 'ADD_PANEL_PICTURE', panel, picture, url: reader.result});
        };
        reader.readAsDataURL(picture)
    },
    cleanPanelPictures: (): AppThunkAction<CleanPanelPicturesAction> => (dispatch, getState) => {
        dispatch({ type: 'CLEAN_PANEL_PICTURES'});
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

const unloadedState: FuelTrackingRecordsState = { records: [], isLoading: false, panelPictures: {} };

export const reducer: Reducer<FuelTrackingRecordsState> = (state: FuelTrackingRecordsState | undefined, incomingAction: Action): FuelTrackingRecordsState => {
    if (state === undefined) {
        return unloadedState;
    }

    const action = incomingAction as KnownGetAction | KnownFillDataAction | KnownPanelPictureAction | KnownTakeFtrPhotosAction;
    switch (action.type) {
        case 'REQUEST_FUEL_TRACKING_RECORDS':
            return {
                ...state,
                startIndex: action.startIndex,
                records: state.records,
                isLoading: true
            };
        case 'RECEIVE_FUEL_TRACKING_RECORDS':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.startIndex === state.startIndex) {
                return {
                    ...state,
                    startIndex: action.startIndex,
                    records: action.records,
                    isLoading: false
                };
            }
            break;
        case "ERROR_FUEL_TRACKING_RECORDS":
            return {
                ...state,
                isLoading: false,
                loadingError: action.errorMessage,
            };
        case 'REQUEST_TAKE_FTR_PHOTOS':
            return {
                ...state,
                isPostingTakeFtrPhotos: true,
            };
        case 'RESPOND_TAKE_FTR_PHOTOS':
            return {
                ...state,
                records: [action.record, ...state.records],
                panelPictures: {},
                isPostingTakeFtrPhotos: false,
            };
        case 'ERROR_TAKE_FTR_PHOTOS':
            return {
                ...state,
                isPostingTakeFtrPhotos: false,
            };
        case 'REQUEST_FILL_FTR_DETAIL':
            return {
                ...state,
                postFillDetailsState:{},
            };
        case 'RECEIVE_FILL_FTR_DETAIL':
            return {
                ...state,
                records: state.records.filter(function(r){
                    return r.id !== action.recordId;
                }),
                postFillDetailsState: undefined,
            };
        case 'ADD_PANEL_PICTURE':
            let newPanel = {...state.panelPictures};
            
            if(action.panel === Panel.bump){
                newPanel.bumpPanelUlr = action.url;
                newPanel.bumpPanelPicture = action.picture;
            }
            else{
                newPanel.MotorbikePanelUlr = action.url;
                newPanel.motorbikePanelPicture = action.picture;
            }
            return {
                ...state,
                panelPictures: newPanel
            };
        case 'CLEAN_PANEL_PICTURES':
            return {
                ...state,
                panelPictures: {},
            };
        
    }

    return state;
};
