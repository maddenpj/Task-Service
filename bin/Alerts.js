var Scheduler = require('./Scheduler.js').Scheduler;

require('/home/prod/bin/node/core/Core.js');
require('/home/prod/bin/node/core/Alerts.js');




var Config = {
	Alerts: {
		MarketOpen : {
			level: 'WARN',
			schedule : 'On Mon,Wed,Tue,Thu,Fri,Sat at 08:25'
		}
	}
}







