var mongoose = require("mongoose");
const bcrypt = require('bcryptjs');


var Schema = mongoose.Schema;
var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
});

let User;


module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://msingh683:Basketball1713@senecaweb.rsgpwni.mongodb.net/?retryWrites=true&w=majority");
        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        }
        else {
            bcrypt.hash(userData.password, 10).then(hash => { // Hash the password using a Salt that was generated using 10 rounds
                // TODO: Store the resulting "hash" value in the DB
                let newUser = new User({
                    userName: userData.userName,
                    userAgent: userData.userAgent,
                    email: userData.email,
                    password: hash,
                });
                newUser.save().then(() => {
                    resolve();
                }).catch((err) => {
                    if (err.code == 11000) {
                        reject("User Name already taken");
                    }
                    else {
                        reject("There was an error creating the user: " + err);

                    }
                })
            })
                .catch(err => {
                    reject("There was an error encrypting the password"); // Show any errors that occurred during the process
                });

        }
    });
}



module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
        User.find({ userName: userData.userName }).exec().then((users) => {
            if (users.length == 0) {
                reject("Unable to find user: " + userData.userName);
            }
            bcrypt.compare(userData.password, users[0].password).then((result) => {
                if (result===false) {
                    reject("Incorrect Password for user: " + userData.userName);
                }
                else{
                    User.updateOne(
                        { userName: users[0].userName },
                        { $set: { loginHistory: users[0].loginHistory } }
                    ).exec().then(() => {
                        resolve(users[0]);
                    }).catch((err) => {
                        reject("There was an error verifying the user: " + err);
                    }); 
                }
            });


            users[0].loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });

            
        }).catch(() => {
            reject("Unable to find user: " + userData.userName);
        })
    });
}

