const util = require("util");

exports.generateReport = (req, res) => {

  const data = req.body;
  console.log(util.inspect(data, false, null, true /* enable colors */));
  res.send('Hello');
  
};