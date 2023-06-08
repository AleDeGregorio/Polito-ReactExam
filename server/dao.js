'use strict';
/* Data Access Object (DAO) module for accessing courses and exams */

const sqlite = require('sqlite3');


// open the database
const db = new sqlite.Database('study_plan.sqlite', (err) => {
    if (err) throw err;
});

//get all the courses
exports.listCourses = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM corsi ORDER BY nome';
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const courses = rows.map((e) => ({
                codice: e.codice, nome: e.nome, crediti: e.crediti, maxStudenti: e.maxStudenti,
                incompatibilita: e.incompatibilita, propedeuticita: e.propedeuticita
            }));
            resolve(courses);
        });
    });
};

//get the study plan of the student
exports.listPlan = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT p.codice, c.nome, c.crediti, c.maxStudenti, c.incompatibilita, c.propedeuticita ' +
            'FROM piano p, corsi c ' +
            'WHERE p.codice = c.codice AND idStudente = ?' +
            'ORDER BY c.nome';
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const plan = rows.map((e) => ({
                codice: e.codice, nome: e.nome, crediti: e.crediti, maxStudenti: e.maxStudenti,
                incompatibilita: e.incompatibilita, propedeuticita: e.propedeuticita
            }));
            resolve(plan);
        });
    });
};

//get course by code
exports.courseCode = (courseId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * ' +
            'FROM corsi ' +
            'WHERE codice = ? ';
        db.all(sql, [courseId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row.length === 0) {
                resolve({ error: 'Corso non trovato' });
            }
            resolve(row[0]);
        });
    });
};

//get course by incomp
exports.courseIncomp = (incomp) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * ' +
            'FROM corsi ' +
            'WHERE incompatibilita = ?';
        db.all(sql, [incomp], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row.length === 0) {
                resolve({ error: 'Corso non trovato' });
            }
            resolve(row[0]);
        });
    });
};

//get the number of students in a course
exports.students = (courseId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT p.codice, c.nome, COUNT(DISTINCT p.idStudente) as totStudenti ' +
            'FROM piano p, corsi c ' +
            'WHERE p.codice = c.codice AND p.codice = ? ' +
            'GROUP BY p.codice';
        db.all(sql, [courseId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row[0]?.totStudenti);
        });
    });
};

//get the number of credits in a student's plan
exports.credits = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT SUM(c.crediti) AS totCrediti ' +
            'FROM piano p, corsi c ' +
            'WHERE p.codice = c.codice AND p.idStudente = ? ' +
            'GROUP BY p.idStudente';
        db.all(sql, [userId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row[0]);
        });
    });
};

//create a new empty study plan
exports.createPlan = (userId, fullTime) => {
    return new Promise(async (resolve, reject) => {
        const parsedFullTime = fullTime ? 1 : 0;
        const sql = 'UPDATE studenti SET fullTime = ? WHERE idStudente = ?';
        db.run(sql, [parsedFullTime, userId], function (err) {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};

//add a new course to the study plan
exports.addCourse = (courseId, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO piano(idStudente, codice) VALUES(?, ?)';
        db.run(sql, [userId, courseId], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};

//delete all courses from the study plan of the student
exports.deleteCourses = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM piano WHERE idStudente = ?';
        db.run(sql, [userId], (err, _rows) => {
            if (err) {
                reject(err);
            } else
                resolve(null);
        });
    });
}

//delete all the study plan
exports.deletePlan = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE studenti SET fullTime = NULL WHERE idStudente = ?';
        db.run(sql, [userId], (err, _rows) => {
            if (err) {
                reject(err);
            } else
                resolve(null);
        });
    });
}