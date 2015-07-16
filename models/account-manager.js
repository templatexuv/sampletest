
var crypto 		= require('crypto');
var constants = require('../config').constants;
var emaildispatcher = require('../models/email-dispatcher');
var common = require('../utils/common');


/* login validation methods */

exports.manualLogin = function(loginId, password,req,res, callback)
{
	var queryObject = isNaN(loginId) ? {email:loginId} : {mobilenumber:loginId};
	req.db.collection(constants.users).findOne(queryObject, function(e, user) { 
		
		if (user == null){
			common.returnMessage({isSuccess :'false',
				message:'User not found.'},res);
		}else{
			validatePassword(password, user.password, function(err, resilt) {
				if (resilt){
					callback(null, user);
				}else{
				common.returnMessage({isSuccess :'false',
				      message:'Invalid Password.'},res);
				}
			});
		}
	});
}

exports.validateRegistration = function(email,uuid,req,res,callback){
	req.db.collection(constants.users).update({"email":email,"uuid":uuid},{$set: {isActive:1}}, { multi: false }, function(err,count) {
		if (count) callback(false);
		else callback(true);
	});	
}

/* record insertion, update & deletion methods */

exports.register = function(userData,req,res, callback)
{
	req.db.collection(constants.users).findOne({email:userData.email}, function(error, userobj) {
		if (userobj){
			common.returnMessage({isSuccess :'false',
					message:'A User with this Email has been already registred.'},res);	
		}	else{
			req.db.collection(constants.users).findOne({mobilenumber:userData.mobilenumber}, function(error, userobj) {
				if (userobj){
					common.returnMessage({isSuccess :'false',
						message:'A User with this MobileNumber has been already registred.'},res);
					
				}	else{
					saltAndHash(userData.password, function(hash){
						userData.password = hash;
					
						req.db.collection(constants.users).insert(userData, {safe: true}, callback);
					});
				}
			});
		}
	});
}


exports.updateAccount = function(newData,req,res, callback)
{
	req.db.collection(constants.users).findOne({_id:getObjectId(newData._id,req),email:newData.email}, function(error, userobj) {
		console.log("userobj",userobj);
		if (userobj){
			common.returnMessage({isSuccess :'false',
					message:'A User with this Email has been already registred.'},res);	
		}	else{
			req.db.collection(constants.users).find({_id:{$ne: newData._id},mobilenumber:newData.mobilenumber}, function(error, userobj) {
				if (userobj){
					common.returnMessage({isSuccess :'false',
						message:'A User with this MobileNumber has been already registred.'},res);
				}	else{
					saltAndHash(newData.password, function(hash){
						newData.password = hash;
					req.db.collection(constants.users).update({_id:newData._id},newData, {safe: true}, function(err,o) {
						console.log("update result",err,o);
					callback(null,o);					
					});
				});
				}
			});
		}
	});
}

/* account lookup methods */

exports.deleteAccount = function(email,req, callback)
{
	req.db.collection(constants.users).remove({email:email}, callback);
}

exports.getAccountByEmailOMobile = function(loginId,req, callback)
{
	var queryObject = isNaN(loginId) ? {email:loginId} : {mobilenumber:loginId};
	req.db.collection(constants.users).findOne(queryObject, function(e, userData){ 
	var validateCode  = random(5);
	if(userData){
	 req.db.collection(constants.users).update(queryObject,{$set: {validateCode:validateCode}}, { multi: false }, function(err,count) {
		 userData.validateCode =validateCode;
		if (count) callback(userData);
		else callback(null);
	});		
	}else{
	callback(null); 
	}
	
	});
}
//updating password if user exist with the verificationcode
exports.validateVerificationCodeAndPassword = function(requestData,req,callback)
{	
console.log(requestData);
	var queryObject = isNaN(requestData.loginId) ? {email:requestData.loginId,validateCode:requestData.validateCode} : {mobilenumber:requestData.loginId,validateCode:requestData.validateCode};
	req.db.collection(constants.users).findOne(queryObject, function(e, userData){ 
	if(userData){		
		saltAndHash(requestData.password, function(hash){
		req.db.collection(constants.users).update(queryObject,{$set: {password:hash,validateCode:""}}, { multi: false }, function(err,count) {
		if (count) callback(userData);
		else callback(null);					
		});
	});		
	}else{
	callback(null); 
	}
	
	});
}

exports.validateResetLink = function(email, passHash,req, callback)
{
	req.db.collection(constants.users).find({ $and: [{email:email, pass:passHash}] }, function(e, o){
		callback(o ? 'ok' : null);
	});
}

exports.getAllRecords = function(req,callback)
{
	req.db.collection(constants.users).find().toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};

exports.delAllRecords = function(callback)
{
	req.db.collection(constants.users).remove({}, callback); // reset req.db.collection(constants.users) collection for testing //
}

/* private encryption & validation methods */

var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback)
{
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}

/* auxiliary methods */

var getObjectId = function(id,req)
{
	return req.db.collection(constants.users).db.bson_serializer.ObjectID.createFromHexString(id)
}

var findById = function(id,req, callback)
{
	req.db.collection(constants.users).findOne({_id: getObjectId(id)},
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};


var findByMultipleFields = function(a,req, callback)
{
// this takes an array of name/val pairs to search against {fieldName : 'value'} //
	req.db.collection(constants.users).find( { $or : a } ).toArray(
		function(e, results) {
		if (e) callback(e)
		else callback(null, results)
	});
}

function random (howMany, chars) {
    chars = chars 
        || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    var rnd = crypto.randomBytes(howMany)
        , value = new Array(howMany)
        , len = chars.length;

    for (var i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len]
    };

    return value.join('');
}
