const express = require('express');
const router = express.Router();
const moment = require('moment');
const db = require('../../db');

/**
 * Get all doctors @GET /doctors
 * @param {undefined}
 * @pararm {string} firstName ||
 * @param {string} lastName ||
 * @param {string} firstName && {string} lastName
 * @returns {Array<{id: int, firstName: string, lastName: string}>}
*/ 
router.get('/doctors', function(req, res, next) {
  let stmt = `SELECT id, first_name AS firstName, last_name AS lastName FROM doctors `;
  // If query params are passed
  if(Object.keys(req.query).length > 0) {
    const firstName = req.query.firstName || false;
    const lastName = req.query.lastName || false;

    if(firstName && lastName) {
      stmt += `WHERE first_name = '${firstName}' and last_name = '${lastName}'`;
    } else if(firstName && !lastName){
      stmt += `WHERE first_name = '${firstName}'`;
    } else if(!firstName && lastName){
      stmt += `WHERE last_name = '${lastName}'`;
    } else {
      res.status(400).json({error: 'Invalid Query Parameters'});
      return;
    }
  }

  db.query(stmt, (err, results, fields) => {
    if(err) {
      console.log(err);
      return res.status(500).json({error: "Server Error"});
    }
    res.status(200).json(results);
  });
});

/**
 * Get a specific doctor @GET /doctors/:id
 * @param {int} id
 * @returnss {Array<{id: int, firstName: string, lastName: string}>}
*/ 
router.get('/doctors/:id', function(req, res, next) {
  const id = Number(req.params.id);
  if(id) {
    const stmt = `SELECT id, first_name AS firstName, last_name AS lastName FROM doctors WHERE id = ${id}`;
    db.query(stmt, (err, results, field) => {
      if(err) {
        console.log(err);
        return res.status(500).json({error: "Server Error"});
      }

      if(results.length > 0) {
        res.send(results);
      } else {
        res.status(404).json({error: "Resource not found"});
      }
    });
  } else {
    res.status(400).json({error: "Invalid Parameters"});
  } 
});

/**
 * Create a doctor resource @POST /doctors
 * @param {firstName: string, lastName:string}
 * @returns {Array<{id: int, firstName: string, lastName: string}>}
*/ 
router.post('/doctors', function(req, res, next) {
  const firstName = req.body['firstName'];
  const lastName = req.body['lastName'];

  if(firstName && lastName) {
    const stmt = `INSERT INTO doctors(first_name, last_name) VALUES ('${firstName}', '${lastName}');`
    db.query(stmt, (err, results, fields) => {
      if(err) {
        console.log(err);
        return res.status(500).json({error: "Server Error"});
      }
      console.log(results);
      const rowId = results.insertId;
      res.location(`/doctors/${rowId}`);
      res.status(201).json({status: 'Resource Created'});
    }); 
  } else {
    res.sendStatus(400);
  }
});

/**
 * Update doctor @PUT /doctors/:id
 * @param {int} id
 * @param {firstName: string, lastName:string}
 * @returns {Array<{id: int, firstName: string, lastName: string}>}
*/ 
router.put('/doctors/:id', function(req, res, next) {
  const firstName = req.body['firstName'];
  const lastName = req.body['lastName'];
  const id = Number(req.params.id);

  if(id && firstName && lastName) {
    db.query(`UPDATE doctors SET first_name = '${firstName}', last_name = '${lastName}' WHERE id = ${id}`, (err, results, fields) => {
      if(err) {
        console.log(err);
        return res.status(500).json({error: "Server Error"});
      }
      if(results.affectedRows) {
        res.location(`/doctors/${id}`);
        res.sendStatus(204);
      } else {
        res.sendStatus(404);
      }
    });
  } else {
    res.sendStatus(400);
  }
});

/**
 * Delete doctor @DELETE /doctors/:id
 * @param {int} id
 * @returns {string}
*/ 
router.delete('/doctors/:id', function(req, res, next) {
  const id = Number(req.params.id);
  
  if(id) {
    db.query(`DELETE from doctors WHERE id = ${id}`, (err, results, field) => {
      if(err) {
        console.log(err);
        return res.status(500).json({error: "Server Error"});
      }
      if(results.affectedRows) {
        res.sendStatus(204);
      } else {
        res.sendStatus(404);
      }
    });
  } else {
    res.sendStatus(400);
  }
});

