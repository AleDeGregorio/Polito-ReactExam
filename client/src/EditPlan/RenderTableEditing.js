import { Button, Accordion } from 'react-bootstrap';

function RenderTableEditing(props) {
    const { courses, list, setList, countCredits, setCountCredits, incomp, setIncomp, setShow, setError } = props;

    const handleAdding = (course) => {
        setList([...list, course]);
        setCountCredits(countCredits + course.crediti);
    }

    const handleRemoving = (course) => {
        const propedeuticCourse = list.find(c => c.propedeuticita === course.codice);

        if (propedeuticCourse) {
            const err = 'Impossibile rimuovere il corso ' + course.codice + ' - ' + course.nome +
                ' a causa della propedeuticità con il corso ' + propedeuticCourse.codice + ' - ' + propedeuticCourse.nome;

            setShow(true);
            setError(err);

            return;
        }

        setList(list.filter(c => c.codice !== course.codice));
        setCountCredits(countCredits - course.crediti);
        setIncomp([]);
    }

    const listCourses = courses.map((course) => {
        const maxReached = course.studenti === course.maxStudenti;
        const alreadyInList = list.some(c => c.codice === course.codice);

        //controllo se il corso sia propedeutico ad un altro
        let isPropedeutic = courses.some(c => c.codice === course.propedeuticita);
        let propedeuticName = '';

        if (isPropedeutic) {
            const propedeuticCourse = courses.filter(c => c.codice === course.propedeuticita)[0];

            //il corso è propedeutico ma è già stato inserito in lista
            if (list.some(c => c.codice === propedeuticCourse.codice))
                isPropedeutic = false;
            else
                propedeuticName = propedeuticCourse.nome;
        }

        //controllo se il corso sia tra quelli incompatibili
        //const courseIsIncomp = incomp.some(incompCourse => incompCourse.some(c => c.courseId === course.codice));
        let courseIsIncomp = false;
        let incompName = '';

        incomp.forEach(inc => {
            inc.forEach(c => {
                if (c.courseId === course.codice) {
                    courseIsIncomp = true;
                    incompName = c.nomeInc;
                }
            })
        });

        let rowColor = undefined;

        if (maxReached || courseIsIncomp || isPropedeutic)
            rowColor = '#ff8e8e';

        if (alreadyInList)
            rowColor = '#6e6e6e'

        return (
            <tr key={course.codice} bgcolor={rowColor}>
                <td>
                    {!alreadyInList &&
                        <Button variant='dark' disabled={maxReached || alreadyInList || courseIsIncomp || isPropedeutic} onClick={() => handleAdding(course)}>
                            Seleziona
                        </Button>}
                    {alreadyInList &&
                        <Button variant='dark' onClick={() => handleRemoving(course)}>
                            Rimuovi
                        </Button>
                    }
                    {maxReached && <p style={{ 'fontWeight': 'bold' }}>Raggiunto limite studenti</p>}
                    {alreadyInList && <p style={{ 'fontWeight': 'bold' }}>Corso già selezionato</p>}
                    {courseIsIncomp && <p style={{ 'fontWeight': 'bold' }}>Corso incompatibile con {incompName}</p>}
                    {isPropedeutic && <p style={{ 'fontWeight': 'bold' }}>Corso propedeutico con {propedeuticName}</p>}
                </td>
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
                    <Accordion.Item eventKey={course.codice}>
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

export default RenderTableEditing;