'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const { check, validationResult, body } = require('express-validator'); // validation middleware
const dao = require('./dao'); // module for accessing the DB
const cors = require('cors');
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao'); // module for accessing the users in the DB

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { error: 'Email o password errati' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.idStudente);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

// init express
const app = new express();
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions)); // NB: Usare solo per sviluppo e per l'esame! Altrimenti indicare dominio e porta corretti


// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'Utente non autenticato' });
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

//APIs

// GET /api/courses
app.get('/api/courses', async (_req, res) => {
  try {
    const courses = await dao.listCourses();

    const newList = await Promise.all(courses.map(async (course) => {
      const students = await dao.students(course.codice);

      return (
        {
          'codice': course.codice,
          'nome': course.nome,
          'crediti': course.crediti,
          'studenti': students ? students : 0,
          'maxStudenti': course.maxStudenti,
          'incompatibilita': course.incompatibilita,
          'propedeuticita': course.propedeuticita
        }
      );
    }));
    res.json(newList);
  } catch (err) {
    res.status(500).end();
  }
});

// GET /api/listPlan
app.get('/api/listPlan', isLoggedIn, async (req, res) => {
  try {
    const plan = await dao.listPlan(req.user.idStudente);

    const newList = await Promise.all(plan.map(async (course) => {
      const students = await dao.students(course.codice);

      return (
        {
          'codice': course.codice,
          'nome': course.nome,
          'crediti': course.crediti,
          'studenti': students ? students : 0,
          'maxStudenti': course.maxStudenti,
          'incompatibilita': course.incompatibilita,
          'propedeuticita': course.propedeuticita
        }
      );
    }));
    res.json(newList);
  } catch (err) {
    res.status(500).end();
  }
});

// GET /api/incomp/<incomp>
app.get('/api/incomp/:incomp', [
  check('incomp')
    .custom(async (incomp) => {
      const parsedParam = JSON.parse(incomp);

      const courses = await dao.listCourses();

      parsedParam.forEach(i => i.replace(/\s+/g, '').split(',').forEach(c => {
        if (c.length !== 7 || !courses.some(course => course.codice === c.codice))
          throw new Error('Si è verificato un problema con i codici di incompatibilità');
      }));

      return true;
    })
], async (req, res) => {
  try {
    const parsedParam = JSON.parse(req.params.incomp);

    let listInc = [];

    //corsi che hanno una incompatibilità
    const listCourses = await Promise.all(parsedParam.map(async (c) => {
      const course = await dao.courseIncomp(c);

      if (course.error)
        res.status(404).json({ error: course });

      return course;
    }));

    //ricavo un array con i codici di incompatibilità, salvando anche il nome del corso
    listCourses.forEach(inc => {
      inc.incompatibilita.replace(/\s+/g, '').split(',').forEach(c => listInc.push({ code: c, nome: inc.nome }));
    });

    const listIncomp = await Promise.all(listInc.map(async (inc) => {
      const course = await dao.courseCode(inc.code);

      if (course.error)
        res.status(404).json({ error: course });

      return (
        {
          codice: inc.code,
          nome: course.nome,
          nomeInc: inc.nome
        }
      );
    }));
    res.json(listIncomp);
  } catch (err) {
    res.status(500).end();
  }
});

// GET /api/credits
app.get('/api/credits', isLoggedIn, async (req, res) => {
  dao.credits(req.user.idStudente)
    .then(credits => { res.json(credits); })
    .catch(() => res.status(500).end());
});

// POST /api/addCourses
app.post('/api/addCourses', isLoggedIn, [
  check('courses')
    .custom(async (courses, { req }) => {
      const tempOption = req.body.tempOption;

      //recupero il piano originale salvato nel db (assieme al numero di studenti iscritti), se c'è
      const list = await dao.listPlan(req.user.idStudente);

      const originalList = await Promise.all(list.map(async (course) => {
        const students = await dao.students(course.codice);

        return (
          {
            'codice': course.codice,
            'nome': course.nome,
            'crediti': course.crediti,
            'studenti': students ? students : 0,
            'maxStudenti': course.maxStudenti,
            'incompatibilita': course.incompatibilita,
            'propedeuticita': course.propedeuticita
          }
        );
      }))

      //in base ai codici corso presenti nel body, recupero le informazioni dei corsi, per controllare che le informazioni siano corrette
      const coursesAdding = await Promise.all(courses.map(async (c) => {
        const resCourse = await dao.courseCode(c.codice);

        if(resCourse.error)
          throw new Error(`Non è stato trovato il corso con codice ${c.codice}`);

        return resCourse;
      }));

      const listToAdd = await Promise.all(coursesAdding.map(async (course) => {
        const students = await dao.students(course.codice);

        return (
          {
            'codice': course.codice,
            'nome': course.nome,
            'crediti': course.crediti,
            'studenti': students ? students : 0,
            'maxStudenti': course.maxStudenti,
            'incompatibilita': course.incompatibilita,
            'propedeuticita': course.propedeuticita
          }
        );
      }))

      //adesso inizio il controllo dei vari vincoli
      let isValid = false;

      //check per l'opzione del piano
      if (req.user.fullTime === null && tempOption === null)
        throw new Error('Opzione piano di studi non ancora definita');

      //check per il numero di crediti
      else {
        let totCredits = 0;
        listToAdd.forEach(c => totCredits += c.crediti);

        if ((req.user.fullTime || tempOption) && (totCredits >= 60 && totCredits <= 80))
          isValid = true;
        else if ((!req.user.fullTime || !tempOption) && (totCredits >= 20 && totCredits <= 40))
          isValid = true;
        else
          throw new Error('Limite di crediti non rispettato');
      }

      //check posti disponibili
      listToAdd.forEach(c => {
        if (originalList.length < 1 || !originalList.some(oc => oc.codice === c.codice)) {
          if (c.maxStudenti && c.studenti >= c.maxStudenti) {
            throw new Error('Limite posti disponibili già raggiunto');
          }
        }
      });

      //check propedeuticita
      const isPropedeutic = listToAdd.filter(c => c.propedeuticita !== null);

      if (isPropedeutic.length && !listToAdd.some(c => c.codice === isPropedeutic[0]?.propedeuticita))
        throw new Error('Vincoli di propedeuticità non rispettati');


      //check incompatibilita
      const hasIncomp = listToAdd.filter(c => c.incompatibilita !== null);

      if (hasIncomp.length) {
        hasIncomp.forEach(inc => {
          if (listToAdd.some(c => c.codice === inc.incompatibilita)) {
            throw new Error('Vincoli di incompatibilità non rispettati');
          }
        });
      }

      return isValid;
    })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array()[0].msg });
  }

  try {
    const courses = req.body.courses;
    const tempOption = req.body.tempOption;

    if (tempOption !== null)
      await dao.createPlan(req.user.idStudente, tempOption);

    await dao.deleteCourses(req.user.idStudente);

    await Promise.all(courses.map(async (course) => {
      const resCourse = await dao.addCourse(course.codice, req.user.idStudente);
      return resCourse;
    }));
    res.status(201).end();
  } catch (err) {
    res.status(503).json({ error: `Errore nel database durante l'aggiornamento del piano di studi` });
  }
});

// DELETE /api/deletePlan/
app.delete('/api/deletePlan', isLoggedIn, async (req, res) => {
  try {
    await dao.deleteCourses(req.user.idStudente);
    await dao.deletePlan(req.user.idStudente);
    res.status(204).end();
  } catch (err) {
    res.status(503).json({ error: 'Errore nel database durante la cancellazione del piano di studi' });
  }
});

/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => { res.end(); });
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Utente non autenticato!' });
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});