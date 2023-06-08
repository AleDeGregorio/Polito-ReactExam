import { Table, Container, Accordion } from "react-bootstrap";


function RenderList(props) {
    const { courses } = props;

    const listCourses = courses.map((course) => {
        return (
            <tr key={course.codice}>
                <td style={{ 'fontWeight': 'bold' }}>{course.codice}</td>
                <td>{course.nome}</td>
                <td>{course.crediti}</td>
                <td>
                    {
                        course.studenti === course.maxStudenti ?
                            <span style={{ 'color': 'red', 'fontWeight': 'bold' }}>{course.studenti} / {course.maxStudenti}</span> :
                            (<span style={{ 'color': 'green' }}> {course.studenti} / {course.maxStudenti || 'nessun limite'}</span>)
                    }
                </td>
                <td>
                    <Accordion.Item eventKey={course.codice} style={{ 'backgroundColor': '#fff5e6' }}>
                        <Accordion.Header>Espandi</Accordion.Header>
                        <Accordion.Body>
                            Incompatibilità: {
                                course.incompatibilita ?
                                    <span style={{ 'fontWeight': 'bold', 'color': 'red' }}>{course.incompatibilita}</span> :
                                    <span style={{ 'color': 'green' }}>nessuna</span>
                            }
                            <br />
                            Propedeuticità: {
                                course.propedeuticita ?
                                    <span style={{ 'fontWeight': 'bold', 'color': 'red' }}>{course.propedeuticita}</span> :
                                    <span style={{ 'color': 'green' }}>nessuna</span>
                            }
                        </Accordion.Body>
                    </Accordion.Item>
                </td>
            </tr>
        );
    });

    return (<>{listCourses}</>);
}

function CoursesTable(props) {
    const { courses } = props;

    return (
        <Container fluid>
            <h1>Lista dei corsi disponibili</h1>
            <Accordion alwaysOpen>
                <Table bordered hover style={{ 'backgroundColor': '#fff5e6' }}>
                    <thead>
                        <tr>
                            <th>Codice</th>
                            <th>Nome del corso</th>
                            <th>Crediti</th>
                            <th>Iscritti e posti disponibili</th>
                            <th>Corsi incompatibili e propedeutici</th>
                        </tr>
                    </thead>
                    <tbody>
                        <RenderList courses={courses}/>
                    </tbody>
                </Table>
            </Accordion>
        </Container>
    );
}

export default CoursesTable;