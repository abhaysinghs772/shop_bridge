const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require('dotenv').config()

const app = express();
app.set('view engine', 'ejs');

app.get('/', (req, res)=>{
   res.render(`homepage`, {listTitle: "shope bridge"})
})

app.listen(process.env.PORT || 3000,  ()=> {
    console.log("server is started at port 3000");
});
