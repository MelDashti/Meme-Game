import {Container, Nav, Navbar} from "react-bootstrap";
import {PersonCircle} from 'react-bootstrap-icons';
import {useNavigate} from "react-router-dom";

function NavComp({loggedIn, handleLogout}) {
    const navigate = useNavigate();

    return (
        <Navbar expand="lg" bg="dark" variant="dark" className="py-3">
            <Container>
                <Navbar.Brand
                    className="fw-bold fs-2"
                    href="/"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate("/");
                    }}
                >
                    Meme Game
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        {loggedIn ? (
                            <Nav.Link onClick={handleLogout} className="d-flex align-items-center text-white">
                                <PersonCircle className="me-2"/> Logout
                            </Nav.Link>
                        ) : (
                            <Nav.Link href="/login" className="d-flex align-items-center text-white">
                                <PersonCircle className="me-2"/> Login
                            </Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavComp;