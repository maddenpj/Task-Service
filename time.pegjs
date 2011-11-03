start = (c:command _* {return c})+ 


command = (Every / Between / At / On / In / Date) 

On = 'on' _+ arg1:(d:day [ ,\/]* {return d})+ {return {on : arg1} }

Every = 'every' _+ arg1:number _+ arg2:interval { return {every : [arg1,arg2]}}

Between = 'between' _+ arg1:time _+ 'and' _+ arg2:time {return {between : [arg1, arg2] }}

At = 'at' _+ arg:time {return {at: arg}}

In = 'in' _+ arg1:(d:month [ ,\/]* {return d})+ {return {in :arg1} }

Date = 'date' _+ arg1:date {return { date: arg1}}


interval = 'seconds' / 'hours' / 'minutes' / 'second' / 'hour' / 'minute'
time = t:([0-2][0-9]':'[0-5][0-9]) {return t.join('') }
word = w:[a-zA-Z]+ { return w.join('') }
number = digits:[0-9]+ {return parseInt(digits.join(''),10); }
date = w:([2][0][1][1-9][0-1][0-9][0-3][0-9]) {return w.join('') }


day 
    = Monday / Tuesday / Wednesday / Thursday / Friday / Saturday / Sunday

month 
    = January / February / March / April / May / June / July / August / September / October / November / December 

January    = ( 'january' / 'jan' ) { return 1; } 
February   = ( 'february' / 'feb' ) { return 2; } 
March      = ( 'march' / 'mar' ) { return 3; } 
April      = ( 'april' / 'apr' ) { return 4; } 
May        = ( 'may' ) { return 5; } 
June       = ( 'june' / 'jun' ) { return 6; } 
July       = ( 'july' / 'jul' ) { return 7; } 
August     = ( 'august' / 'aug' ) { return 8; } 
September  = ( 'september' / 'sep' ) { return 9; } 
October    = ( 'october' / 'oct' ) { return 10; } 
November   = ( 'november' / 'nov' ) { return 11; } 
December   = ( 'december' / 'dev' ) { return 12; } 

Monday     = ('monday' / 'mon') { return 1; }
Tuesday    = ('tuesday' / 'tue' ) { return 2; }
Wednesday  = ('wednesday' / 'wed') { return 3; }
Thursday   = ('thursday' / 'thu' ) { return 4; }
Friday     = ('friday' / 'fri') { return 5; }
Saturday   = ('saturday' / 'sat' ) { return 6; }
Sunday     = ('sunday' / 'sun' ) { return 7; }

_ = [ \t\n\r]
