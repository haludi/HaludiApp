import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {createStyles, makeStyles, Theme} from "@material-ui/core";

import {State as NotificationState} from "../../store/PopupMessage";
import {connect} from "react-redux";
import {ApplicationState} from "../../store";
import SubmitButton from "../common/SubmitButton";
import Form from "../common/Form";
import {actionCreators, State as UserState, LoginField, LoginViewModel} from "../../store/UserStore";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        dialog: {
            padding: "1em",
        },
    }),
);

const inputFields : { [K in LoginField] : string } = {
    "email": "Email",
    "password": "Password",
};

type Props =
    {
        userState: UserState,
        popupMessage: NotificationState
    }
    & typeof actionCreators;

function Login({userState, login, popupMessage}:  Props) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const [toSubmit, setToSubmit] = React.useState<LoginViewModel>({
        email: "",
        password: "",
    });

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = () => {
        login(toSubmit, () => setOpen(false));
    };

    const handleChange = (field: LoginField, value: string) => {
        let newToSubmit = {
            ...toSubmit,
        };
        newToSubmit[field] = value;
        setToSubmit(newToSubmit);
    };

    return (
        <React.Fragment>
            <Button onClick={handleClickOpen} color="primary">
                Login
            </Button>
            <Dialog  open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <div className={classes.dialog}>
                    <DialogTitle id="form-dialog-title">Login</DialogTitle>
                    <DialogContent>
                        <Form inputFields={inputFields} onChange={handleChange}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <SubmitButton isInProgress={(userState.registerInProgress && true) || false} handleSubmit={handleSubmit}/>
                    </DialogActions>
                </div>
            </Dialog>
        </React.Fragment>
    );
}

export default connect(
    (state: ApplicationState) => {
        return {
            userState: state.user,
            popupMessage: state.popupMessage
        }},
    actionCreators
)(Login as any);