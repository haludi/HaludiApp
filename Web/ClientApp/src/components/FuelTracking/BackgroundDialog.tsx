import React, { FunctionComponent} from 'react';
import {Theme, useMediaQuery, useTheme } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import {createStyles, makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            backgroundColor: "rgba(252,255,238,0.5)",
            [theme.breakpoints.up('md')]: {
                padding: "150px",
            },
        }
    }),
);

type WrapperProps = {
    open: boolean,
    onClose: ()=>void,
    url: string | undefined,
}

const BackgroundDialog: FunctionComponent<WrapperProps> = ({ children, open, onClose, url }) => {
    const classes = useStyles();
    const theme = useTheme();
    const ifMd = useMediaQuery(theme.breakpoints.down('md'));
    return <Dialog fullScreen={ifMd} open={open} onClose={onClose} aria-labelledby="update-dialog-title">
        <div className={`${classes.root}`} style={{backgroundImage: url}}>
            { children }
        </div>
    </Dialog>
};

export default BackgroundDialog;