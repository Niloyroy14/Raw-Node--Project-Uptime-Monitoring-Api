/* 
*Title: User Handaler
*Description: User Handaler to handle user related route
*Author: Niloy Roy
*Date: 
*/

//depencies
const data = require('../../lib/data.js');
const { hash } = require('../../helpers/utilities.js');
const { parseJSON } = require('../../helpers/utilities.js');
const tokenHandler = require('./tokenHandler.js');

//module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
    
    const acceptMethods = ['get', 'post', 'put', 'delete'];
    if (acceptMethods.indexOf(requestProperties.method) > -1) {
        handler._users[requestProperties.method](requestProperties,callback);
    } else {
        callback(405);
    }
};


handler._users = {}; 



handler._users.post = async (requestProperties, callback) => {
    
    const firstName = typeof requestProperties.body.firstName === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof requestProperties.body.lastName === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phone = typeof requestProperties.body.phone === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof requestProperties.body.password === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;
    

  //  const  tosAgreement =  typeof requestProperties.body.tosAgreement === 'boolean' && requestProperties.body.tosAgreement.trim().length > 0 ? requestProperties.body.tosAgreement : false;

    //console.log(tosAgreement);
    if (firstName && lastName && phone && password  ) {
        //make sure that user does not alredy exist
        data.read('users', phone, (err1) => {
            if (err1) {
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    
                };
                //store the user data to file
                data.create('users', phone, userObject, (err2)=>{
                    if (!err2) {
                        callback(200, {
                            message: 'User was created succesfully!', 
                        });
                    } else {
                        callback(500, {
                            error: 'Could not create user!',
                        }); 
                     }
                 })
            } else {
                callback(500, {
                    error: 'There was a problem in server side!',
                })
            }
        });

    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
}

handler._users.get =  (requestProperties, callback) => {
    //check the phone number if valid
    const phone = typeof requestProperties.queryStringObject.phone === 'string' && requestProperties.queryStringObject.phone.trim().length === 11 ? requestProperties.queryStringObject.phone : false;
   
    if (phone) {
        //token verify
        let token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;
        tokenHandler._token.verify(token, phone, (tokenID) => {
            if (tokenID) {
                data.read('users', phone, async (err, u) => {
                    const us = await parseJSON(u);
                    const user = { ...us }; //imutable copy
                    // console.log(user);
                    if (!err && user) {
                        delete user.password;
                        // console.log(user);
                        callback(200, user);
                    } else {
                        callback(404, {
                            error: 'Request user was not found!',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication Failure!',
                });
            }
        });
    } else {
        callback(404, {
            error:'Request user was not found'
        });
    }
}

handler._users.put = (requestProperties, callback) => {
    //check the phone number valid
    const firstName = typeof requestProperties.body.firstName === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof requestProperties.body.lastName === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phone = typeof requestProperties.body.phone === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof requestProperties.body.password === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;
    
     
    if (phone) {
        if (firstName || lastName || password) {
            //token verify
            let token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;
            tokenHandler._token.verify(token, phone, (tokenID) => {
                if (tokenID) {
                    data.read('users', phone, (err1, uData) => {
                        const userData = { ...parseJSON(uData) };
                        if (!err1 && userData) {
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (phone) {
                                userData.phone = phone;
                            }
                            if (password) {
                                userData.password = hash(password);
                            }
                            //store to file
                            data.update('users', phone, userData, (err2) => {
                                if (!err2) {
                                    callback(200, {
                                        message: 'User was updated succesfully!',
                                    });
                                } else {
                                    callback(500, {
                                        error: 'There was a problem in the server side!',
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                error: 'You have a problem in your request!',
                            });
                        }
                    });
                } else {
                    callback(403, {
                        error: 'Authentication Failure!',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'You have a problem in your request!',
            }); 
        }
    } else {
        callback(400, {
            error: 'Invalid phone number. Please try again!',
        });
    }

}

handler._users.delete = (requestProperties, callback) => {

    const phone = typeof requestProperties.queryStringObject.phone === 'string' && requestProperties.queryStringObject.phone.trim().length === 11 ? requestProperties.queryStringObject.phone : false;

    if (phone) {
        //token verify
        let token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;
        tokenHandler._token.verify(token, phone, (tokenID) => {
            if (tokenID) {
                data.read('users', phone, (err1, userData) => {
                    if (!err1 && userData) {
                        data.delete('users', phone, (err2) => {
                            if (!err2) {
                                callback(200, {
                                    message: 'User was succesfully deleted!',
                                });
                            } else {
                                callback(500, {
                                    error: 'There was a server side error!',
                                });
                            }
                        });
                    } else {
                        callback(500, {
                            error: 'There was a problem in your server!',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication Failure!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There was a problem in your request!',
        });
    }

}



module.exports = handler;