/**
 * Get all appointments @GET /appointments
 * @param {undefined} ||
 * @param {date: string} ||
 * @param {doctor: int} ||
 * @param {date: string, doctor: int}
 * @returns 
 *  {Array<{
 *    id: int,
 *    date: string,
 *    time: string,
 *    patient: {
 *      firstName: string,
 *      lastName: string
 *    },
 *    doctor: {
 *      firstName: string,
 *      lastName: string
 *    },
 *    visitType: string
 *  }>}
*/ 
router.get('/appointments', function(req, res, next) {
  let stmt = '';
  // if no query params are passed, get all appointments
  if(Object.keys(req.query).length === 0) {
    stmt = 
      `SELECT 
        A.id as id,
        A.date as date, 
        P.first_name as patient_first_name, 
        P.last_name as patient_last_name,
        D.first_name as doctor_first_name,
        D.last_name as doctor_last_name,
        A.visit_type as visit_type
      FROM appointments A 
      INNER JOIN patients P ON A.patient = P.id 
      INNER JOIN doctors D ON A.doctor = D.id;`;
  } else {
    // Get appointments by date
    if(typeof req.query.doctor === 'undefined') {
      const date = req.query['date'];
      stmt = 
        `SELECT 
          A.id as id,
          A.date as date, 
          P.first_name as patient_first_name, 
          P.last_name as patient_last_name,
          D.first_name as doctor_first_name,
          D.last_name as doctor_last_name,
          A.visit_type as visit_type
        FROM appointments A 
        INNER JOIN patients P ON A.patient = P.id 
        INNER JOIN doctors D ON A.doctor = D.id
        WHERE CAST(date as DATE) = '${date}'`;
    // Get appointments by doctor
    } else if(typeof req.query.date === 'undefined') {
      const doctor = req.query['doctor'];
      stmt = 
        `SELECT 
          A.id as id,
          A.date as date, 
          P.first_name as patient_first_name, 
          P.last_name as patient_last_name,
          D.first_name as doctor_first_name,
          D.last_name as doctor_last_name,
          A.visit_type as visit_type
        FROM appointments A 
        INNER JOIN patients P ON A.patient = P.id 
        INNER JOIN doctors D ON A.doctor = D.id
        WHERE A.doctor = '${doctor}'`;
    // Get appointments by date and doctor
    } else {
      const date = req.query['date'];
      const doctor = req.query['doctor'];
      stmt = 
        `SELECT 
          A.id as id,
          A.date as date, 
          P.first_name as patient_first_name, 
          P.last_name as patient_last_name,
          D.first_name as doctor_first_name,
          D.last_name as doctor_last_name,
          A.visit_type as visit_type
        FROM appointments A 
        INNER JOIN patients P ON A.patient = P.id 
        INNER JOIN doctors D ON A.doctor = D.id
        WHERE CAST(date as DATE) = '${date}' 
        AND
        A.doctor = '${doctor}'`;
    }
  }
  // Execute query and next() results
  db.query(stmt, (err, results, fields) => {
    if(err) {
      console.log(err);
      return res.status(500).json({error: "Server Error"});
    }

    if(results.length > 0) {
      // Convert results to JSON Object
      results = results.map( each => {
        // Split date and time
        let date = moment(each.date).format('YYYY-MM-DD');
        let time = moment.utc(each.date).format('HH:mm:ss');

        return {
          id: each.id,
          date,
          time,
          patient: {
            firstName: each.patient_first_name,
            lastName: each.patient_last_name
          },
          doctor: {
            firstName: each.doctor_first_name,
            lastName: each.doctor_last_name
          },
          visitType: each.visit_type
        }
      });
      res.send(results);
    } else {
      res.sendStatus(404);
    }
  });
});

/**
 *  Delete an existing appointment @DELETE /appointments/:id
 *  @param {id: int}
 */ 
router.delete('/appointments/:id', function(req, res, next) {
  const id = Number(req.params.id);
  if(id) {
    const stmt = `DELETE FROM appointments WHERE id = ${id}`;
    db.query(stmt, (err, results, fields) => {
      if(err) {
        console.log(err);
        return res.status(500).json({error: "Server Error"});
      }
      if(results.affectedRows) {
        res.location(`/appointments/${id}`);
        res.send(results);
      } else {
        res.sendStatus(404);
      }
    });
  } else {
    res.sendStatus(400);
  }
});

/* Add new appointments */
router.post('/appointments', function(req, res, next) {
  const {date, patient, doctor, visitType} = req.body;

  const dateObj = new Date(date);
  const interval = 15;
  const appointmentIsOnInterval = dateObj.getMinutes() % interval == 0;

  if ((date && patient && doctor && visitType) && appointmentIsOnInterval) {
    console.log(date);
    const appointmentsForDoctor = `SELECT COUNT(*) AS count FROM appointments WHERE date = '${date}' AND doctor = ${doctor}`;
    const appointmentsForPatient = `SELECT COUNT(*) AS count FROM appointments WHERE date = '${date}' AND patient = ${patient}`;
    const stmt = `INSERT INTO appointments(date, patient, doctor, visit_type) VALUES('${date}', ${patient}, ${doctor}, '${visitType}')`;

    db.query(appointmentsForDoctor, (err, results, fields) => {
      let numRows = results[0].count;
      if (numRows < 3) {
        db.query(appointmentsForPatient, (err, results, fields) => {
          if(err) {
            console.log(err);
            next();
          }
          numRows = results[0].count;
          if (numRows < 1) {
            db.query(stmt, (err, results, fields) => {
              if(err) {
                console.log(err);
                return res.status(500).json({error: "Server Error"});
              }
              res.send(results);
            });
          } else {
            res.send('failed');
          }
        });
      } else {
        res.send('failed');
      }
    });
  } else {
    res.send('failed');
  }
});

module.exports = router;
