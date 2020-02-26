require("dotenv").config();
const database = {
  default: process.env.DATABASETYPE || "mysql",
  mysql: {
    host: process.env.HOST || "localhost",
    user: process.env.USERNAME || "root",
    password: process.env.PASSWORD || "",
    database: process.env.DATABASE || "rou",
    connectionLimit: 50
  },
  url: "",
};

module.exports = database;
