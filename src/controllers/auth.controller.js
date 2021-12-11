const { QueryTypes, DataTypes } = require('sequelize');
const db = require("../database/db");
const User = require("../database/models/user")(db, DataTypes);
const MD5 = require("md5");
const Verification = require("../database/models/verification")(db, DataTypes);
const Mail = require("./mailer");
const md5 = require('md5');

exports.signup = async(req, res) => {
    const { firstName, lastName, mobile, emailId } = req.body;
    let password = MD5(req.body.password);

    await db.transaction(async(t) => {
        await User.findOrCreate({
            where: {
                emailId
            }, defaults: {
                firstName,
                lastName,
                mobile,
                emailId,
                password
            }, transaction: t
        }).then(async (result) => {
            if(result[1])  {
                let verificationKey = makeid(20, 0);
                let verificationValue = makeid(6, 1);
    
                await Verification.create({
                    verificationKey,
                    verificationValue,
                    emailId,
                    isVerified: 0
                }, { transaction: t }).then(async (result) => {
                    if(result)  {
                        Mail.mailer(emailId, "OTP", verificationValue, async (error, mailResult) => {
                            if(!error) {
                                return res.redirect("verify/0/" + verificationKey);
                            } else {
                                throw new Error("Unable to verify user!")
                            }
                        })
                    } else {
                        throw new Error("Unable to process your request at the moment!");
                    }
                }).catch(async (err) => {
                    throw new Error(err);
                })
            } else {
                throw new Error("Email id already exists!")
            }
        }).catch(async(err) => {
            return res.render("signup", {err: true, errMsg: err.message})
        })
    })

}

exports.signin = async(req, res) => {
    const { emailId } = req.body;
    let password = MD5(req.body.password);

    await User.findOne({
        where: {
            emailId,
            password
        }
    }).then((result) => {
        if(result)  {
            res.cookie("emailId", emailId);
            res.cookie("auth", true);
            res.redirect("/");
        } else {
            res.render("signin", {err: true, errMsg: "Invalid email id or password!"})
        }
    }).catch((err) => {
        console.log(err)
        res.render("signin", {err: true, errMsg: "Unable to process your request at the moment!"})
    })

}

exports.forgetPassword = async(req, res) => {
    const {emailId} = req.body;
    
    await User.findOne({
        where: {
            emailId
        }
    }).then(async(userResult) => {
        if(userResult) {
            let verificationKey = makeid(20, 0);
            let verificationValue = makeid(6, 1);

            await Verification.create({
                verificationKey,
                verificationValue,
                emailId,
                isVerified: 0
            }).then(async (result) => {
                if(result)  {
                    Mail.mailer(emailId, "OTP", verificationValue, async (error, mailResult) => {
                        if(!error) {
                            return res.redirect("reset-password/" + verificationKey);
                        } else {
                            throw new Error("Unable to verify user!")
                        }
                    })
                } else {
                    throw new Error("Unable to process your request at the moment!");
                }
            }).catch(async (err) => {
                throw new Error("Unable to process your request at the moment!");
            })
        } else {
            throw new Error("Invalid email id!");
        }
    }).catch(async (err) => {
        return res.render("forget-password", {err: true, errMsg: err.message});
    })
}

exports.resetPassword = async(req, res) => {
    const {verificationValue} = req.body;
    const password = MD5(req.body.password);
    const verificationKey = req.params.vk;

    await db.transaction(async (t) => {
        await Verification.findOne({
            where: {
                verificationKey,
                verificationValue,
                isVerified: 0
            }
        }, {transaction: t}).then(async(result) => {
            // console.log(result)
            if(result) {
                await Verification.update({
                    isVerified: 1
                }, {
                    where: {
                        verificationKey
                    }
                }, {transaction: t}).then(async(updateResult) => {
                    await User.update({
                            password
                        }, { 
                            where: {
                                emailId: result.dataValues.emailId
                        }
                    }, {transaction: t}).then(async(updateResult) => {
                        return res.render("result", {success: true, message: "Password has been changed successfully!!!", loggedIn: false});
                    }).catch(async(err) => {
                        throw new Error("Unable to update user");
                    });
                }).catch(async(err) => {
                    throw new Error("Unable to verify user!")
                })
            } else {
                return res.render("reset-password", {err: true, errMsg: "Invaild verification code"});
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

