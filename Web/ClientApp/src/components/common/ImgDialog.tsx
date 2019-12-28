import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {createStyles, makeStyles, Theme} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        img: {
            height: '180px',
        }
    }),
);

interface ImgDialogProps {
    src: string;
    alt: string;
}

export default function ImgDialog(Props: ImgDialogProps) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div >
            <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                <img className={classes.img} alt={Props.alt} src={Props.src}/>
            </Button>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{Props.alt}</DialogTitle>
                <DialogContent>
                    <img alt={""} src={Props.src}/>
                </DialogContent>
            </Dialog>
        </div>
    );
}