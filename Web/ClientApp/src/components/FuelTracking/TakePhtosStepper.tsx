import React, {Dispatch, SetStateAction} from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import {connect} from "react-redux";
import {
    MuiPickersUtilsProvider,
    KeyboardDateTimePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import TakeFtrPhotoButton from './TakeFtrPhotoButton';
import ImgDialog from '../common/ImgDialog';

import * as FuelTrackingRecords from "../../store/FuelTrackingRecordsStore";
import {ApplicationState} from "../../store";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
        },
        button: {
            marginRight: theme.spacing(1),
        },
        instructions: {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
        },
        picture: {
            display: 'block',
            margin: '0 auto',
            height: '180px',
        },
        picker: {
            padding: "2rem"
        }
    }),
);

type DateNull = Date | null;
interface Props {
    selectedDate: {
        value: DateNull,
        set: Dispatch<SetStateAction<DateNull>>
    }
}

type HorizontalLinearStepperProps =
    FuelTrackingRecords.FuelTrackingRecordsState // ... state we've requested from the Redux store
    & typeof FuelTrackingRecords.actionCreators // ... plus action creators we've requested
    & Props;

function TakePhotosStepper(Props: HorizontalLinearStepperProps) {
    const classes = useStyles();
    const [activeStep, setActiveStep] = React.useState(0);
    
    const steps = ['Fuel Pump', 'Dashboard', 'time'];

    const handleDateChange = (date: Date | null) => {
        Props.selectedDate.set(date);
    };
    
    const handleNext = () => {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    };

    return (
        <div className={classes.root}>
            <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                    const stepProps: { completed?: boolean } = {};
                    const labelProps: { optional?: React.ReactNode } = {};
                    return (
                        <Step key={label} {...stepProps}>
                            <StepLabel {...labelProps}>{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
                <div>
                    <div>
                        <div hidden={activeStep !== 0}>
                            {Props.panelPictures.bumpPanelUlr && (<ImgDialog alt={""} src={Props.panelPictures.bumpPanelUlr}/>)}
                            <TakeFtrPhotoButton innerId={'bump'} takeFtrPhoto={(picture: File)=> {Props.addPanelPicture(FuelTrackingRecords.Panel.bump, picture)}}/>
                        </div>
                        <div hidden={activeStep !== 1}>
                            {Props.panelPictures.MotorbikePanelUlr && (<ImgDialog alt={""} src={Props.panelPictures.MotorbikePanelUlr}/>)}
                            <TakeFtrPhotoButton innerId={'motorbike'} takeFtrPhoto={(picture: File)=> {Props.addPanelPicture(FuelTrackingRecords.Panel.motorbike, picture)}}/>
                        </div>
                        <div hidden={activeStep !== 2}>
                            <MuiPickersUtilsProvider  utils={DateFnsUtils}>
                                <KeyboardDateTimePicker
                                    value={Props.selectedDate.value}
                                    onChange={handleDateChange}
                                    label="Keyboard with error handler"
                                    onError={console.log}
                                    minDate={new Date("2018-01-01T00:00")}
                                    format="yyyy/MM/dd hh:mm a"
                                    className={classes.picker}
                                />
                            </MuiPickersUtilsProvider>
                        </div>
                    </div>
                    <div>
                        <Button 
                            disabled={activeStep === 0} 
                            variant="contained"
                            color="primary"
                            onClick={handleBack}
                            className={classes.button}>
                            Back
                        </Button>
                        <Button
                            disabled={activeStep === steps.length - 1}
                            variant="contained"
                            color="primary"
                            onClick={handleNext}
                            className={classes.button}
                        >
                            Next
                        </Button>
                    </div>
                </div>
        </div>
    );
}

export default connect(
    (state: ApplicationState, ownProps: Props) => {
        return {...state.fuelTrackingRecords, ...ownProps};
    }, // Selects which state properties are merged into the component's props
    FuelTrackingRecords.actionCreators // Selects which action creators are merged into the component's props
)(TakePhotosStepper as any);