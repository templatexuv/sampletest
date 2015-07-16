

//function Common() {}
var common = {};

common.checkParameters = function checkParameters(parameters,parameterValues,res,callback){
	for(var i=0;i<parameters.length;i++){
		if(!parameterValues[i]){
			console.log(parameters[i]);
			return callback({isSuccess :'false',
				message:parameters[i]+' is missing.'});
		}
	}
	return callback(null);
	
}


common.returnMessage = function returnMessage(responseData,res){

	res.writeHead(200, { 'Content-Type': 'application/json'});
	res.write(JSON.stringify(responseData));
	res.end();
};

module.exports = common;
