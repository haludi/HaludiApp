import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import PhotoCamera from '@material-ui/icons/PhotoCamera';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            '& > *': {
                margin: theme.spacing(1),
            },
        },
        input: {
            display: 'none',
        },
    }),
);

interface Props {
    innerId: string;
    takeFtrPhoto: (file: File) => void
}

export default function TakeFtrPhotoButton(Props: Props) {
    const classes = useStyles();
    let id = `${Props.innerId}-icon-button-file`;
    return (
        <div className={classes.root}>
            <input 
                accept="image/*" 
                className={classes.input} 
                id={id} 
                type="file" 
                onChange={(e)=>{
                    if(!e.target.files || e.target.files.length === 0)
                        return;
                    
                    console.log(e.target.files[0].lastModified.toLocaleString());
                    Props.takeFtrPhoto( e.target.files[0])}}
            />
            <label htmlFor={id}>
                <IconButton color="primary" aria-label="upload picture" component="span">
                    <PhotoCamera />
                </IconButton>
            </label>
        </div>
    );
}