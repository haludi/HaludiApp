import * as React from 'react';
import { Container } from 'reactstrap';
import NavMenu from './NavMenu';
import PopupMessage from './PopupMessage';

export default (props: { children?: React.ReactNode }) => (
    <React.Fragment>
        <NavMenu/>
        <Container>
            {props.children}
        </Container>
        <PopupMessage />
    </React.Fragment>
);
