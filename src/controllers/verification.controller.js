const { QueryTypes, DataTypes } = require('sequelize');
const db = require("../database/db");
const Verification = require("../database/models/verification")(db, DataTypes);
const Mail = require("./mailer");
// const MD5 = require("md5");
const User = require("../database/models/user")(db, DataTypes);

exports.newVerification = async(req, res) => {
    const { emailId } = req.body;
    let verificationKey = makeid(20, 0);
    let verificationValue = makeid(6, 1);

    await User.findOne({
        where: {
            emailId
        }
    }).then(async (userResult) => {
        if(!userResult) {
            await Verification.create({
                verificationKey,
                verificationValue,
                emailId,
                isVerified: 0
            }).then((result) => {
                // console.log(result)
                if(result)  {
                    // res.cookie("emailId", emailId);
                    // res.cookie("auth", true);
                    // res.send({
                    //     status:  200,
                    //     message: "Logged in"
                    // })
                    Mail.mailer(emailId, "OTP", verificationValue, (error, mailResult) => {
                        if(!error) {
                            res.redirect("verify/1/" + verificationKey);
                        } else {
                            throw new Error("Unable to verify user!")
                        }
                    })
                } else {
                    throw new Error("Unable to verify user!")
                }
            }).catch(async(err) => {
                throw new Error("Unable to verify user!")
            })
        } else {
            throw new Error("This email id has been already registered with us!");
        }
    }).catch((err) => {
        res.render("guest-login", {err: true, errMsg: err.message});
    })

}

exports.verifyGuest = async(req, res) => {
    // console.log(req.params)
    // console.log(req.param)
    console.log(req.query)
    let verificationKey = req.params.vk;
    let verificationValue = req.body.code;

    await Verification.findOne({
        where: {
            verificationKey,
            verificationValue,
            isVerified: 0
        }
    }).then((result) => {
        // console.log(result)
        if(result) {
            res.cookie("auth", true);
            res.cookie("emailId", result.dataValues.emailId);
            res.redirect('/');
        } else {
            res.render("verify", {invalidCode: true, verificationKey: verificationKey});
        }
    })
}

exports.verify = async(req, res) => {
    // console.log(req.params)
    // console.log(req.param)
    // console.log(req.query)
    let verificationKey = req.params.vk;
    let verificationValue = req.body.code;
    let type = req.params.type;

    await db.transaction(async (t) => {
        await Verification.findOne({
            where: {
                verificationKey,
                verificationValue,
                isVerified: 0
            }
        }).then(async(result) => {
            // console.log(result)
            if(result) {
                await Verification.update({
                    isVerified: 1
                }, {
                    where: {
                        verificationKey
                    }
                }).then(async(updateResult) => {
                    if(type === "1") {
                        res.cookie("auth", true);
                        res.cookie("emailId", result.dataValues.emailId);
                        res.redirect('/');
                        return;
                    } else {
                        return res.render("result", {success: true, message: "Verification successfull!", loggedIn: false});
                    }
                }).catch(async(err) => {
                    return res.render("result", {success: false, message: "Unable to verify user at the moment!", loggedIn: false});
                })
            } else {
                return res.render("verify", {invalidCode: true, verificationKey: verificationKey});
            }
        }).catch(async(err) => {
            return res.render("result", {success: false, message: "Unable to verify user at the moment!", loggedIn: false});
        })
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