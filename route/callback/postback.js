var express = require('express');
var router = express.Router();
var md5 = require('md5');

//Config
var Config  = require('../../config/config');

//Global Area
var global_area = require('../../config/global');  

var Util = require('../../utils/utils');
var MessageCode = require('../../config/message_code');

//Utils
var https= require('https');
var http = require('http');
var querystring = require('querystring');
var url = require('url');

//Middleware for this router
router.use(function postback (req,res, next){
   // console.log('Time: ', Date.now(), 'Requests: ', req);
    next();
});

//Adding the card from the vault app server ....
router.post('/client', function(req, res){

  try{
    var callback_url = req.body.callback_url;
    var transactionid = req.body.transactionid;
    var amount = req.body.gross_amount;
    var status = req.body.status;
  
    var callback = url.parse(callback_url);
    
    //Define user agent for your node
    var api_agent = 'TheVaultApp Api';
    //Post data
    var text = {};
    text.success = true;
    text.data = {};
    text.data.site_name = 'example.com';
    
    //Actul data sent, which needs to be decoded on serve side
    var out_text = querystring.escape(JSON.stringify(output));
    
    var secure = false;
    
    if (callback.protocol === 'https:') {
      secure = true;
    }
  
     // console.log("card xml data", postData);
     var options = {
      host: callback.hostname,
      port: callback.port,
      path: callback.path + "?tid=" + transactionid + "&amount=" + amount + "&status=" + status,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
       // 'Content-Length': out_text.length,
        'User-Agent': api_agent,
        'Referer': callback.protocol + '//' + callback.hostname
      }
    };
    var protocol = http;
    if (secure) {
      options.rejectUnauthorized = false;
      protocol = https;
    }
      
        const request = protocol.request(options, (response) => {
         // console.log('statusCode:', response.statusCode);
         // console.log('headers:', response.headers);
          var data = "";
          response.on('data', (d) => {
            data+=d;
          });
          response.on('end', () => {
             // console.log('No more data in response.');
             // console.log("data pci", data);
  
          });        
        });
        
       // request.write(out_text);
        
        request.on('error', (e) => {
          console.error(e);
        });
  
        request.end(); 
        
        //return to the server
        res.json({
          status:MessageCode.success,        
          msg:MessageCode.codes.success.msg
        });  
  }catch(ex){
    console.log(ex);
    res.sendStatus(MessageCode.codes.bad_req.code).json({
      msg:ex
    })
  }
 
});

module.exports = router;