import {useState} from 'react';
import {Alert, Button, Col, Form, Row} from 'react-bootstrap';
import {Link, useNavigate} from 'react-router-dom';
import API from '../API.mjs';

function LoginComp(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = (credentials) => {
        API.login(credentials)
            .then(user => {
                props.loggedInSuccess(user);
                setErrorMessage("");
                // redirect to home
                navigate("/");
            })
            .catch(error => {
                setErrorMessage(error.message);
            });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrorMessage('');

        if (!username || !password) {
            setErrorMessage('Username and password are required.');
            return;
        }

        const credentials = {username, password};
        handleLogin(credentials);
    };

    return (
        <Row className="justify-content-md-center">
            <Col md={6}>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId='username' className='mb-3'>
                        <Form.Label>Email</Form.Label>
                        <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)}
                                      required={true}/>
                    </Form.Group>

                    <Form.Group controlId='password' className='mb-3'>
                        <Form.Label>Password</Form.Label>
                        <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)}
                                      required={true} minLength={6}/>
                    </Form.Group>

                    <Button type='submit'>Login</Button>
                    <Link className='btn btn-danger mx-2 my-2' to={'/'}>Cancel</Link>

                    {errorMessage ? (
                        <Alert variant='danger' dismissible onClose={() => setErrorMessage('')}>
                            {errorMessage}
                        </Alert>
                    ) : null}
                </Form>
            </Col>
        </Row>
    )
};

function LogoutButton(props) {
    return (
        <Button variant='outline-light' onClick={props.logout}>Logout</Button>
    )
}

export {LoginComp, LogoutButton};