
const { generateDocument } = require('./reportUtils');

exports.generateReport = async(req, res) => {

  const data = req.body;

  const documentPath = await generateDocument(data);

  // res.download(path.join(__dirname + '/document.docx'));
  res.send(documentPath);
};

exports.downloadReport = (req, res) => {

  const pathFile = req.body;
  
  console.log(pathFile);

  res.send('Pilas');
  // const file = `${__dirname}/upload-folder/dramaticpenguin.MOV`;
    // res.download(file); // Set disposition and send it.
};