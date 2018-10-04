var express = require('express');
var router = express.Router();
var md5 = require('md5');
var twilio = require('twilio');

var global_area = require('../config/global');  

var Util = require('../utils/utils');
var MessageCode = require('../config/message_code');
var Vaultdbpool = require('../vaultserver/vaultdb');
var Requset_model = require('../vaultserver/request_model');//sql_select_business_by_api_key
var Business_model = require('../vaultserver/business_model');
var Config  = require('../config/config');
var email_helper = require('../utils/email_helper');
var fs = require('fs');
var path = require('path');   

var Reserved_email = require('../models/reserved_email');

var twilio_helper = require('../utils/twilio_helper');

//For the business api model
var BusinessApi_model = require('../models/apikey');


//Middleware for this router
router.use(function timeLog (req,res, next){
   // console.log('Time: ', Date.now(), 'Requests: ', req);
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


router.all("/send_email_reserved", function(req,res){

    if(!req.body.from || !req.body.to || !req.body.title || !req.body.content){
        res.json({status:'error', error:'Parameter is missed.', code:MessageCode.error});
        return;
    }

    if(!Array.isArray(req.body.to)){
        req.body.to = [req.body.to];
    }
    var data =req.body;
    var len = data.to.length;
    var temp = [];
    for(var i=0; i<len ;i++){
        temp.push({
            "email": data.to[i],
            "name":  data.to[i],
            "type": "to"           
        });
    }
    data.to = temp;

    var to_send = [];

    var current_time = Util.getcurrenttime();
    current_time.setDate(current_time.getDate()+ 1);
    to_send.push(Util.formatDate(current_time,"yyyy-MM-dd HH:mm:ss"));
    current_time.setDate(current_time.getDate()+2);
    to_send.push(Util.formatDate(current_time,"yyyy-MM-dd HH:mm:ss"));
    current_time.setDate(current_time.getDate()+4);
    to_send.push(Util.formatDate(current_time,"yyyy-MM-dd HH:mm:ss"));

    data.to_send = to_send;
    

    var reserved_email = new Reserved_email(data);
    reserved_email.save();
    res.json({status:'ok', result:'Send email reserved', code:MessageCode.ok});
    return;    
 /*   
    var filePath = path.join(__dirname, '../public/templates/email/admin_compliance_check_not_complete_client.content');

    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
        if (!err) {
            console.log('received data: ' + data);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            res.end();
            email_helper.send_email_by_mandrill('info@thevaultapp.com', '','Tet', data, '', null);
        } else {
            console.log(err);
            res.json({
                status:MessageCode.error, error:err, message:'Reading template error'
            });
            return;
        }
    });*/
});

router.post("/", function(req,res){
 
});

module.exports = router;
