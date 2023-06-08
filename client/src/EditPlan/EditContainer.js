import { Container } from 'react-bootstrap';

import TableEditing from './TableEditing';

function EditContainer(props) {
    window.scrollTo(0, 0);
    const { setShow, setError, tempOption, setTempOption, courses, plan, credits, user, setDirty } = props;

    return (
        <Container fluid>
            <TableEditing setShow={setShow} setError={setError}
                tempOption={tempOption} setTempOption={setTempOption} courses={courses} plan={plan} 
                credits={credits} user={user} setDirty={setDirty}
            />
        </Container>
    );
}

export default EditContainer;