// 0   2 * * 2,3,4,5,6 ssh prod@prod01 '/home/prod/process/data/bin/dataBeginOfDayProcess.py            >> /home/prod/log/cron.dataDaily.log     2>&1'
// 0   2 * * 2,3,4,5,6 ssh prod@prod01 '/home/prod/process/data/bin/itchBeginOfDayProcess.py            >> /home/prod/log/cron.itchDaily.log     2>&1'
// 0  17 * * 2,3,4,5,6 ssh prod@prod01 '/home/prod/process/data/bin/itchEndOfDayProcess.py /home/prod/data/Itch4X 2  >> /home/prod/log/cron.itchEndOfDay.log   2>&1'
// 0   6 * * 1,2,3,4,5 ssh prod@prod01 '/home/prod/process/brokers/GS/bin/getGSReportsProcess.py        >> /home/prod/log/cron.getGSReports.log      2>&1'
// 5   6 * * 1,2,3,4,5 ssh prod@prod01 '/home/prod/process/strat/putnam/bin/putnamBeginOfDayProcess.py  >> /home/prod/log/cron.putnamBeginOfDay.log  2>&1'
// 15  6 * * 1,2,3,4,5 ssh prod@prod01 '/home/prod/process/feeds/inRushCQ/bin/inRushCQBeginOfDayProcess.py  >> /home/prod/log/cron.inRushCQBeginOfDay.log       2>&1'
// 0   8 * * 1,2,3,4,5 ssh prod@prod01 '/home/prod/process/strat/putnam/bin/putnamGetLocatesProcess.py  >> /home/prod/log/cron.putnamGetLocates.log  2>&1'
// 0  18 * * 1,2,3,4,5 ssh prod@prod01 '/home/prod/process/strat/putnam/bin/putnamEndOfDayProcess.py    >> /home/prod/log/cron.putnamEndOfDay.log    2>&1'
// 0  18 * * 1,2,3,4,5 ssh prod@prod01 '/home/prod/process/strat/putnam/bin/inRushCQEndOfDayProcess.py  >> /home/prod/log/cron.inRushCQEndOfDay.log    2>&1'

exports.Config = {
 Tasks : {
  dataBOD : {
	command    : '/home/prod/process/data/bin/dataBeginOfDayProcess.py >> /home/prod/log/cron.dataDaily.log 2>&1',
	node       : 'prod01',
	schedule   : 'On Tue,Wed,Thu,Fri,Sat at 02:00',
	failPolicy : 'enable' //or 'disable'
  },

  itchBOD : {
	command    : '/home/prod/process/data/bin/itchBeginOfDayProcess.py >> /home/prod/log/cron.itchDaily.log 2>&1',
	node       : 'prod01',
	schedule   : 'On Tue,Wed,Thu,Fri,Sat at 02:00',
	failPolicy : 'enable' //or 'disable'
  },

  itchEOD : {
	command    : '/home/prod/process/data/bin/itchEndOfDayProcess.py /home/prod/data/Itch4X 2 >> /home/prod/log/cron.itchEndOfDay.log 2>&1',
	node       : 'prod01',
	schedule   : 'On Tue,Wed,Thu,Fri,Sat at 17:00',
	failPolicy : 'enable' //or 'disable'
  },

  gsReports : {
	command    : '/home/prod/process/brokers/GS/bin/getGSReportsProcess.py >> /home/prod/log/cron.getGSReports.log 2>&1',
	node       : 'prod01',
	schedule   : 'On Mon,Tue,Wed,Thu,Fri at 06:00',
	failPolicy : 'enable' //or 'disable'
  },

  putnamBOD : {
	command    : '/home/prod/process/strat/putnam/bin/putnamBeginOfDayProcess.py >> /home/prod/log/cron.putnamBeginOfDay.log 2>&1',
	node       : 'prod01',
	schedule   : 'On Mon,Tue,Wed,Thu,Fri at 06:05',
	depends    : ['dataBOD', 'gsReports'],
	failPolicy : 'enable' //or 'disable'
  },

  inRushCQBOD :  {
	command    : '/home/prod/process/feeds/inRushCQ/bin/inRushCQBeginOfDayProcess.py >> /home/prod/log/cron.inRushCQBeginOfDay.log 2>&1',
	node       : 'prod01',
	schedule   : 'On Mon,Tue,Wed,Thu,Fri at 06:15',
	depends    : ['putnamBOD'],
	failPolicy : 'enable' //or 'disable'
  },

  putnamLOC : {
	command    : '/home/prod/process/strat/putnam/bin/putnamGetLocatesProcess.py >> /home/prod/log/cron.putnamGetLocates.log 2>&1',
	node       : 'prod01',
	schedule   : 'On Mon,Tue,Wed,Thu,Fri at 08:00',
	depends    : ['putnamBOD'],
	failPolicy : 'enable' //or 'disable'
  },

  putnamEOD : {
	command    : '/home/prod/process/strat/putnam/bin/putnamEndOfDayProcess.py >> /home/prod/log/cron.putnamEndOfDay.log 2>&1',
	node       : 'prod01',
	schedule   : 'On Mon,Tue,Wed,Thu,Fri at 18:00',
	depends    : ['putnamBOD'],
	failPolicy : 'enable' //or 'disable'
  },

  inRushCQEOD : {
	command    : '/home/prod/process/strat/putnam/bin/inRushCQEndOfDayProcess.py >> /home/prod/log/cron.inRushCQEndOfDay.log 2>&1',
	node       : 'prod01',
	schedule   : 'On Mon,Tue,Wed,Thu,Fri at 18:00',
	depends    : ['inRushCQBOD'],
	failPolicy : 'enable' //or 'disable'
  },
 }
}
