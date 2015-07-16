var express = require('express');
var router = express.Router();
var async = require('async');
var constants = require('../config').constants;
var common = require('../utils/common');



//save Transaction messages
router.post('/saveMessage',function(req,res,next){
	console.log("/saveMessage");
	var parameters = ["Message"];
	var parameterValues = [req.body.messages];
	common.checkParameters(parameters,parameterValues,res,function(result){
		console.log("result",result);
		if(result){
			common.returnMessage(result,res);
		}else{
	var messages = req.body.messages;
	var db = req.db;
	var responseData ={};
	if(messages){	
	db.collection(constants.messages).insert(messages,{w: 1},function(err,records){
		if (err) {
			console.log(err);common.returnMessage({isSuccess :'false',message:'Uknown Error'},res);
		}
		else if(records)
		common.returnMessage({isSuccess :'true',
							message:'Message Saved Successfully.'},res);
							else
								common.returnMessage({isSuccess :'false',message:'Message saving Failed.'},res);
		
	});
	}else{
		common.returnMessage({isSuccess :'false',
							message:'Message Data not found.'},res);
		}
		}
		});
});


//List Transaction messages by userid
router.post('/listmessagesbyuserid',function(req,res,next){
	console.log("/listmessagesbyuserid");
	var parameters = ["Message"];
	var parameterValues = [req.body.messages];
	common.checkParameters(parameters,parameterValues,res,function(result){
		console.log("result",result);
		if(result){
			common.returnMessage(result,res);
		}else{
	var userId = req.body.userId;
	var db = req.db;
	var responseData ={};
	if(userId){	
	db.collection(constants.messages).find({ "userId": userId }).toArray(function(err,records){
		if (err) {
			console.log(err);common.returnMessage({isSuccess :'false',message:'Uknown Error'},res);
		}
		console.log("message records",records);
		
		responseData.isSuccess = true;
		responseData.messages = records;
		common.returnMessage(responseData,res);
		
	});
	}else{
		
		responseData.isSuccess = false;
		responseData.message = "UserId not found.";
		common.returnMessage(responseData,res);
		
	}
	
		}
		});
	
});

//save user wallet 
router.post('/saveWallet',function(req,res,next){
	console.log("/saveWallet");
	
	var parameters = ["Wallets"];
	var parameterValues = [req.body.walletdetails];
	common.checkParameters(parameters,parameterValues,res,function(result){
		console.log("result",result);
		if(result){
			common.returnMessage(result,res);
		}else{
	var walletdetails = req.body.walletdetails;
	var db = req.db;
	var responseData ={};
	if(walletdetails){	
	db.collection(constants.wallets).insert(walletdetails,{w: 1},function(err,records){
		if (err) {
			console.log(err);common.returnMessage({isSuccess :'false',message:'Uknown Error'},res);
		}
		console.log("records saved",records);
		
		
		responseData.isSuccess = true;
		responseData.message = "Wallet Saved Successfully.";
		common.returnMessage(responseData,res);
		
	});
	}else{
		
		responseData.isSuccess = false;
		responseData.message = "Wallet Data not found.";
		common.returnMessage(responseData,res);
		
	}
		}
	});
});

//list wallets
router.post('/listwalletsbyuserid',function(req,res,next){
	console.log("/listwalletsbyuserid");
	
	var parameters = ["User Id"];
	var parameterValues = [req.body.userId];
	common.checkParameters(parameters,parameterValues,res,function(result){
		console.log("result",result);
		if(result){
			common.returnMessage(result,res);
		}else{
	var userId = req.body.userId;
	var db = req.db;
	var responseData ={};
	if(userId){	
	db.collection(constants.wallets).find({ "userId": userId }).toArray(function(err,records){
		if (err) {
			console.log(err);common.returnMessage({isSuccess :'false',message:'Uknown Error'},res);
		}
		console.log("wallet records",records);
		responseData.isSuccess = true;
		responseData.walletdetails = records;
		common.returnMessage(responseData,res);
		
	});
	}else{
		
		responseData.isSuccess = false;
		responseData.message = "UserId not found.";
		common.returnMessage(responseData,res);
	}
		}
	});
});

/* GET Templates,forms,templateforms assigment. */
router.get('/listemplates', function(req, res) {
	console.log("/listemplates");
	var db = req.db;
	/*var parameters = ["User Id"];
	var parameterValues = [req.body._id];
	common.checkParameters(parameters,parameterValues,res,function(result){
		console.log("result",result);
		if(result){
			common.returnMessage(result,res);
		}else{
			*/
	async.parallel([

	                //Read templates data 
	                function(callback) {
	                	var query = db.collection(constants.templates).find({}).toArray(function(err, templates) {
	                		if (err) {
	                			console.log(err);common.returnMessage({isSuccess :'false',message:'Uknown Error'},res);
	                		}
	                		callback(null, templates);
	                	});
	                },

	                //Read banners data
	                function(callback) {
	                	var query = db.collection(constants.banners).find({isActive:"1"}).toArray(function(err, banners) {
	                		if (err) {
	                			console.log(err);common.returnMessage({isSuccess :'false',message:'Uknown Error'},res);
	                		}

	                		callback(null, banners);
	                	});
	                }
	                ],

//	                Compute all results
	                function(err, results) {
		if (err || results == null) {
			console.log(err);
			common.returnMessage({isSuccess :'false',
				message:'Data not found.'},res);
		}

		else{
		//results contains [templates, forms, templateforms]
		var responseData = {};
		responseData.templatesList = results[0] || [];
		responseData.banners       = results[1] || [];
        responseData.isSuccess=true;
		common.returnMessage(responseData,res);
		}						
		});
		//}
	//});
		

});
//save business templates
router.post('/submitbusiness',function(req,res,next){
	console.log("/submitbusiness");
	var parameters = ["User Id","Business Name","Phone","Sms Template","Sms Description"];
	var parameterValues = [req.body.userId,req.body.businessname,req.body.phone,req.body.smstemplate,req.body.smsdescription];
	common.checkParameters(parameters,parameterValues,res,function(result){
		console.log("result",result);
		if(result){
			common.returnMessage(result,res);
		}else{
	var db = req.db;
	var responseData ={};
	db.collection(constants.businesstemplates).insert({
		                           userId : req.body.userId,
								   businessname : req.body.businessname,
								   phone:req.body.phone,
								   smstemplate :req.body.smstemplate,
								   smsdescription : req.body.smsdescription
	},{w: 1},function(err,records){
		if (err) {
			console.log(err);
			common.returnMessage({isSuccess :'false',message:'Uknown Error'},res);
		}
		else if(records)
		common.returnMessage({isSuccess :'true',
							message:'Business submitted Successfully.'},res);
		else
								common.returnMessage({isSuccess :'false',
							message:'Message saving Failed.'},res);
	});
		}
	});
});


module.exports = router;
