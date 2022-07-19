const express = require('express');
var cors = require('cors')

var app = express();

var sqlite3 = require('sqlite3');
let db = new sqlite3.Database('./data.db', sqlite3.OPEN_READONLY);

app.use(cors())
app.get('/api/', function (req, res, next) {
  db.all('SELECT * FROM lbsf', function (err, rows) {
    if (err) {
      console.log(err);
      return;
    }
    res.send(rows);
  });
});

app.listen(3001);