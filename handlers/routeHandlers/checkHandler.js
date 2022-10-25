/* 
*Title: Check Handaler
*Description: Check Handaler to handle user defiens check
*Author: Niloy Roy
*Date: 
*/

//depencies
const data = require('../../lib/data.js');
const { hash } = require('../../helpers/utilities.js');
const { createRandomString } = require('../../helpers/utilities.js');
const { parseJSON } = require('../../helpers/utilities.js');
const tokenHandler = require('./tokenHandler.js');
const { maxChecks } = require('../../helpers/environments.js');


//module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {

    const acceptMethods = ['get', 'post', 'put', 'delete'];
    if (acceptMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};


handler._check = {};



handler._check.post = async (requestProperties, callback) => {

    //validate inputs
    const protocol = typeof requestProperties.body.protocol === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    const url = typeof requestProperties.body.url === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    const method = typeof requestProperties.body.method === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    const succesCode = typeof requestProperties.body.succesCode === 'object' && requestProperties.body.succesCode instanceof Array ? requestProperties.body.succesCode : false;

    const timeoutSeconds = typeof requestProperties.body.timeoutSeconds === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;


    if (protocol && url && method && succesCode && timeoutSeconds) {

        const token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;

        //lookup the user phone by reading the token
        data.read('tokens', token, async (err1, tokenData) => {
            if (!err1 && tokenData) {
                let parsePhone = await parseJSON(tokenData);
                let userPhone = parsePhone.phone;

                //lookup the user data
                data.read('users', userPhone, async (err2, userData) => {
                    if (!err2 && userData) {
                        tokenHandler._token.verify(token, userPhone, async (tokenisValid) => {
                            if (tokenisValid) {
                                let userObject = await parseJSON(userData);
                                let userChecks = userObject.checks === 'Object' && userObject.checks instanceof Array ? userObject.checks : [];
                                if (userChecks.length < maxChecks) {
                                    let checkId = createRandomString(20);
                                    let checkObject = {
                                        id: checkId,
                                        userPhone: userPhone,
                                        protocol: protocol,
                                        url: url,
                                        method: method,
                                        succesCode: succesCode,
                                        timeoutSeconds: timeoutSeconds
                                    };
                                    //save the object
                                    data.create('checks', checkId, checkObject, (err3) => {
                                        if (!err3) {
                                            //add check id to the user's object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);
                                            console.log(userObject);
                                            //save the new user
                                            data.update('users', userPhone, userObject, (err4) => {
                                                if (!err4) {
                                                    //return the data about the new check
                                                    callback(200, checkObject);
                                                } else {
                                                    callback(500, {
                                                        error: 'There was a problem in the server side!',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'There was a problem in the server side!',
                                            });
                                        }
                                    });
                                } else {
                                    callback(403, {
                                        error: 'Users already reached max check limit!',
                                    });
                                }
                            } else {
                                callback(403, {
                                    error: 'Authentication Problem!',
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'User Not Found!',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication Problem!',
                });
            }
        });

    } else {
        callback(400, {
            error: 'You have a problem in your request!',
        });
    }
}

handler._check.get = (requestProperties, callback) => {

    //check the id if valid
    const id = typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;

    if (id) {
        //lookup the token
        data.read('checks', id, async (err, checkData) => {
            if (!err && checkData) {

                const token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;

                let parsePhone = await parseJSON(checkData);
                let userPhone = parsePhone.userPhone;


                tokenHandler._token.verify(token, userPhone, async (tokenisValid) => {
                    if (tokenisValid) {
                        callback(200, await parseJSON(checkData));
                    } else {
                        callback(403, {
                            error: 'Authentication Problem!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'There was a problem in the server side!',
                });
            }
        });
    } else {
        callback(404, {
            error: 'Request token was not found'
        });
    }

}

handler._check.put = (requestProperties, callback) => {

    const id = typeof requestProperties.body.id === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;

    //validate inputs
    const protocol = typeof requestProperties.body.protocol === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    const url = typeof requestProperties.body.url === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    const method = typeof requestProperties.body.method === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    const succesCode = typeof requestProperties.body.succesCode === 'object' && requestProperties.body.succesCode instanceof Array ? requestProperties.body.succesCode : false;

    const timeoutSeconds = typeof requestProperties.body.timeoutSeconds === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;

    if (id) {
        if (protocol || url || method || succesCode || timeoutSeconds) {
            data.read('checks', id, async (err1, checkData) => {
                if (!err1 && checkData) {

                    const token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;

                    let checkObject = await parseJSON(checkData);
                    let userPhone = checkObject.userPhone;

                    tokenHandler._token.verify(token, userPhone, async (tokenisValid) => {
                        if (tokenisValid) {
                            if (protocol) {
                                checkObject.protocol = protocol;
                            }
                            if (url) {
                                checkObject.url = url;
                            }
                            if (method) {
                                checkObject.method = method;
                            }
                            if (succesCode) {
                                checkObject.succesCode = succesCode;
                            }
                            if (timeoutSeconds) {
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }
                            //store the checkObject
                            data.update('checks', id, checkObject, (err2) => {
                                if (!err2) {
                                    callback(200);
                                } else {
                                    callback(500, {
                                        error: 'There was a problem in the server side!',
                                    });
                                }
                            });
                        } else {
                            callback(403, {
                                error: 'Authentication Problem!',
                            });
                        }
                    });
                } else {
                    callback(500, {
                        error: 'There was a problem in the server side!',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'You must provide at least one field to update!',
            });
        }
    } else {
        callback(400, {
            error: 'You have a problem in your request!',
        });
    }

}

handler._check.delete = (requestProperties, callback) => {
    //check the id if valid
    const id = typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;

    if (id) {
        //lookup the token
        data.read('checks', id, async (err1, checkData) => {
            if (!err1 && checkData) {

                const token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;

                let parsePhone = await parseJSON(checkData);
                let userPhone = parsePhone.userPhone;


                tokenHandler._token.verify(token, userPhone, async (tokenisValid) => {
                    if (tokenisValid) {
                       //delete the check data
                        data.delete('checks', id, (err2) => {
                            if (!err2) {
                                data.read('users', userPhone, async (err3, userData) => {
                                    let userObject = await parseJSON(userData);
                                    if (!err3 && userData) {
                                        let userChecks = typeof userObject.checks === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                        //remove the deleted check id from user's list of checks
                                        let checkPosition = userChecks.indexOf(id);
                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1); //remove
                                            //resave the user data
                                            userObject.checks = userChecks;
                                            data.update('users', userPhone, userObject, (err4) => {
                                                if (!err4) {
                                                    callback(200);
                                                } else {
                                                    callback(500, {
                                                        error: 'There was a problem in the server side!',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'The check id that you are trying to remove is not found in user!',
                                            });
                                        }
                                    } else {
                                        callback(500, {
                                            error: 'There was a problem in the server side!',
                                        });
                                   }
                                });
                            } else {
                                callback(500, {
                                    error: 'There was a problem in the server side!',
                                });
                           }
                        });
                    } else {
                        callback(403, {
                            error: 'Authentication Problem!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'There was a problem in the server side!',
                });
            }
        });
    } else {
        callback(404, {
            error: 'Request token was not found'
        });
    }
}



module.exports = handler;