const { generateDocument } = require('./reportUtils');
const process = require('process');

exports.generateReport = async(req, res) => {

  const data = req.body;
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