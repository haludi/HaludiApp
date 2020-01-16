import {FuelTrackingRecord} from "../../store/FuelTrackingRecordsStore";
import List, {ListItem, ListItemGraphic, ListItemText} from "@material/react-list";
import MaterialIcon from "@material/react-material-icon";
import React from "react";
import {createStyles, makeStyles, Theme} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        item: {
            "justify-content": "center",
        },
    }),
);

interface Props {
    handleSelect: (selectedIndex: number) => void;
    fuelTrackingRecords: FuelTrackingRecord[];
}

export default function FtrList({handleSelect, fuelTrackingRecords}: Props) {
    const classes = useStyles();

    return <List
        singleSelection
        handleSelect={handleSelect}
    >
        {fuelTrackingRecords.map((r) =>
            <ListItem key={r.dateTime} className={classes.item}>
                <ListItemGraphic tabIndex={10} graphic={<MaterialIcon icon='photo'/>}/>
                <ListItemText primaryText={new Date(r.dateTime).toLocaleString()}/>
            </ListItem>)}
    </List>;
}