import React from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from "@material-ui/core/CircularProgress";

interface Props {
    isInProgress: boolean;
    disabled?: boolean;
    handleSubmit: ()=>void;
}

export default function SubmitButton({isInProgress, disabled, handleSubmit}: Props) {
    return (isInProgress
        && <CircularProgress/>)
        || (<Button disabled={disabled} onClick={handleSubmit} color="primary">
            Subscribe
        </Button>);
}