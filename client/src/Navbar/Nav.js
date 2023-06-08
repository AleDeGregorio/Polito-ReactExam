import { Navbar, Container, Button } from 'react-bootstrap'
import { Book, PersonCircle } from 'react-bootstrap-icons'

import { useNavigate } from 'react-router-dom'

import './Nav.css'

function Nav(props) {
    const user = props.user;
    const logOut = props.logOut;
    const loggedIn = props.loggedIn;

    const navigate = useNavigate();

    return (
        <Navbar bg='dark'>
            <Container fluid>

                {loggedIn &&
                    <div className='p-2 bd-highlight'><PersonCircle className='personIcon' />
                        <p style={{ color: 'white' }}> Bentornato, {user.nome}</p>
                    </div>
                }
                <div className='p-2 bd-highlight'>
                    <span className='head-text' onClick={() => navigate('/')}><Book /> Home-page</span>
                </div>
                { loggedIn ?
                    <Button variant="danger" onClick={logOut}>Logout</Button> :
                    <Button variant="danger" onClick={() => navigate('/login')}>Login</Button>
                }
            </Container>
        </Navbar>
    )
}

export default Nav;