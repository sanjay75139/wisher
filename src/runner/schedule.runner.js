const { QueryTypes, DataTypes } = require('sequelize');
const db = require("../database/db");
const Schedule = require("../database/models/schedule")(db, DataTypes);
const Mail = require("../controllers/mailer");

exports.run = async() => {
    var tempdate = new Date();
    var currentOffset = tempdate.getTimezoneOffset();
    var ISTOffset = 330;
    var date = new Date(tempdate.getTime() + (ISTOffset + currentOffset)*60000);
    date.setSeconds(0)
    let currentTime = date.getFullYear() + "-" + ("0" +(date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) +
        " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
    await Schedule.findAll({
        where: {
            scheduleTime: currentTime
        }
    }).then(async(result) => {
        result.forEach(async (tempData) => {
            let data = tempData.dataValues;
            await Mail.mailer(data.emailId, "Happy " + data.event, data.message + "<br><br>Regards,<br>Team Wisher.", (error, mailResult) => {})
        })
    }).catch((err) => {
        // console.log(err)
    })
}