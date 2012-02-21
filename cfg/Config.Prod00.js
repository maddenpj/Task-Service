exports.Config = {

    defaultUser: 'prod',
	datesFile  : '/home/prod/data/Static/Dates',

	//////////////
	// Research //
	//////////////

    Tasks : {
	pushDailyToNodes : {
	    command    : '/home/omni/process/research/data/bin/pushDailyDataToNodesTask.py >> /home/omni/log/task.pushDailyToNodes.on.YYYYMMDD.log 2>&1',
	    runAs      : 'omni',
	    node       : 'node00',
	    schedule   : 'Offset T+1 at 06:00',
	    depends    : ['dataBOD'],
 	    group      : 'Research|Data',
	    failPolicy : 'enable' //or 'disable'
	},

	pushLevel01ToNodes : {
	    command    : '/home/omni/process/research/data/bin/pushLevel01ToNodesTask.py >> /home/omni/log/task.pushLevel01ToNodes.on.YYYYMMDD.log 2>&1',
	    runAs      : 'omni',
	    node       : 'node00',
	    schedule   : 'Offset T+1 at 06:05',
	    depends    : ['itchBOD'],
 	    group      : 'Research|Data',
	    failPolicy : 'enable' //or 'disable'
	},

	pushLevel00ToNodes : {
	    command    : '/home/omni/process/research/data/bin/pushLevel00ToNodesTask.py >> /home/omni/log/task.pushLevel00ToNodes.on.YYYYMMDD.log 2>&1',
	    runAs      : 'omni',
	    node       : 'node00',
	    schedule   : 'Offset T+1 at 06:30',
	    depends    : ['itchBOD'],
 	    group      : 'Research|Data',
	    failPolicy : 'enable' //or 'disable'
	},

	push1MinToNodes : {
	    command    : '/home/omni/process/research/data/bin/push1MinToNodesTask.py >> /home/omni/log/task.push1MinToNodes.on.YYYYMMDD.log 2>&1',
	    runAs      : 'omni',
	    node       : 'node00',
	    schedule   : 'Offset T+1 at 06:45',
	    depends    : ['itchBOD'],
 	    group      : 'Research|Data',
	    failPolicy : 'enable' //or 'disable'
	},

	researchPutnamCreateBOD : {
	    command    : '/home/omni/process/research/strat/putnam/bin/putnamCreateBODTask.py >> /home/omni/log/task.researchPutnamCreateBOD.on.YYYYMMDD.log 2>&1',
	    runAs      : 'omni',
	    node       : 'node00',
	    schedule   : 'Offset T+1 at 07:15',
	    depends    : ['dataBOD', 'itchBOD'],
 	    group      : 'Research|Data',
	    failPolicy : 'enable' //or 'disable'
	},

	///////////////////////
	// Data Begin-of-Day //
	///////////////////////

	dataBOD : {
	    command    : '/home/prod/NxtProcess/data/dataBgnOfDayTask.py >> /home/prod/log/task.dataBgnOfDayTask.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+1 at 05:00',
 	    group      : 'Prod|Data',
	    failPolicy : 'enable' //or 'disable'
	},

	itchBOD : {
	    command    : '/home/prod/NxtProcess/data/itchBgnOfDayTask.py >> /home/prod/log/task.itchBgnOfDayTask.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+1 at 02:00',
 	    group      : 'Prod|Data',
	    failPolicy : 'enable' //or 'disable'
	},

	itchEOD : {
	    command    : '/home/prod/NxtProcess/data/itchEndOfDayTask.py /home/prod/data/Itch4X 2 >> /home/prod/log/task.itchEndOfDayTask.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+1 at 17:00',
 	    group      : 'Prod|Data',
	    failPolicy : 'enable' //or 'disable'
	},

	/////////////
	// Brokers //
	/////////////

	gsecBOD : {
	    command    : '/home/prod/NxtProcess/brokers/GSEC/gsecBgnOfDayTask.py >> /home/prod/log/task.gsecBgnOfDay.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+0 at 06:00',
 	    group      : 'Prod|Broker',
	    failPolicy : 'enable' //or 'disable'
	},

	gsecGetLocates : {
	    command    : '/home/prod/NxtProcess/brokers/GSEC/gsecGetLocatesTask.py >> /home/prod/log/task.gsecGetLocates.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+0 at 08:00',
 	    group      : 'Prod|Broker',
	    failPolicy : 'enable' //or 'disable'
	},

	/////////////////////////////
	// Strategy Begin-of-Day's //
	/////////////////////////////
	
	putnamXLE_BOD : {
	    command    : '/home/prod/NxtProcess/strategy/PutnamXLE/putnamXLE_BgnOfDayTask.py >> /home/prod/log/task.putnamXLEBgnOfDay.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+0 at 06:05',
	    depends    : ['dataBOD', 'gsecBOD'],
 	    group      : 'Prod|PutnamXLE',
	    failPolicy : 'enable' //or 'disable'
	},

	putnamNASD_BOD : {
	    command    : '/home/prod/NxtProcess/strategy/PutnamNASD/putnamNASD_BgnOfDayTask.py >> /home/prod/log/task.putnamNASDBgnOfDay.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+0 at 06:05',
	    depends    : ['dataBOD', 'gsecBOD'],
 	    group      : 'Prod|PutnamNASD',
	    failPolicy : 'enable' //or 'disable'
	},
	
	putnamNASD_RTSim_BOD : {
	    command    : '/home/prod/NxtProcess/strategy/PutnamNASD_RTSim/putnamNASD_RTSim_BgnOfDayTask.py >> /home/prod/log/task.putnamNASD_RTSimBgnOfDay.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+0 at 06:15',
	    depends    : ['dataBOD', 'gsecBOD'],
 	    group      : 'Prod|PutnamNASD_RTSim',
	    failPolicy : 'enable' //or 'disable'
	},

	putnamLV_BOD : {
	    command    : '/home/prod/NxtProcess/strategy/PutnamLV/putnamLV_BgnOfDayTask.py >> /home/prod/log/task.putnamLVBgnOfDay.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+0 at 06:20',
	    depends    : ['dataBOD', 'gsecBOD'],
 	    group      : 'Prod|PutnamLV',
	    failPolicy : 'enable' //or 'disable'
	},

	factor_BOD : {
	    command    : '/home/prod/NxtProcess/strategy/Factor/factor_BgnOfDayTask.py >> /home/prod/log/task.factorBgnOfDay.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+0 at 06:30',
	    depends    : ['dataBOD', 'gsecBOD', 'putnamXLE_BOD'],
 	    group      : 'Prod|Factor',
	    failPolicy : 'enable' //or 'disable'
	},

	/////////////////
	// Price Feeds //
	/////////////////

	inRushRelayBOD :  {
	    command    : '/home/prod/NxtProcess/feeds/InRushRelay/inRushRelay_BgnOfDayTask.py >> /home/prod/log/task.InRushRelay_BgnOfDay.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+0 at 06:50',
	    depends    : ['putnamLV_BOD', 'putnamNASD_BOD','putnamNASD_RTSim_BOD','putnamXLE_BOD'],
 	    group      : 'Prod|Feeds',
	    failPolicy : 'enable' //or 'disable'
	},
	
	inRushCQBOD :  {
	    command    : '/home/prod/NxtProcess/feeds/InRushCQ/inRushCQ_BgnOfDayTask.py >> /home/prod/log/task.InRushCQ_BgnOfDay.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+0 at 06:50',
	    depends    : ['putnamLV_BOD', 'putnamNASD_BOD','putnamNASD_RTSim_BOD','putnamXLE_BOD'],
 	    group      : 'Prod|Feeds',
	    failPolicy : 'enable' //or 'disable'
	},

	startCQ :  {
	    command    : '/home/prod/NxtProcess/trading/startCq.py >> /home/prod/log/task.startCQ.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+0 at 06:55',
	    depends    : ['inRushRelayBOD', 'inRushCQBOD'],
 	    group      : 'Prod|Trading',
	    failPolicy : 'enable' //or 'disable'
	},
	
	inRushCQEOD :  {
	    command    : '/home/prod/NxtProcess/feeds/InRushCQ/inRushCQ_EndOfDayTask.py >> /home/prod/log/task.InRushCQ_EndOfDay.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+0 at 18:30',
	    depends    : ['inRushCQBOD'],
 	    group      : 'Prod|Feeds',
	    failPolicy : 'enable' //or 'disable'
	},

	inRushRelayEOD :  {
	    command    : '/home/prod/NxtProcess/feeds/InRushRelay/inRushRelay_EndOfDayTask.py >> /home/prod/log/task.InRushRelay_EndOfDay.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+0 at 18:30',
	    depends    : ['inRushRelayBOD'],
 	    group      : 'Prod|Feeds',
	    failPolicy : 'enable' //or 'disable'
	},

	/////////////////////////
	// Strategy End-of-Day //
	/////////////////////////
	
	putnamNASD_EOD : {
	    command    : '/home/prod/NxtProcess/strategy/PutnamNASD/putnamNASD_EndOfDayTask.py >> /home/prod/log/task.putnamNASDEndOfDay.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+0 at 18:05',
 	    depends    : ['putnamNASD_BOD'],
	    group      : 'Prod|PutnamNASD',
	    failPolicy : 'enable' //or 'disable'
	},

	putnamNASD_RTSim_EOD : {
	    command    : '/home/prod/NxtProcess/strategy/PutnamNASD_RTSim/putnamNASD_RTSim_EndOfDayTask.py >> /home/prod/log/task.putnamNASD_RTSimEndOfDay.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+0 at 18:15',
	    depends    : ['putnamNASD_RTSim_BOD'],
 	    group      : 'Prod|PutnamNASD_RTSim',
	    failPolicy : 'enable' //or 'disable'
	},

	putnamLV_EOD : {
	    command    : '/home/prod/NxtProcess/strategy/PutnamLV/putnamLV_EndOfDayTask.py >> /home/prod/log/task.putnamLVEndOfDay.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+0 at 18:20',
	    depends    : ['putnamLV_BOD'],
 	    group      : 'Prod|PutnamLV',
	    failPolicy : 'enable' //or 'disable'
	},
	
	gsGetReports : {
	    command    : '/home/prod/NxtProcess/brokers/GSEC/gsecGetReportsTask.py >> /home/prod/log/task.gsecGetReports.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+0 at 19:00',
 	    group      : 'Prod|Broker',
	    failPolicy : 'enable' //or 'disable'
	},

	gsAnalytics : {
	    command    : '/home/prod/bin/gsecPnlTask.js >> /home/prod/log/task.gsecPnlTask.on.YYYYMMDD.log 2>&1',
	    node       : 'prod00',
	    schedule   : 'Offset T+0 at 19:10',
 	    group      : 'Prod|Broker',
	    failPolicy : 'enable' //or 'disable'
	},	
    }
}

