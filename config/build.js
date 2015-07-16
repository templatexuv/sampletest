var build = {
		AppVersion : '1.0.0', 
		AppVersionUrl : ' ',
		Type : 'Local', //Production OR Local
		Environment : {
			Local: {
				mode: 'local',
				host : '192.168.0.103',
				port: 3000,
				currentLogType : 'file',
				currentLogLevel : 'debug',
				mongo: {
					host: '127.0.0.1',
					port: 27017,
					databasename: 'smstemplates',
					username:'',
					pass : '',
					poolSize :10
				}
			},
			Production: {
				mode: 'production',
				host : '127.0.0.1',
				port: 5000,
				currentLogType : 'file',
				currentLogLevel : 'debug',
				mongo: {
					host: '127.0.0.1',
					port: 27017,
					databasename: 'smstemplates',
					username:'',
					pass : '',
					poolSize :10
				}
			}
		}
}
module.exports = build;