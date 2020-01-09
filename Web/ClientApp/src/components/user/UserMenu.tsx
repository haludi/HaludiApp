import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {actionCreators, LoggedUser, State as UserState} from "../../store/UserStore";
import {FlightTakeoff} from "@material-ui/icons";
import {connect} from "react-redux";
import {ApplicationState} from "../../store";
import {State as NotificationState} from "../../store/PopupMessage";
import {Redirect, useHistory} from "react-router";

const StyledMenu = withStyles({
    paper: {
        border: '1px solid #d3d4d5',
    },
})((props: MenuProps) => (
    <Menu
        elevation={0}
        getContentAnchorEl={null}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
        }}
        {...props}
    />
));

const StyledMenuItem = withStyles(theme => ({
    root: {
        '&:focus': {
            backgroundColor: theme.palette.primary.main,
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                color: theme.palette.common.white,
            },
        },
    },
}))(MenuItem);

type Props =
    {
        userState: UserState,
        popupMessage: NotificationState
    }
    & typeof actionCreators;

function UserMenu({ logout }: Props) {
    const history = useHistory();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        history.push("/");
        logout();
        setAnchorEl(null);
    };
    
    return (
        <div>
            <Button
                aria-controls="customized-menu"
                aria-haspopup="true"
                // variant="contained"
                color="primary"
                onClick={handleClick}
            >
                {LoggedUser.get()?.email}
            </Button>
            <StyledMenu
                id="customized-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <StyledMenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <FlightTakeoff fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </StyledMenuItem>
            </StyledMenu>
        </div>
    );
}

export default connect(
    (state: ApplicationState) => {
        return {
            userState: state.user,
        }},
    actionCreators
)(UserMenu as any);