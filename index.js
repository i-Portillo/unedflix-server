const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
