/* 
*Title: Token Handaler
*Description: Token Handaler to handle Token related route
*Author: Niloy Roy
*Date: 
*/

//depencies
const data = require('../../lib/data.js');
const { hash } = require('../../helpers/utilities.js');
const { createRandomString } = require('../../helpers/utilities.js');
const { parseJSON } = require('../../helpers/utilities.js');

//module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {

    const acceptMethods = ['get', 'post', 'put', 'delete'];
    if (acceptMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};


handler._token = {};



handler._token.post = async (requestProperties, callback) => {

    const phone = typeof requestProperties.body.phone === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof requestProperties.body.password === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if (phone && password) {
        data.read('users', phone, async (err1, userData) => {
            let hashedPassword = hash(password);
            let parseUserData = await parseJSON(userData);
            if (hashedPassword === parseUserData.password) {
                let tokenID = createRandomString(20);
                let expires = Date.now() + 60 * 60 * 1000;
                let tokenObject = {
                    'phone': phone,
                    'id': tokenID,
                    'expires': expires
                };
                //start the token
                data.create('tokens', tokenID, tokenObject, (err2) => {
                    if (!err2) {
                        callback(200, tokenObject);
                    } else {
                        callback(500, {
                            error: 'There was a problem in the server side!',
                        });  
                    }
                });
            } else {
                callback(400, {
                    error: 'Password is not valid!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
  
}

handler._token.get = (requestProperties, callback) => {

    //check the id if valid
    const id = typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;

    if (id) {
        //lookup the token
        data.read('tokens', id, async (err, tokenData) => {
            const parseTokenData = await parseJSON(tokenData);
            const token = { ...parseTokenData }; //imutable copy
            if (!err && token) {
                callback(200, token);
            } else {
                callback(404, {
                    error: 'Request token was not found!',
                });
            }
        });
    } else {
        callback(404, {
            error: 'Request token was not found'
        });
    }
    
}

handler._token.put = (requestProperties, callback) => {
    //check the id if valid
    const id = typeof requestProperties.body.id === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;

    const extend = typeof requestProperties.body.extend === 'boolean' && requestProperties.body.extend === true ? true : false;

    if (id && extend) {
        data.read('tokens', id, async (err1, tokenData) => {
            let tokenObject = await parseJSON(tokenData);
            if (tokenObject.expires > Date.now()) {
                tokenObject.expires = Date.now() + 60 * 60 * 1000;
                //store the update token
                data.update('tokens', id, tokenObject, (err2) => {
                    if (!err2) {
                        callback(200);
                    } else {
                        callback(500, {
                            error: 'There was a problem in the server side!',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Token already expires!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }

}

handler._token.delete = (requestProperties, callback) => {

    const id = typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;


    if (id) {
        //llokup the user
        data.read('tokens', id, (err1, tokenData) => {
            if (!err1 && tokenData) {
                data.delete('tokens', id, (err2) => {
                    if (!err2) {
                        callback(200, {
                            message: 'Token was succesfully deleted!',
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
        callback(400, {
            error: 'There was a problem in your request!',
        });
    }

}

handler._token.verify = (id, phone, callback) => {
    data.read('tokens', id, async (err, tokenData) => {
        const parseTokenData = await parseJSON(tokenData);
        if (!err && parseTokenData) {
            if (parseTokenData.phone === phone && parseTokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
             }
        } else {
            callback(false);
        }
    });
}



module.exports = handler;