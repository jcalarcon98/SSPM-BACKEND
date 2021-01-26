const express =  require('express');
const app = express();
const reportController = require('./reportController');

app.post('/', reportController.generateReport);

app.get('/download', reportController.downloadReport);

module.exports = app;