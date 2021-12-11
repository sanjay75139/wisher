require("dotenv").config();

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: "mysql",
    dialectOptions: {
        dateStrings: true,
        typeCast: true
    },
    timezone: '+05:30',
});

let db = sequelize;

module.exports = db;