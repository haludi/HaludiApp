import React from 'react';
import {connect} from "react-redux";
import Button from '@material-ui/core/Button';

import {ApplicationState} from "../../store";
import {actionCreators, FuelTrackingRecord, FuelTrackingRecordsState} from "../../store/FuelTrackingRecordsStore";
import {createStyles, makeStyles, Theme, useMediaQuery, useTheme} from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import CircularProgress from '@material-ui/core/CircularProgress';
import FtrList from "./FtrList";
import SubmitButton from "../common/SubmitButton";
import Form from "../common/Form";
import * as Notification from "../../store/PopupMessage";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        form: {
            display: "flex",
            "flex-direction": "column",
            margin: "0 auto",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            padding: "10px",
        },
        dialogIfNotMd: {
            padding: "150px",
        },
        dialog: {
            "background-size": "cover",
            "background-repeat": "no-repeat",
            "background-position": "center center",
            backgroundColor: "rgba(252,255,238,0.5)",
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
        hidden:{
            visibility: "hidden"
        }
    }),
);

type FieldType = "fuelFilled" | "cost" | "mileage";
const inputFields : { [K in FieldType] : string } = {
    "fuelFilled": "Fuel Filled",
    "cost": "Cost",
    "mileage": "Mileage",
};

type RecordFuelTrackingTableProps =
    {
        fuelTrackingRecords: FuelTrackingRecordsState,
        popupMessage: Notification.State
    }
    & typeof actionCreators;

type BackgroundType = "bumpPanelPicture" | "motorbikePanelPicture"; 

function RecordFuelTrackingTable({fuelTrackingRecords, popupMessage, fillFtrDetails}:  RecordFuelTrackingTableProps) {
    const classes = useStyles();

    const [toSubmit, setToSubmit] = React.useState<FuelTrackingRecord | null>(null);
    const [index, setIndex] = React.useState<number | null>(null);
    const [isPosting, setIsPosting] = React.useState<boolean>(false);
    const [hiddenContent, setHiddenContent] = React.useState<boolean>(false);
    const [background, setBackground] = React.useState<BackgroundType>("bumpPanelPicture");

    
    const handleToggleHide = () => {
        setHiddenContent(!hiddenContent);
    };
    
    const handleCancel = () => {
        setIndex(null);
        setToSubmit(null);
    };

    const handleSubscribe = () => {
        if(toSubmit)
        {
            setIsPosting(true);
            
            fillFtrDetails(toSubmit, () => {
                setIndex(null);
                setIsPosting(false);
                setToSubmit(null);
            },
                () => setIsPosting(false));
        }
    };

    function onChange(field: FieldType, value: string) {
        if(index == null)
            return;

        const localToSubmit = toSubmit?? fuelTrackingRecords.records[index];
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
        setToSubmit(newObj);
    }
    function onFocus(field: FieldType){
        if(field == "mileage"){
            if(background != "motorbikePanelPicture")
                setBackground("motorbikePanelPicture");
        }
        else{
            if(background != "bumpPanelPicture")
                setBackground("bumpPanelPicture");
        }
    }
    
    const theme = useTheme();
    const ifMd = useMediaQuery(theme.breakpoints.down('md'));

    const canSubscribe = (toSubmit && toSubmit.mileage && toSubmit.cost && toSubmit.fuelFilled  && !popupMessage.notificationProps  && true) || false;

    return (
        <div>
            <Dialog fullScreen={ifMd} open={index !== null} onClose={handleCancel}
                    aria-labelledby="update-dialog-title">
                <div
                    className={`${classes.dialog} ${ifMd ? "" : classes.dialogIfNotMd}`}
                    style={index != null ? {backgroundImage: `url('/api/v1/${fuelTrackingRecords.records[index].id}/image/${background}')`} : undefined}>
                    <DialogTitle id="update-dialog-title">Fill Details</DialogTitle>
                    <DialogContent className={hiddenContent ? classes.hidden : ""}>
                        <Form inputFields={inputFields} onChange={onChange} onFocus={onFocus}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleToggleHide} color="primary">
                            {hiddenContent ? "Show" : "Hide"}
                        </Button>
                        <Button onClick={handleCancel} color="primary">
                            Cancel
                        </Button>
                        <SubmitButton isInProgress={isPosting} disabled={canSubscribe} handleSubmit={handleSubscribe}/>
                    </DialogActions>
                </div>
            </Dialog>
            {(fuelTrackingRecords.isLoading
                && <div className={classes.loading} ><CircularProgress /></div>)
            ||(<FtrList handleSelect={(selectedIndex) => {
                setIndex(selectedIndex);
            }} fuelTrackingRecords={fuelTrackingRecords.records}/>)}
        </div>
    );
}

export default connect(
    (state: ApplicationState) => {
        return {
            fuelTrackingRecords: state.fuelTrackingRecords,
            popupMessage: state.popupMessage
        }},
    actionCreators
)(RecordFuelTrackingTable as any);