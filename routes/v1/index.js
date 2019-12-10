var express = require('express');
var router = express.Router();
var db = require('../db');

/* Get list of all doctors */
router.get('/doctors', function(req, res, next) {
  db.query('select * from doctors', (err, results, fields) => {
    res.send(results);
  });
});

/* Create Doctor's Names */
router.post('/doctors', function(req, res,next) {
  let firstName = req.query['first-name'];
  let lastName = req.query['last-name'];

  if(firstName && lastName) {
    console.log(req.query);
    db.query(`INSERT INTO doctors(first_name, last_name) VALUES ('${firstName}', '${lastName}')`, (err, results, fields) => {
      if(err)
        console.log(err);

      res.send(results);
    }); 
  } else {
    res.send('Failed');
  }
});

/* Get list of appointments */
router.get('/appointments', function(req, res, next) {
});

/* Delete an existing appointment */
router.delete('/appointments', function(req, res, next) {
});

/* Add new appointments */
router.post('/appoinments', function(req, res, next) {
});

/* Testing */
router.get('/test', function(req, res, next) {
  console.log(req.query);
});


module.exports = router;
