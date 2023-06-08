import { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import './EditOption.css';

function ShowSuccess(props) {
    const success = props.success;
    const setSuccess = props.setSuccess;

    if (success) {
        return (
            <Alert variant="success" onClose={() => setSuccess(false)} dismissible>
                <Alert.Heading>Operazione completata con successo</Alert.Heading>
            </Alert>
        );
    }
}

function EditOption(props) {
    const { setTempOption, showForm, setShowForm, setShow, setError } = props;

    const [fullTime, setFullTime] = useState(null);
    const [success, setSuccess] = useState(false);

    const changeOption = (option) => {
        if (option.target.id === 'fullTime')
            setFullTime(true);

        else
            setFullTime(false);
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (fullTime === null) {
            setError("Selezionare un'opzione per continuare");
            setShow(true);
            return;
        }

        setTempOption(fullTime);
    }

    if (showForm) {
        return (
            <>
                <ShowSuccess success={success} setSuccess={setSuccess} />
                <Container fluid className='containerCreatePlan'>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="planOption">
                            <Form.Label style={{ 'fontWeight': 'bold' }}>Scegli l'opzione per il piano di studi</Form.Label>
                            <Form.Check type="radio" label="Full-time" id='fullTime' onChange={changeOption} checked={fullTime} />
                            <Form.Text className="text-muted">
                                Num. crediti tra 60 e 80
                            </Form.Text>
                            <Form.Check type="radio" label="Part-time" id='partTime' onChange={changeOption} checked={fullTime === false} />
                            <Form.Text className="text-muted">
                                Num. crediti tra 20 e 40
                            </Form.Text>
                        </Form.Group>
                        <Button variant='primary' type='submit' className='planOption'>Conferma</Button>
                        <Button variant='danger' className='planOption' onClick={() => setShowForm(false)}>Annulla</Button>
                    </Form>
                </Container>
            </>
        );
    }
}

export default EditOption;