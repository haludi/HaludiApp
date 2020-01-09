import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {createStyles, makeStyles, Theme} from "@material-ui/core";

import TakePhtosStepper from "./TakePhtosStepper";
import {FuelTrackingRecordsState, actionCreators} from "../../store/FuelTrackingRecordsStore";
import * as Notification from "../../store/PopupMessage";
import {connect} from "react-redux";
import {ApplicationState} from "../../store";
import SubmitButton from "../common/SubmitButton";
import IconButton from "@material-ui/core/IconButton";
import {AddCircle} from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'inline',
            float: 'right'
        },
    }),
);

type FormDialogProps =
    {
        fuelTrackingRecords: FuelTrackingRecordsState,
        popupMessage: Notification.State
    }
    & typeof actionCreators;

function TakeFtrPhotoDialog({fuelTrackingRecords, popupMessage, cleanPanelPictures, takeFtrPhotos}:  FormDialogProps) {
    const pictures = fuelTrackingRecords.panelPictures;
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(
        new Date(),
    );

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleCancel = () => {
        setOpen(false);
        cleanPanelPictures();
    };
    
    const handleSubmit = () => {
        takeFtrPhotos(selectedDate, handleClose);
    };
    
    const canSubscribe = (pictures && pictures.motorbikePanelPicture && pictures.bumpPanelPicture && !fuelTrackingRecords.isPostingTakeFtrPhotos
        && !popupMessage.notificationProps && true) || false;
    
    return (
        <div className={classes.root}>
            <IconButton onClick={handleClickOpen} color="primary">
                <AddCircle fontSize="large"/>
            </IconButton>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Create Fuel Tracking Record</DialogTitle>
                <DialogContent>
                    <TakePhtosStepper selectedDate={{value: selectedDate, set:setSelectedDate}}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} color="primary">
                        Cancel
                    </Button>
                    <SubmitButton isInProgress={(fuelTrackingRecords.isPostingTakeFtrPhotos && true) || false} disabled={!canSubscribe} handleSubmit={handleSubmit}/>
                </DialogActions>
            </Dialog>
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
)(TakeFtrPhotoDialog as any);