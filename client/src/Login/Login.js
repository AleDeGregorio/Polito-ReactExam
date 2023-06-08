import { useState } from 'react';
import * as EmailValidator from 'email-validator';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

function Login(props) {
    const { login, setShow, setError } = props;

    const [username, setUsername] = useState('alessio@polito.it');
    const [password, setPassword] = useState('password');

    const handleSumbit = (e) => {
        e.preventDefault();
        const credentials = { username, password };

        let valid = true;
        if (username === '' || password === '')
            valid = false;

        if (username !== "" && !EmailValidator.validate(username)) {
            valid = false;
        }

        if (valid) {
            login(credentials);
        }
        else {
            setShow(true);
            setError('Formato dati inseriti non corretto. Riprova');
        }
    };

    return (
        <Container>
            <Row>
                <Col>
                    <br />
                    <h2>Login</h2>
                    <Form onSubmit={handleSumbit}>
                        <br />
                        <br />
                        <Form.Group controlId='email'>
                            <Form.Label style={{'fontWeight':'bold'}}>Email</Form.Label>
                            <Form.Control type='email' autoFocus value={username} onChange={ev => setUsername(ev.target.value)} />
                        </Form.Group>
                        <br />
                        <Form.Group controlId='password'>
                            <Form.Label style={{'fontWeight':'bold'}}>Password</Form.Label>
                            <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                        </Form.Group>
                        <br />
                        <div className="d-grid gap-2">
                            <Button variant="dark" size="lg" type='submit'>
                                Login
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;