

var config = require('../config');
var nodemailer = require('nodemailer');



var mailer = {};

//create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
 service: 'Gmail',
 auth: {
     user: 'aprabhas007@gmail.com',
     pass: 'fanofprabhas'
 }
});

function sendMail(mailOptions,callback){
	//send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
	 if(error){
	     console.log(error);
	     callback(false);
	 }else{
	     console.log('Message sent: ' + info.response);
	     callback(true);
	 }
	});
}

mailer.generateRegistrationLink = function generateRegistrationLink(userData,callback){
//setup e-mail data with unicode symbols
var link = "http://"+config.build.Environment[config.build.Type].host+":"+config.build.Environment[config.build.Type].port+'/user/validateRegistration?email='+userData.email+'&id='+userData.uuid
var html = "<html><body>";
	html += "Hi "+userData.name+",<br><br>";
	html += "Your PhoneNumber is :: <b>"+userData.mobilenumber+"</b><br><br>";
	html += "<a href='"+link+"'>Please click here to activate your account.</a><br><br>";
	html += "</body></html>";
	
console.log(html);
var mailOptions = {
 from: 'apreshrokalla@gmail.com', // sender address
 to: userData.email, // list of receivers
 subject: 'Email Verification', // Subject line
 text: 'Email Verification', // plaintext body
 html: html // html body
};


sendMail(mailOptions,callback);

}


mailer.dispatchResetPasswordLink = function dispatchResetPasswordLink(userData,callback){
	
	var html = "<html><body>";
		html += "Hi "+userData.name+",<br><br>";
		html += "Your Verification Code is : <b>"+userData.validateCode+"</b><br><br>";
		html += "</body></html>";
		
	var mailOptions = {
	 from: 'apreshrokalla@gmail.com', // sender address
	 to: userData.email, // list of receivers
	 subject: 'Reset Password Verification Code', // Subject line
	 text: 'Reset Password Verification Code', // plaintext body
	 html: html // html body
	};
	
	sendMail(mailOptions,callback);
	}

module.exports = mailer;