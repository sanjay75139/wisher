const auth = require("../controllers/auth.controller");
const verification = require("../controllers/verification.controller");
const schedule = require("../controllers/schedules.controller");

module.exports = (app) => {
    app.post('/new-user', auth.signup);

    app.post('/signin', auth.signin);

    app.post('/forget-password', auth.forgetPassword);

    app.post('/reset-password/:vk', auth.resetPassword);

    app.post("/new-verification", verification.newVerification);

    app.post("/verify/:type/:vk", verification.verify);

    app.post("/new-schedule", schedule.newSchedule);
}