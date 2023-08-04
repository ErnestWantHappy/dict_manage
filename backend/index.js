process.env.TZ = "Asia/Shanghai";
const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
require('dotenv').config();
// app.use(express.static(__dirname));
app.use(express.static(__dirname+"/dist"));
var {router} = require('./router/index')
app.use('/', router);
// 启动服务器
app.listen(3000, () => {
  console.log("服务器已启动，监听端口 3000");
});
