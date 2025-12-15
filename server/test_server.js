const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

app.get('/', (req, res) => res.send('API Running'));

app.listen(5001, () => {
    console.log('Minimal Server running on 5001');
});
