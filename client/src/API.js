const APIURL = new URL('http://localhost:3001/api/')

function courses() {
    return new Promise((resolve, reject) => {
        fetch(new URL('courses', APIURL), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((response) => {
            if (response.ok) {
                resolve(response.json());
            } else {
                // analyze the cause of error
                response.json()
                    .then((message) => { reject(message); }) // error message in the response body
                    .catch(() => { reject({ error: "Impossibile elaborare la risposta del server" }) }); // something else
            }
        }).catch(() => { reject({ error: "Errore di comunicazione con il server" }) }); // connection errors
    });
}

function listPlan() {
    return new Promise((resolve, reject) => {
        fetch(new URL('listPlan', APIURL), {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((response) => {
            if (response.ok) {
                resolve(response.json());
            } else {
                // analyze the cause of error
                response.json()
                    .then((message) => { reject(message); }) // error message in the response body
                    .catch(() => { reject({ error: "Impossibile elaborare la risposta del server" }) }); // something else
            }
        }).catch(() => { reject({ error: "Errore di comunicazione con il server" }) }); // connection errors
    });
}

function incomp(incomp) {
    const inc = incomp.map(p => p.incompatibilita);
    const param = JSON.stringify( inc );

    return new Promise((resolve, reject) => {
        fetch(new URL('incomp/' + param, APIURL), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then((response) => {
            if (response.ok) {
                resolve(response.json());
            } else {
                // analyze the cause of error
                response.json()
                    .then((message) => { reject(message); }) // error message in the response body
                    .catch(() => { reject({ error: "Impossibile elaborare la risposta del server" }) }); // something else
            }
        }).catch(() => { reject({ error: "Errore di comunicazione con il server" }) }); // connection errors
    });
}

function credits() {
    return new Promise((resolve, reject) => {
        fetch(new URL('credits', APIURL), {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((response) => {
            if (response.ok) {
                resolve(response.json());
            } else {
                // analyze the cause of error
                response.json()
                    .then((message) => { reject(message); }) // error message in the response body
                    .catch(() => { reject({ error: "Impossibile elaborare la risposta del server" }) }); // something else
            }
        }).catch(() => { reject({ error: "Errore di comunicazione con il server" }) }); // connection errors
    });
}

function addCourses(courses, tempOption) {
    return new Promise((resolve, reject) => {
        fetch(new URL('addCourses', APIURL), {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ courses: courses, tempOption: tempOption }),
        }).then((response) => {
            if (response.ok) {
                const ok = true;
                resolve(ok);
            } else {
                // analyze the cause of error
                response.json()
                    .then((message) => { reject(message); }) // error message in the response body
                    .catch(() => { reject({ error: "Impossibile elaborare la risposta del server" }) }); // something else
            }
        }).catch(() => { reject({ error: "Errore di comunicazione con il server" }) }); // connection errors
    });
}

function deletePlan() {
    return new Promise((resolve, reject) => {
        fetch(new URL('deletePlan', APIURL), {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((response) => {
            if (response.ok) {
                const ok = true;
                resolve(ok);
            } else {
                // analyze the cause of error
                response.json()
                    .then((message) => { reject(message); }) // error message in the response body
                    .catch(() => { reject({ error: "Impossibile elaborare la risposta del server" }) }); // something else
            }
        }).catch(() => { reject({ error: "Errore di comunicazione con il server" }) }); // connection errors
    });
}

// User API

function logIn(credentials) {
    return new Promise((resolve, reject) => {
        fetch(new URL('sessions', APIURL), {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        }).then((response) => {
            if (response.ok) {
                const user = response.json();
                resolve(user);
            } else {
                // analyze the cause of error
                response.json()
                    .then((message) => { reject(message); }) // error message in the response body
                    .catch(() => { reject({ error: "Impossibile elaborare la risposta del server" }) }); // something else
            }
        }).catch(() => { reject({ error: "Errore di comunicazione con il server" }) }); // connection errors
    });
}

async function logOut() {
    await fetch(new URL('sessions/current', APIURL), { method: 'DELETE', credentials: 'include' });
}

function getUserInfo() {
    return new Promise((resolve, reject) => {
        fetch(new URL('sessions/current', APIURL), {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((response) => {
            if (response.ok) {
                const userInfo = response.json();
                resolve(userInfo);
            } else {
                // analyze the cause of error
                response.json()
                    .then((message) => { reject(message); }) // error message in the response body
                    .catch(() => { reject({ error: "Impossibile elaborare la risposta del server" }) }); // something else
            }
        }).catch(() => { reject({ error: "Errore di comunicazione con il server" }) }); // connection errors
    });
}

const API = { courses, incomp, listPlan, credits, addCourses, deletePlan, logIn, logOut, getUserInfo };
export default API;