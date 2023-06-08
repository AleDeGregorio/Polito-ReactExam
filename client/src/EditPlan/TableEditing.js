import { useEffect, useState } from "react";
import { Table, Container, Accordion, Button, Alert } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

import API from "../API";

import RenderTableEditing from "./RenderTableEditing";

function RenderList(props) {
    const { list } = props;

    let listRendering = false;

    if (list.length) {
        listRendering = list.map((course) => {
            return (
                <p key={course.codice} style={{ 'fontWeight': 'bold' }}>
                    {course.codice} - {course.nome} - {course.crediti} crediti
                </p>
            )
        });
    }

    return (<>{listRendering}</>);
}

function TableEditing(props) {
    const { setShow, setError, tempOption, setTempOption, courses, plan, credits, user, setDirty } = props;

    const option = tempOption !== null ? tempOption : user.fullTime;

    const navigate = useNavigate();

    const [list, setList] = useState(plan.length ? plan : []);
    const [countCredits, setCountCredits] = useState(credits ? credits : 0);
    const [incomp, setIncomp] = useState([]);
    const [incompletePlan, setIncompletePlan] = useState(true);
    const [success, setSuccess] = useState(false);

    //controllo se il piano è incompleto
    useEffect(() => {
        if (option && (countCredits >= 60 && countCredits <= 80))
            setIncompletePlan(false);
        else if (!option && (countCredits >= 20 && countCredits <= 40))
            setIncompletePlan(false);
        else
            setIncompletePlan(true);
    }, [countCredits, option])

    useEffect(() => {
        if (list.length) {
            const inc = list.filter(c => c.incompatibilita !== null);

            API.incomp(inc)
                .then(listC => {
                    const newList = listC.map(c => {
                        return {
                            nome: c.nome,
                            courseId: c.codice,
                            nomeInc: c.nomeInc
                        }
                    });
                    setIncomp([...incomp, newList]);
                })
                .catch(err => { setError(err.error); setShow(true); });
        }
    }, [list.length]);

    const handleSubmit = (e) => {
        e.preventDefault();

        API.addCourses(list, tempOption)
            .then(() => {
                setSuccess(true);
                setDirty(true);

                setTimeout(() => {
                    navigate('/');
                }, 2000);
            })
            .catch(err => { setError(err.error); setShow(true); });
    }

    const handleDelete = (e) => {
        e.preventDefault();

        API.deletePlan()
            .then(() => {
                setSuccess(true);
                setTempOption(null);
                setDirty(true);

                setTimeout(() => {
                    navigate('/');
                }, 2000);
            })
            .catch(err => { setError(err.error); setShow(true); });
    }

    return (
        <Container fluid>
            {success && <Alert variant="success">Operazione completata con successo!</Alert>}
            <h1>Seleziona i corsi dalla lista</h1>
            <h2>
                I crediti totali devono essere compresi tra {option ? '60 e 80' : '20 e 40'} -
                Opzione {option ? 'Full-time' : 'Part-time'}
            </h2>
            <h3>La tua lista attuale:</h3>
            <RenderList list={list} />
            <h4>Crediti attuali: {
                incompletePlan ?
                    <span style={{ 'color': 'red' }}>{countCredits}</span> :
                    <span style={{ 'color': 'green' }}>{countCredits}</span>
            }</h4>
            <Button variant="primary" disabled={incompletePlan} style={{ 'margin': '2rem' }} onClick={(e) => handleSubmit(e)}>Conferma</Button>
            <Button variant="danger" style={{ 'margin': '2rem' }} onClick={(e) => handleDelete(e)}>Cancella piano</Button>
            <Button variant="dark" style={{ 'margin': '2rem' }} onClick={() => { setTempOption(null); navigate('/') }}>Annulla le modifiche</Button>
            <h1>Lista completa dei corsi</h1>
            <Accordion alwaysOpen>
                <Table bordered hover>
                    <thead>
                        <tr>
                            <th>Aggiungi</th>
                            <th>Codice</th>
                            <th>Nome del corso</th>
                            <th>Crediti</th>
                            <th>Iscritti e posti disponibili</th>
                            <th>Corsi incompatibili e propedeutici</th>
                        </tr>
                    </thead>
                    <tbody>
                        <RenderTableEditing courses={courses} list={list} setList={setList}
                            countCredits={countCredits} setCountCredits={setCountCredits}
                            incomp={incomp} setIncomp={setIncomp}
                            setShow={setShow} setError={setError}
                        />
                    </tbody>
                </Table>
            </Accordion>
        </Container>
    );
}

export default TableEditing;