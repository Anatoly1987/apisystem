var Config  = require('../config/config');
var MessageCode = require('../config/message_code');
var Crypto = require('crypto');
var Util = require('../utils/utils');
var Reserved_email = require('../models/reserved_email');
var Email_helper = require('../utils/email_helper');

var Timing_functions = {
    send_email_reserved:function(){
        var now  = Util.formatDate(Util.getcurrenttime(), "yyyy-MM-dd HH:mm:ss");
        //var now = '2018-04-19 12:00:00';
        Reserved_email.find({
            to_send:{$lt:now}
        }, function(err, docs){
            if(err){
                return;
            }
            console.log("to send docs",docs);

            var len = docs.length;
            for(var i=0 ; i<len ; i++){
                var doc = docs[i];
                Email_helper.send_email_by_mandrill(doc.from, doc.to, doc.title, doc.content, doc.title,null);
            }
            


            Reserved_email.update({
                to_send:{$lt:now}
            },{
                $pull:{to_send:{$lt:now}}
            }, function(error, numsAffected){
                if(error) {
                    console.log("remove old data error", error);
                    return;
                }
                console.log(numsAffected+"removed docs in reserved email");
            })
        })
    } 
}

module.exports = Timing_functions;