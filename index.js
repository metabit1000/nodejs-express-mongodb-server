'use strict';

require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Web service corriendo en el puerto ${PORT}`);
});
