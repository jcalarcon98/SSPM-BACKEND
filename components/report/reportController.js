
const { generateDocument } = require('./reportUtils');
const path = require("path");
const process = require('process');

exports.generateReport = async(req, res) => {

  const data = req.body;

  const documentPath = await generateDocument(data);

  res.json({
    name: documentPath
  });


  // res.download(documentPath);

  // res.download(path.join(__dirname + '/document.docx'));
  // res.send(documentPath);
};

exports.downloadReport = (req, res) => {

  const documentPath =  path.join(process.cwd() + '/document.docx');
  res.download(documentPath);
  // const file = `${__dirname}/upload-folder/dramaticpenguin.MOV`;
    // res.download(file); // Set disposition and send it.
};