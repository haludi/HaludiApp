import React, {ChangeEvent, FocusEvent} from 'react';
import {createStyles, FormControl, makeStyles, Theme} from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        form: {
            display: "flex",
            "flex-direction": "column",
            margin: "0 auto",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            padding: "10px",
        },
    }),
);

interface Props<T extends string> {
    inputFields : { [K in  T ] : string }
    onChange?: (field :T, value: string)=>void;
    onFocus?: (field :T)=>void;
}

export default function Form<T extends string>({inputFields, onChange, onFocus}:  Props<T>) {
    const classes = useStyles();

    const [focusField, setFocusField] = React.useState<T>(Object.keys(inputFields)[0] as T);

    const onChangeInternal = onChange === undefined 
        ? undefined
        :(event: ChangeEvent<HTMLTextAreaElement>) => {
            const field = event.target.id as T;
            onChange(field, event.target.value);
        };
    
    const onFocusInternal = (event: FocusEvent<HTMLTextAreaElement>) => {
        const field = event.target.id as T;
        setFocusField(field);
        if (onFocus)
            onFocus(field);
    };

    return (<form className={classes.form}>
        {Object.keys(inputFields).map((key, index) =>
            <span key={key}>
                <FormControl>
                    <InputLabel htmlFor={key}>{inputFields[key as T]}</InputLabel>
                    <Input
                        autoComplete={"off"}
                        id={key}
                        onChange={onChangeInternal}
                        onFocus={onFocusInternal}
                        autoFocus={focusField === key}
                        aria-describedby={`my-helper-text`}/>
                </FormControl>
            </span>
        )}
    </form>);
}