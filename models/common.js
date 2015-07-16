var returnMessage = function returnMessage(isSuccess,message,res){
	var responseData= {};
	responseData.isSuccess = isSuccess;
	responseData.message = message;
	res.writeHead(200, { 'Content-Type': 'application/json'});
	res.write(JSON.stringify(responseData));
	res.end();
};

module.exports = returnMessage;