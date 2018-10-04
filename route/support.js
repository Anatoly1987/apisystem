var express = require('express');
var router = express.Router();
var md5 = require('md5');
var twilio = require('twilio');

var global_area = require('../config/global');  

var Util = require('../utils/utils');
var MessageCode = require('../config/message_code');
var Vaultdbpool = require('../vaultserver/vaultdb');
var Requset_model = require('../vaultserver/request_model');
var Config  = require('../config/config');
var Crypto = require('crypto');

var Chat_msg = require('../models/chats');


var twilio_helper = require('../utils/twilio_helper');

//Middleware for this router
router.use(function origin_set (req,res, next){
   // console.log('Time: ', Date.now(), 'Requests: ', req);
   res.set("Access-Control-Allow-Credentials", true);
   res.set("Access-Control-Allow-Origin", "*");
   res.set("Access-Control-Allow-Methods", "POST, GET");
   res.set("Access-Control-Allow-Headers","Content-Type, Authorization, X-Requested-With, Origin");   
    next();
});

router.use(function authorization (req,res, next){
    // console.log('Time: ', Date.now(), 'Requests: ', req);
    if(!req.headers.authorization){
        res.json({status:'error', code:MessageCode.error, error:"Authorization failed"});
        return;
    }

    var auth_token = req.headers.authorization || '';

    var result = Util.check_authentification(auth_token);

    if(result.status == 'error'){
        res.json(result);
        return;
    }

    res.locals.userdata = result.data;
    next();
});

router.post("/add_message", function(req,res){
    if(!req.body.message){
        res.json({status:'error', code:MessageCode.error, error:'Message Empty'});
        return;
    }

    var msg = req.body.message;

    var cur_datetime =Util.formatDate(Util.getcurrenttime(),"yyyy-MM-dd HH:mm:ss");
    var parts = cur_datetime.split(/\s+/);
    var cdate=parts[0];
    var ctime = parts[1];

    var chat ={
        adminID:'',
        adminName:'',
        adminInfo:'',
        content:msg,    
        time:ctime,
    }

    var customerID = 0;
    var userInfo='';
    var userName='';
    var updated_chat;
	
	// When it is added a message, set read flag to 0.
	var readFlag = 0;
	var lastTime = cur_datetime;
	
    if(res.locals.userdata.optionid == 0 || res.locals.userdata.optionid == 1){
        customerID = res.locals.userdata.identification;
        userInfo = res.locals.userdata.userid;
        userName = res.locals.userdata.username;
        updated_chat={status:MessageCode.support_status.opened, userInfo:userInfo, userName:userName, readFlag:readFlag, lastTime:lastTime};
    }else{
        chat.adminID = res.locals.userdata.identification;
        chat.adminName = res.locals.userdata.username;
        chat.adminInfo = res.locals.userdata.userid;
        if(!req.body.customerID || !req.body.userInfo){
            res.json({status:'error', code:MessageCode.error, error:'CustomerID or userInfo is not set'});
            return;
        }        
        customerID = req.body.customerID;
        userInfo = req.body.userInfo;
        userName = req.body.userName;
        updated_chat={status:MessageCode.support_status.opened, userInfo:userInfo, readFlag:readFlag, lastTime:lastTime};
    }


    Chat_msg.findOneAndUpdate({customerID:customerID},
        updated_chat,{
        upsert:true,
        new:true
    }, function(err, newchat){  //Get the customer chat...
        if(err){
            res.json({status:'error', code:MessageCode.error, error:'DB action failed'});
            return;
        }
        //console.log(newchat);
        var length = newchat.messages.length;
        for(var i=0;i<length; i++){
            var messageitem = newchat.messages[i];
            if(messageitem.date!=cdate) continue;
            messageitem.message.push(chat);
            break;
        }
        if(i==length){
            newchat.messages.push({
                date:cdate, message:[chat]
            })
        }
        if(!chat.adminID || chat.adminID == '')   newchat.created = cur_datetime;
		
		newchat.readFlag = readFlag;
		newchat.lastTime = cur_datetime;
        newchat.save(function (err) {
            if (err){
                res.json({status:'error', code:MessageCode.error, result:"failed to save message to the db"});
                return;
            }
            // saved!
            //Emit the changes this message to the all clients.....
    
            global_area.support_io.to('support'+newchat.customerID).emit('support_new_message',{date:cdate, newchat:chat});
            global_area.support_io.to('support_ticket').emit('support_new_chat',{customerID:newchat.customerID, created:cur_datetime, status:MessageCode.support_status.opened, userInfo:userInfo, userName:userName, readFlag:readFlag, lastTime:lastTime});
            console.log('emit support_new_message :customerID = '+newchat.customerID + ' readFlag=' + newchat.readFlag);
            res.json({status:'ok', code:MessageCode.ok, result:"added message"});
        });

    });
    

});

