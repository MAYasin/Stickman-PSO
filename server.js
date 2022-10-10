const express = require('express');
const reload = require('reload');
const path = require('path');

const app = express();

app.use(express.static('src'));

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, 'src') });
})

console.log("sever running");

console.log("http://localhost:3000/");

reload(app);

app.listen(process.env.PORT || 3000);

module.exports = app;