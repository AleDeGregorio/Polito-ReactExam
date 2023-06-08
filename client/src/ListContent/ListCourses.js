import OptionContainer from "./OptionContainer";
import CoursesTable from "./CoursesTable";

function ListCourses(props) {
    const { courses, loggedIn, user, setTempOption, setDirty, setShow, setError } = props;

    return (
        <>
            {loggedIn ?
                <OptionContainer user={user} setTempOption={setTempOption}
                    setDirty={setDirty} setShow={setShow} setError={setError} /> : false}
            <CoursesTable courses={courses} />
        </>
    )
}

export default ListCourses;