router.post("/get_message", function(req,res){
    var customerID = 0;
    var adminID=0;
    if(res.locals.userdata.optionid == 0 || res.locals.userdata.optionid == 1){
        customerID = res.locals.userdata.identification;
    }else{
        adminID = res.locals.userdata.identification;
        if(!req.body.customerID){
            res.json({status:'error', code:MessageCode.error, error:'CustomerID is not set'});
            return;
        }    
        customerID = req.body.customerID;    
    }   
	 
    Chat_msg.findOne({customerID:customerID}).exec( function(err, results){
        if( err){
            res.json({status:'error', code:MessageCode.error, erro:err, msg:"Getting data from db failed"});
            return;
        }

        res.json({status:'ok', code:MessageCode.ok, data:results});
    });
});

router.post("/get_tickets", function(req,res){  
    if(res.locals.userdata.optionid!=2){
        res.json({status:'error', code:MessageCode.error, error:'this api is for only admin'});
        return;
    }        
    Chat_msg.find({},{customerID:1, created:1, status:1,userInfo:1, userName:1, readFlag:1, lastTime:1}).exec( function(err, results){
        if( err){
            res.json({status:'error', code:MessageCode.error, erro:err, msg:"Getting data from db failed"});
            return;
        }

        res.json({status:'ok', code:MessageCode.ok, data:results});
    });
});

router.post("/update_ticket_status", function(req,res){  
    if(!req.body.customerID || typeof req.body.status == undefined){
        res.json({status:'error', code:MessageCode.error, error:'Parameter is missing'});
        return;
    }     
    
    var customerID = req.body.customerID;
    var status = req.body.status;
    Chat_msg.findOneAndUpdate({customerID:customerID},
        {status:status}).exec( function(err, results){
        if( err){
            res.json({status:'error', code:MessageCode.error, erro:err, msg:"Update data in ticket update db failed"});
            return;
        }

        res.json({status:'ok', code:MessageCode.ok, data:results});
    });
});

router.post("/update_read_status", function(req,res){  
    if(!req.body.customerID || typeof req.body.readFlag == undefined){
        res.json({status:'error', code:MessageCode.error, error:'Parameter is missing'});
        return;
    }     
    
    var customerID = req.body.customerID;
	var readFlag = req.body.readFlag;
	Chat_msg.findOneAndUpdate({customerID:customerID},
        {readFlag:readFlag}).exec( function(err, results){
        if( err){
            res.json({status:'error', code:MessageCode.error, erro:err, msg:"Update data in ticket update db failed"});
            return;
        }
    });
});

router.all("/", function(req,res){
   // res.header("Access-Control-Allow-Origin", "http://localhost:8100");
     res.json({status:'error', error:'The checkout has to be post method', code:MessageCode.error, res:res.locals.userdata});
});
  
router.all('/emit/:reqid/:status' ,function(req, res){
    if(!req.params.reqid){
        res.json({status:'error', error:'Request id is required', code:MessageCode.error});
        return;
    } 
    if(!req.params.status){
        res.json({status:'error', error:'Status is required', code:MessageCode.error});
        return;
    }     

    var reqid = req.params.reqid;
    reqid = reqid.replace(/[^0-9a-zA-Z]/gi, "");

    var status = req.params.status;
    status = status.replace(/[^0-9]/gi, "");    

    var statuses = ['Pending', 'Approved', 'Denied', 'Time out', 'Failed'];
    var result_status = (+status >4)?"Wrong Action":statuses[status];
    global_area.checkout_io.to('request'+reqid).emit('request_status_updated',{id:reqid, status:result_status});

     res.json({status:'ok',result:reqid});
});


module.exports = router;