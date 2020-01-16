import * as React from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import './NavMenu.css';
import Register from "./user/Register";
import Login from "./user/Login";
import {LoggedUser, State} from "../store/UserStore";
import Logout from "./user/UserMenu";
import {connect} from "react-redux";
import {ApplicationState} from "../store";

type Props =
    { isOpen: boolean } // ... state we've requested from the Redux store
    & State;

class NavMenu extends React.PureComponent<Props> {
    public state = {
        isOpen: false
    };

    public render() {
        return (
            <header>
                <Navbar className="navbar-expand-sm navbar-toggleable-sm border-bottom box-shadow mb-3" light>
                    <Container>
                        <NavbarBrand tag={Link} to="/">Web</NavbarBrand>
                        <NavbarToggler onClick={this.toggle} className="mr-2"/>
                        <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={this.state.isOpen} navbar>
                            <ul className="navbar-nav flex-grow">
                                <NavItem>
                                    <NavLink tag={Link} className="text-dark" to="/">Home</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={Link} className="text-dark" to="/counter">Counter</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={Link} className="text-dark" to="/test">Test</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={Link} className="text-dark" to="/fetch-data">Fetch data</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={Link} className="text-dark" to="/fuel-tracking">Fuel Tracking</NavLink>
                                </NavItem>
                                {(LoggedUser.get() 
                                && <Logout/>)
                                || <React.Fragment>
                                      <NavItem>
                                          <Register/>
                                      </NavItem>
                                      <NavItem>
                                          <Login/>
                                      </NavItem>
                                </React.Fragment>}
                            </ul>
                        </Collapse>
                    </Container>
                </Navbar>
            </header>
        );
    }

    private toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }
}

export default connect((state: ApplicationState) => state.user)(NavMenu as any);