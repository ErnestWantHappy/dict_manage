const sql = require("mssql");
// 配置数据库连接信息
let config = {
    user: process.env.DB_USER, // update me
    password: process.env.DB_PASSWORD, // update me
    server: process.env.DB_SERVER, // update me
    port: 8082,
    database: process.env.DB_DATABASE, // update me
    options: {
      encrypt: false, // Use this only if you're on Windows Azure
      trustServerCertificate: true, // Add this line to trust self-signed certificates
    },
  };

  // 连接到数据库
sql
.connect(config)
.then(() => console.log("已成功连接到数据库"))
.catch((err) => console.error("数据库连接失败：", err));

  module.exports = {config,sql};//使用module.exports导出模块：conf