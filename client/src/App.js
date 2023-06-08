import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Alert, Container } from 'react-bootstrap';

import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import API from './API.js';

import ErrorAlert from './ErrorHandling/ErrorAlert';
import Nav from './Navbar/Nav';
import Login from './Login/Login';
import ListCourses from './ListContent/ListCourses';
import EditContainer from './EditPlan/EditContainer';

function LogoutAlert(props) {
  const { showLogout, setShowLogout } = props;

  if (showLogout) {
    return (
      <Alert variant="success" onClose={() => setShowLogout(false)} dismissible>
        <Alert.Heading>Logout effettuato con successo!</Alert.Heading>
      </Alert>
    );
  }
}

function Loading() {
  return (
    <Container fluid>
      <h2>Caricamento dei dati, attendere...</h2>
    </Container>
  );
}

function App() {
  return (
    <Router>
      <App2 />
    </Router>
  )
}

function App2() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const [showLogout, setShowLogout] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);
  const [dirty, setDirty] = useState(false);

  const [courses, setCourses] = useState([]);
  const [plan, setPlan] = useState([]);
  const [credits, setCredits] = useState(undefined);

  const [tempOption, setTempOption] = useState(null);

  //errors handling
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch (err) {
        setLoggedIn(false)
        setError(err.error);
      }
    };
    checkAuth();

    API.courses()
      .then(courses => setCourses(courses))
      .catch(err => { setError(err.error); setShow(true); });

    setInitialLoading(false);
  }, []);

  useEffect(() => {
    if (loggedIn) {
      API.listPlan()
        .then(plan => setPlan(plan))
        .catch(err => { setError(err.error); setShow(true); });

      if (plan.length > 0) {
        API.credits()
          .then(credits => setCredits(credits.totCrediti))
          .catch(err => { setError(err.error); setShow(true); });
      }
      else
        setCredits(undefined);
    }
  }, [loggedIn, plan.length]);

  useEffect(() => {
    if (dirty) {
      API.getUserInfo()
        .then(user => {
          setUser(user);
        })
        .catch(err => { setError(err.error); setShow(true); });

      API.courses()
        .then(courses => setCourses(courses))
        .catch(err => { setError(err.error); setShow(true); });

      API.listPlan()
        .then(plan => { setPlan(plan); setDirty(false); })
        .catch(err => { setError(err.error); setShow(true); });
    }
  }, [dirty, user.fullTime, plan.length]);

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then(user => {
        setLoggedIn(true);
        setUser(user);
        setShow(false);
        setError('');
        navigate('/');
      })
      .catch(err => {
        setShow(true);
        setError(err.error);
      }
      )
  }

  const doLogOut = async () => {
    await API.logOut();

    setLoggedIn(false);
    setPlan([]);
    setCredits(undefined);
    setUser({});
    setTempOption(null);

    setShowLogout(true);

    setTimeout(() => {
      setShowLogout(false);
    }, 2000);
  }

  return (
    <>
      <Nav user={user} loggedIn={loggedIn} logOut={doLogOut} />
      <ErrorAlert show={show} setShow={setShow} error={error} />
      <LogoutAlert showLogout={showLogout} setShowLogout={setShowLogout} />
      {initialLoading ? <Loading /> : false}
      <Routes>
        <Route path='/' element={
          loggedIn && ((plan.length > 0 && credits) || tempOption !== null) ? <Navigate to='/loggedIn' /> :
            <ListCourses courses={courses} loggedIn={loggedIn} user={user} setTempOption={setTempOption}
              setDirty={setDirty} setShow={setShow} setError={setError}
            />
        } />
        <Route path='/login' element={<Login login={doLogIn} setShow={setShow} setError={setError} />} />
        {<Route path='/loggedIn' element={
          loggedIn ? (
            initialLoading ? <Loading /> :
              <EditContainer setShow={setShow} setError={setError}
                tempOption={tempOption} setTempOption={setTempOption} courses={courses} plan={plan} credits={credits}
                user={user} setDirty={setDirty}
              />
          ) :
            <Navigate to='/login' />
        } />}
      </Routes>
    </>
  );
}

export default App;
