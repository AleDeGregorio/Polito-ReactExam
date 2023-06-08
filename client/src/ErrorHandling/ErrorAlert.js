import { Alert } from "react-bootstrap";

function ErrorAlert(props) {
    const { show, setShow, error } = props;

    let msg = error;

    if(error.error)
        msg = error.error;

    if (show) {
        window.scrollTo(0, 0);

        setTimeout(() =>{
            setShow(false);
        }, 3000)
        
        return (
            <Alert variant="danger" onClose={() => setShow(false)} dismissible>
                <Alert.Heading>Errore</Alert.Heading>
                <p>
                    {msg}
                </p>
            </Alert>
        );
    }
}

export default ErrorAlert;