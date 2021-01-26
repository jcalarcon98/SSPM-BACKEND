
const { generateDocument } = require('./reportUtils');
const path = require("path");
const process = require('process');
const util = require("util");
const { request } = require('./reportRoute');

exports.generateReport = async(req, res) => {

  const data = req.body;
  console.log(util.inspect(data, false, null, true /* enable colors */))
  const documentPath = await generateDocument(data);
  
  res.json(documentPath);
};

exports.downloadReport = (req, res) => {
  ;
  const { folder, documentName } = req.params;
  
  if( !folder || !documentName) {
    res.status(400).send({
      message: 'Folder and Document name are required'
    });
  }
  
  const documentPath =  `${process.cwd()}/reports/${folder}/${documentName}`;
  res.download(documentPath);
};