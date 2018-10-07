const express = require('express');
const path = require('path');

var app = express();
var port = process.env.PORT || 3000;

app.listen(port, () =>{
    console.log(`Server started in port ${port}`);
});

app.use(express.static(path.join(__dirname,'../public')));