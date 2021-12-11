const { QueryTypes, DataTypes } = require('sequelize');
const db = require("../database/db");
const Schedule = require("../database/models/schedule")(db, DataTypes);
const Mail = require("./mailer");
const { get_cookies } = require('./misc.controller');
require('./misc.controller');
const User = require("../database/models/user")(db, DataTypes);

exports.newSchedule = async(req, res) => {
    const { name, eventName, message, date, time, emailId } = req.body;
    console.log(date + " " + time + ":00")
    let scheduleTime = date + " " + time + ":00";

    await User.findOne({
        where: {
            emailId: decodeURIComponent(get_cookies(req)['emailId'])
        }
    }).then(async (userResult) => {
        let username;
        if(!userResult)
            username = decodeURIComponent(get_cookies(req)['emailId']);
        else
            username = userResult.dataValues.firstName + " " + userResult.dataValues.lastName;
        await Schedule.create({
            name,
            event: eventName + "/On behalf of " + username,
            message,
            scheduleTime,
            emailId
        }).then((result) => {
            if(result)  {
                    Mail.mailer(decodeURIComponent(get_cookies(req)['emailId']), "New event schedule added!", "You have added a new event schedule<br><br>With regards,<br>Wisher.", (error, mailResult) => {
                        if(!error) {
                            res.render("result", {success: true, message: "Your event has been scheduled successfully!!!", loggedIn: true});
                        } else {
                            res.render("result", {success: true, message: "Your event has been scheduled successfully!!!", loggedIn: true});
                        }
                    })
            } else {
                res.render("result", {success: false, message: "Unable to add your schedule at this time!", loggedIn: true})
            }
        }).catch((err) => {
            return res.render("result", {success: false, message: "Unable to add your schedule at this time!", loggedIn: true})
        })
    }).catch((err) => {
        return res.render("result", {success: false, message: "Unable to add your schedule at this time!", loggedIn: true})
    })

}

exports.verify = async(req, res) => {
    let verificationKey = req.params.vk;
    let verificationValue = req.body.code;

    await Verification.findOne({
        where: {
            verificationKey,
            verificationValue,
            isVerified: 0
        }
    }).then((result) => {
        if(result) {
            res.cookie("auth", true);
            res.cookie("emailId", result.dataValues.emaiilId);
            res.redirect('/');
        } else {
            res.render("verify", {invalidCode: true, verificationKey: verificationKey});
        }
    })
}

function makeid(length, capsOnly) {
    var result           = '';
    var characters       = capsOnly === 1 ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }