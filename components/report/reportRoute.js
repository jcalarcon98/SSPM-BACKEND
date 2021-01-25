const express =  require('express');
const app = express();
const reportController = require('./reportController');

app.post('/', reportController.generateReport);

module.exports = app;