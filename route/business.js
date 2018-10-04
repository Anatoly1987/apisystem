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

var twilio_helper = require('../utils/twilio_helper');

//Middleware for this router
router.use(function timeLog (req,res, next){
   // console.log('Time: ', Date.now(), 'Requests: ', req);
    next();
});

router.post("/add_api_key", function(req,res){

});

router.all("/test", function(req,res){
    twilio_helper.send_sms('+12402211454','body test')
    .then(function(message){
        console.log(message);
         res.json({status:'ok', sid:message.sid});
    });
   
});

router.get("/", function(req,res){
     res.json({status:'error', error:'The checkout has to be post method', code:MessageCode.error});
});

router.post("/", function(req,res){
    if(!req.body.token){
        res.json({status:'error', error:'Your company has not been activated', code:MessageCode.error});
        return;
    }
    if(!req.body.phone){
        res.json({status:'error', error:'The Phone number is required', code:MessageCode.error});
        return;
    }
    if(!req.body.amount){
        res.json({status:'error', error:'Amount is required', code:MessageCode.error});
        return;
    }

    //Preventing the sql injection
    var api_key = req.body.token+"";
    api_key = api_key.replace(/['"-\(\)]/gi, "");

    var phone = req.body.phone+"";
    phone = phone.replace(/[^0-9\+]/gi, "");

    if(/^\+([0-9]{5,14})$/.test(phone) == false){
        res.json({status:'error', error:'Phone format error', code:MessageCode.error});
        return;        
    }

    var amount = req.body.amount+"";
    amount = amount.replace(/[^0-9\.]/gi, "");
    if(/^([0-9]+)(\.[0-9]{1,2})?$/.test(amount) == false){
        res.json({status:'error', error:'Amount format error', code:MessageCode.error});
        return;        
    }


        Vaultdbpool.getConnection(function(err, Vaultdb) {
            if(err){
                console.log("Error from geting connection from vault db", err);
                res.json({status:'error', error:'Server DB error', code:MessageCode.error, info:err});
                return;            
            }       
            // Use the connection
            var bssql = Business_model.sql_select_business_by_api_key(api_key);
            //'select * from business where api_key=? ', [api_key]
            Vaultdb.query(bssql, function (error, results, fields) {
                if (error) throw error;
            // console.log(results);
                //Error when there is no business for the api key
                if(results.length == 0){
                    res.json({status:'error', error:'Your company has not been activated', code:MessageCode.error});
                    return;
                }
            
                var business = results[0];
                //Check if there are pending requests.
                var sql = Requset_model.sql_get_number_of_pending_requests;
                sql= sql.replace(/%phone/gi, phone);
                sql= sql.replace(/%current_time/gi, Util.formatDate(Util.getcurrenttime('Pacific/Honolulu'),"yyyy-MM-dd HH:mm:ss"));
                Vaultdb.query(sql, function (error, results, fields) {
                    if(error) {
                        res.json({status:'error', error:'Server DB error', code:MessageCode.error, info:error});
                        return;
                    }
                    //check the results if there are pending requests
                    if(results.length == 0 || (+results[0]["total"])>0){
                        res.json({status:'error', error:'The customer must approve or deny their previous request before receiving a new request.', code:MessageCode.error});
                        return;
                    }
        
                    //Adding the new request
                    var current_timestamp = Util.getcurrenttime('Pacific/Honolulu').getTime();
                    var new_req={
                        amount:amount,
                        phone:phone,
                        employeeemail:business.email,
                        businessid:business.id,
                        storeid:0,
                        tax:business.tax,
                        clientfee:business.fee,
                        request_uniq_id:current_timestamp+md5(current_timestamp)
                    } 
        
                    //insert to request
                    sql = Requset_model.sql_insert_request;          
                    Vaultdb.query(sql,new_req, function (error, results, fields) {
                        try{
                            Vaultdb.release();
                        }
                        catch(e){
                            
                        }                        
                        if(error){
                            res.json({status:'error', error:'Server DB error', code:MessageCode.error, info:error});
                            return;
                        }
                        //Sending the twilio sms
                        var sms = business["businessname"]+" sent you a $ request. Open or Download The Vault App here: http://get.thevaultapp.com";
        
                        var twilio_client =new twilio(Config.twilio_config.accountSid, Config.twilio_config.authToken);
                        twilio_client.messages.create({
                            body: sms ,
                            to: phone,  // Text this number
                            from: Config.twilio_config.fromNumber // From a valid Twilio number
                        })
                        .then((message) => console.log(message.sid));
        
                        res.json({status:'ok', result:{requestid:new_req.request_uniq_id,amount:new_req.amount, phone:new_req.phone, employeeemail:new_req.employeeemail,status:'pending'} ,code:MessageCode.ok});
                    });
        
        
                });
                
        
            });
            
        });     
        //Check the api key... token is the api key


    //res.json({status:'error', error:'The checkout has to be post method', code:MessageCode.error});
});

router.post('/query/:reqid', function(req, res){
    if(!req.params.reqid){
        res.json({status:'error', error:'Request id is required', code:MessageCode.error});
        return;
    } 
    if(!req.body.token){
        res.json({status:'error', error:'Your company has not been activated', code:MessageCode.error});
        return;
    }       
    
    var api_key = req.body.token+"";
    api_key = api_key.replace(/['"-\(\)]/gi, "");
    
    var reqid = req.params.reqid+"";
    reqid = reqid.replace(/[^0-9a-zA-Z]/gi, "");

    Vaultdbpool.getConnection(function(err, Vaultdb) {
        if(err){
            console.log("Error from geting connection from vault db", err);
            res.json({status:'error', error:'Server DB error', code:MessageCode.error, info:err});
            return;            
        } 
        //Check the api key... token is the api key
        Vaultdb.query('select * from business where api_key=? ', [api_key], function (error, results, fields) {
            if (error){
                res.json({status:'error', error:'Vauld DB error', code:MessageCode.error, info:error});
                return;               
            };
        // console.log(results);
            //Error when there is no business for the api key
            if(results.length == 0){
                res.json({status:'error', error:'Your company has not been activated', code:MessageCode.error});
                return;
            }
        
            var business = results[0];
            //Check for the request id ....
            var sql = Requset_model.sql_select_request_by_unique_id(reqid);
            Vaultdb.query(sql, function (error, results, fields) {
                try{
                    Vaultdb.release();
                }
                catch(e){
                    
                }                
                if (error){
                    res.json({status:'error', error:'Vauld DB error', code:MessageCode.error, info:error});
                    return;               
                };
                // console.log(results);
                //Error when there is no business for the api key
                if(results.length == 0){
                    res.json({status:'error', error:'Wrong Request ID', code:MessageCode.error});
                    return;
                }
            
                var request = results[0];

            /* if(business.id != request.businessid){
                    res.json({status:'error', error:'This request is not included for this user', code:MessageCode.error});
                    return;                 
                }
                */


                var statuses = ['Pending', 'Approved', 'Denied', 'Time out', 'Payment Failed'];
                //Check if there are pending requests.
                result={
                    request_id:reqid,
                    status:statuses[request["status"]]
                }
                res.json({status:'ok', result:result, code:MessageCode.ok});
            }); 


        });    

    });

   // res.json({status:req.params.reqid});
})
  
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