const express = require('express');

const app = express();
const reportRoutes = require('./src/components/report/reportRoute');

require('./config/config');

app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/docx', reportRoutes);

app.listen(process.env.PORT, () => {
  console.log(`We are running node in port: ${process.env.PORT}`);
});
