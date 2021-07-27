const express = require('express');
const reportController = require('./reportController');

const app = express();

app.post('/', reportController.generateReport);

app.get('/download/:folder/:documentName', reportController.downloadReport);

module.exports = app;
