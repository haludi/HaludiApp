import React from 'react';
import {connect} from "react-redux";
import Button from '@material-ui/core/Button';

import {ApplicationState} from "../../store";
import {actionCreators, FuelTrackingRecord, FuelTrackingRecordsState} from "../../store/FuelTrackingRecordsStore";
import {Theme, } from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import { withStyles} from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import FtrList from "./FtrList";
import SubmitButton from "../common/SubmitButton";
import Form from "../common/Form";
import * as Notification from "../../store/PopupMessage";
import {LoggedUser} from "../../store/UserStore";
import BackgroundDialog from "./BackgroundDialog";

const styles = (theme: Theme) => {
    return {
        root: {
        },
        form: {
            display: "flex",
                "flex-direction": "column",
                margin: "0 auto",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                padding: "10px",
        },
        loading: {
            display: 'flex',
                '& > * + *': {
                marginLeft: theme.spacing(2),
            },
        },
        errorMessage: {
            margin: theme.spacing(1),
        },
        input: {
            backgroundColor: "#1976d2",
                color: "white",
                margin: "20px 10px 0  0",
                borderRadius: "0 10px 0 10px"
        },
        inputUp:{
            marginBottom: "7.7em"
        },
    };
};

type FieldType = "fuelFilled" | "cost" | "mileage";
const inputFields : { [K in FieldType] : string } = {
    "fuelFilled": "Fuel Filled",
    "cost": "Cost",
    "mileage": "Mileage",
};

interface ImageState {
    isLoading?:boolean, 
    image?: {
        data: Blob,
        internalUrl: any,
        publicUrl: string
    }
}

type ImageType = "bump" | "motorbike";
type ImagesState = { [K in ImageType] : ImageState } & {current: ImageType, index: number | null};

type Props =
    {
        theme: Theme,
        fuelTrackingRecords: FuelTrackingRecordsState,
        popupMessage: Notification.State,
        classes: any,
    }
    & typeof actionCreators;

type State = {
    toSubmit: FuelTrackingRecord | null,
    isPosting: boolean,
    hiddenContent: boolean,
    imagesState: ImagesState,
}

class RecordFuelTrackingTable extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            toSubmit: null,
            isPosting: false,
            hiddenContent: false,
            imagesState: {
                current: "bump",
                bump: {},
                motorbike: {},
                index: null
            }
        };

        this.getBackgroundPictures = this.getBackgroundPictures.bind(this); 
        this.getBackgroundPicture = this.getBackgroundPicture.bind(this); 
        this.handleToggleHide = this.handleToggleHide.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleSubscribe = this.handleSubscribe.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onFocus = this.onFocus.bind(this);
    }

    getBackgroundPicture(url: string, imageType: ImageType) {
        let newState = {...this.state};
        const imageState = this.state.imagesState[imageType];
        if (!imageState.isLoading && !(imageState.image && imageState.image.publicUrl === url))
        {
        newState.imagesState[imageType].isLoading = true;
        this.setState(newState);
        LoggedUser.getRequest<Blob>(url, {responseType: 'blob'})
            .then(r => {
                let internalUrl = URL.createObjectURL(r.data);
                let newState = {...this.state};
                newState.imagesState[imageType] = {
                    isLoading: false,
                    image: {
                        data: r.data,
                        internalUrl: internalUrl,
                        publicUrl: url
                    }
                };
                this.setState(newState);
            })
        }
    }
    
    getBackgroundPictures(i: number) {
        if(this.state.imagesState.index !== i)
        {
            let newState = {...this.state};
            newState.imagesState.index = i;
            newState.imagesState.bump.image = undefined;
            newState.imagesState.motorbike.image = undefined;
            this.setState(newState);
        }
        const id = this.props.fuelTrackingRecords.records[i].id;
        this.getBackgroundPicture(`/api/v1/${id}/image/bumpPanelPicture`, "bump");
        this.getBackgroundPicture(`/api/v1/${id}/image/motorbikePanelPicture`, "motorbike");
    };

    handleToggleHide() {
        this.setState({...this.state, hiddenContent: !this.state.hiddenContent});
    };

    handleCancel() {
        let newState = {...this.state};
        newState.imagesState.index = null;
        newState.toSubmit = null;
        this.setState(newState);
    };

    handleSubscribe() {
        if (this.state.toSubmit) {
            this.setState({...this.state, isPosting: true});

        this.props.fillFtrDetails(this.state.toSubmit, () => {
                let newState = {...this.state};
                newState.imagesState.index = null;
                newState.isPosting = false;
                newState.toSubmit = null;
                this.setState(newState);
            },
            () => this.setState({...this.state, isPosting: false}))
        }
    };

    onChange(field: FieldType, value: string) {
        if (this.state.imagesState.index == null)
            return;

        const localToSubmit = this.state.toSubmit ?? this.props.fuelTrackingRecords.records[this.state.imagesState.index];
        let newObj = {...localToSubmit};
        switch (field) {
            case "fuelFilled":
                newObj.fuelFilled = Number(value);
                break;
            case "cost":
                newObj.cost = Number(value);
                break;
            case "mileage":
                newObj.mileage = Number(value);
                break;
            default:
                throw new Error(`Unexpected field: ${field}. value:${value}`);
        }
        this.setState({...this.state, toSubmit: newObj});
    }

    onFocus(field: FieldType) {
        let newState = {...this.state};
        if (field === "mileage") {
            if (this.state.imagesState.current !== "motorbike")
                newState.imagesState.current = "motorbike";
        } else {
            if (this.state.imagesState.current !== "bump")
                newState.imagesState.current = "bump";
        }
        this.setState(newState);
    }
    
    render() {
        const {fuelTrackingRecords, popupMessage, classes} = this.props;
        const {toSubmit, imagesState, hiddenContent, isPosting} = this.state;

        const canSubscribe = (toSubmit && toSubmit.mileage && toSubmit.cost && toSubmit.fuelFilled && !popupMessage.notificationProps && true) || false;

        let url = undefined;
            const image = imagesState[imagesState.current].image;
            if (image) {
                url = `url(${image.internalUrl})`;
            }

        return (
            <div>
                <BackgroundDialog open={imagesState.index !== null} onClose={this.handleCancel} url={url} aria-labelledby="update-dialog-title">
                    <DialogTitle id="update-dialog-title">Fill Details</DialogTitle>
                    <DialogContent style={{visibility: hiddenContent ? "hidden" : "visible"}}>
                        <Form inputFields={inputFields} onChange={this.onChange} onFocus={this.onFocus}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleToggleHide} color="primary">
                            {hiddenContent ? "Show" : "Hide"}
                        </Button>
                        <Button onClick={this.handleCancel} color="primary">
                            Cancel
                        </Button>
                        <SubmitButton isInProgress={isPosting} disabled={!canSubscribe} handleSubmit={this.handleSubscribe}/>
                    </DialogActions>
                </BackgroundDialog>
                {(fuelTrackingRecords.isLoading
                    && <div className={classes.loading}><CircularProgress/></div>)
                || (<FtrList handleSelect={this.getBackgroundPictures} fuelTrackingRecords={fuelTrackingRecords.records}/>)}
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState) => {
        return {
            fuelTrackingRecords: state.fuelTrackingRecords,
            popupMessage: state.popupMessage
        }},
    actionCreators
)(withStyles(styles, {withTheme:true})(RecordFuelTrackingTable) as any);