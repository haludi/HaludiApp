import React from 'react';
import MaterialIcon from '@material/react-material-icon';
import List, {ListItem, ListItemText, ListItemGraphic, } from '@material/react-list';
import {WithStyles, createStyles, withStyles} from "@material-ui/core/styles";

import '@material/react-list/index.scss';

const styles = createStyles({
    root: {
        "justify-content": "center",
    },
});

interface Props extends WithStyles<typeof styles> {
}

class Test extends React.PureComponent<Props> {
    state = {
        selectedIndex: 1,
    };

    render() {
        const { classes } = this.props;
        return (
            <List
                singleSelection
                selectedIndex={this.state.selectedIndex}
                handleSelect={(selectedIndex) => this.setState({selectedIndex})}
            >
                <ListItem className={classes.root}>
                    <ListItemGraphic tabIndex={10} graphic={<MaterialIcon icon='photo'/>} />
                    <ListItemText  primaryText='Photos'/>
                </ListItem>
                <ListItem>
                    <ListItemText primaryText='Recipes'/>
                </ListItem>
                <ListItem>
                    <ListItemText primaryText='Work'/>
                </ListItem>
            </List>
        );
    }
};

export default withStyles(styles, { withTheme: true })(Test);