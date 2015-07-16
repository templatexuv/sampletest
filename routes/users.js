var express = require('express');
var router = express.Router();
var geoip = require('geoip-lite');
var uuid = require('node-uuid');
var common = require('../utils/common');

var accountmanager = require('../models/account-manager');
var emaildispatcher = require('../models/email-dispatcher');

//User Registration
router.post('/register', function(req, res){

	var ipaddress = req.headers['x-forwarded-for'] || 
	req.connection.remoteAddress || 
	req.socket.remoteAddress ||
	req.connection.socket.remoteAddress;

	var geo = geoip.lookup(ipaddress);

	console.log("geo",geo);
	var parameters = ["Name","Email","Mobile Number","Password"];
	var parameterValues = [req.body.name,req.body.email,req.body.mobilenumber, req.body.password];
	common.checkParameters(parameters,parameterValues,res,function(result){
		console.log("result",result);
		if(result){
			common.returnMessage(result,res);
		}else{
			  var userData = {
						name 	: req.body.name,
						email 	: req.body.email,
						mobilenumber: req.body.mobilenumber,
						password	: req.body.password,
						ipaddress 	: ipaddress,
						countrycode : 'AE',
						passwordretrycount : 0,
						uuid : uuid.v1(),
						isActive : 0,
						createdAt   : Date.now() / 1000
					};
				accountmanager.register(userData,req,res, function(e){
					if (e){
						common.returnMessage({isSuccess :'false',
							message:'Registration Failed.'},res);
					}	else{
						
						emaildispatcher.generateRegistrationLink(userData,function(result){
							if(!result){
								accountmanager.deleteAccount(req.body.email,req,function(error,result){
									common.returnMessage({isSuccess :'false',
										message:'Registration Failed.'},res);
								});
							}else{
								common.returnMessage({isSuccess :'true',
									message:'User registered Successfully.'},res);
							}
						});
						
						

					}
				});
		}
	});
 
});

router.get('/validateRegistration',function(req,res,next){
	console.log("/validateRegistration");
	accountmanager.validateRegistration(req.query.email, req.query.id,req,res, function(e){
		if (e){
			common.returnMessage(
				"Email Verification Failed..",res);
		}	else{
			common.returnMessage(
				"Your account has been Activated Successfully.",res);
		}
	});
});


/* login user. */
router.post('/login', function(req, res, next) {
	console.log("/login");
    var parameters = ["loginId","Password"];
	var parameterValues = [req.body.loginId,req.body.password];
	common.checkParameters(parameters,parameterValues,res,function(result){
		console.log("result",result);
		if(result){
			common.returnMessage(result,res);
		}else{
	accountmanager.manualLogin(req.body.loginId, req.body.password,req,res, function(error, result){
		if (!result){
			common.returnMessage({isSuccess :'false',
				      message:'Invalid Credentials.'},res);
		}	else{
			common.returnMessage({isSuccess :'true',
				user:result},res);
		}
	});
	}
	});


});


router.post('/update', function(req, res){
	var parameters = ["UserId","Name","Email","Mobile Number","Password"];
	var parameterValues = [req.body._id,req.body.name,req.body.email,req.body.mobilenumber, req.body.password];
	common.checkParameters(parameters,parameterValues,res,function(result){
		console.log("result",result);
		if(result){
			common.returnMessage(result,res);
		}else{
		accountmanager.updateAccount({
			_id : req.body._id,
			mobilenumber	: req.body.mobilenumber,
			email	: req.body.email,
			name 	: req.body.name,
			password: req.body.password,
			updatedAt   : Date.now() / 1000
		},req,res, function(error, result){
			console.log("update out route",error,result);
			if (!result){
				common.returnMessage({isSuccess :'false',
									message:'Updating your information failed.'},res);
			}	else{
				common.returnMessage({isSuccess :'true',
					message:'User information updated successfully.'},res);
			}
		});
		}
		
	});	
});


router.post('/forgotpassword', function(req, res){
	
	if(req.body.validateCode){
	var parameters = ["loginId","Verification Code","Password"];
	var parameterValues = [req.body.loginId,req.body.validateCode,req.body.password];
		
		common.checkParameters(parameters,parameterValues,res,function(result){
		console.log("result",result);
		if(result){
			common.returnMessage(result,res);
		}else{
		accountmanager.validateVerificationCodeAndPassword(
		             {loginId:req.body.loginId,
		              validateCode:req.body.validateCode,
					  password:req.body.password},req, function(userData){
		if (userData){
			common.returnMessage({isSuccess :'true',
						message:'Your Password has been update successfully.'},res);
		}	else{
			common.returnMessage({isSuccess :'false',
				message:'User not found.'},res);
		}
	});
		}
		
	});	
	
	}else{
	var parameters = ["loginId"];
	var parameterValues = [req.body.loginId];
	common.checkParameters(parameters,parameterValues,res,function(result){
		console.log("result",result);
		if(result){
			common.returnMessage(result,res);
		}else{
		accountmanager.getAccountByEmailOMobile(req.body.loginId,req, function(userData){
		if (userData){
			emaildispatcher.dispatchResetPasswordLink(userData, function(result){
				if (result) {
					common.returnMessage({isSuccess :'true',
						message:'A reset link has been sent to your mail.'},res);
				}	else{
					common.returnMessage({isSuccess :'false',
						message:'Sending Email Failed.'},res);
				}
			});
		}	else{
			common.returnMessage({isSuccess :'false',
				message:'User not found.'},res);
		}
	});
		}
		
	});	
	}
});

router.get('/resetpassword', function(req, res) {
	var email = req.query["e"];
	var passH = req.query["p"];
	accountmanager.validateResetLink(email, passH,req, function(e){
		if (e != 'ok'){
			res.redirect('/');
		} else{
//			save the user's email in a session instead of sending to the client //
			//req.session.reset = { email:email, passHash:passH };
			res.render('reset', { title : 'Reset Password' });
		}
	})
});

router.post('/resetpassword', function(req, res) {
	
//	retrieve the user's email from the session to lookup their account and reset password //
//	var email = req.session.reset.email;
	var email = req.body.email;
	var oldpassword = req.body.oldpassword;
	var newpassword = req.body.newpassword;
	
	console.log(re.body);
//	destory the session immediately after retrieving the stored email //
	//req.session.destroy();
	accountmanager.updatePassword(email,oldpassword, newpassword,req, function(e, o){
		if (o){
			common.returnMessage({isSuccess :'true',
				message:'Password Updated Successfully.'},res);
		}	else{
			common.returnMessage({isSuccess :'false',
				message:'Updating Password Failed.'},res);
		}
	})
});

//view & delete accounts //

router.get('/print', function(req, res) {
	accountmanager.getAllRecords( function(e, accounts){
		res.render('print', { title : 'Account List', accts : accounts });
	})
});

router.post('/delete', function(req, res){
	accountmanager.deleteAccount(req.body.id,req, function(e, obj){
		if (!e){
			res.clearCookie('user');
			res.clearCookie('pass');
			req.session.destroy(function(e){ res.send('ok', 200); });
		}	else{
			res.send('record not found', 400);
		}
	});
});




module.exports = router;
