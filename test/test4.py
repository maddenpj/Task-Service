#!/usr/local/bin/python3.2

from datetime import datetime

f = open('/home/patrick/src/NxtNode/apps/taskservice/test/output/test4','a')
f.write( str(datetime.now()) + ' : I ran as a test!\n')

