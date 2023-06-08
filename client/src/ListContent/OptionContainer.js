import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { PlusCircle } from 'react-bootstrap-icons';

import EditOption from './EditOption';

function OptionContainer(props) {
    const { user, setTempOption, setDirty, setShow, setError } = props;

    const [showForm, setShowForm] = useState(false);

    return (
        <Container fluid>
            <h1>Piano studi di {user?.nome} {user?.cognome}</h1>
            <span className='iconPlan' onClick={() => setShowForm(true)}><PlusCircle /> Clicca qui per creare il piano di studi</span>
            <EditOption setTempOption={setTempOption} showForm={showForm} setShowForm={setShowForm}
                setDirty={setDirty} setShow={setShow} setError={setError} />
            <h4>Nessun piano di studi ancora definito...</h4>
        </Container>
    );
}

export default OptionContainer;