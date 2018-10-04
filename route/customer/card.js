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

//Middleware for this router
router.use(function cardLog (req,res, next){
   // console.log('Time: ', Date.now(), 'Requests: ', req);
    next();
});

//Adding the card from the vault app server ....
router.post('/add', function(req, res){

    var postData=`<?xml version="1.0" encoding="UTF-8"?>
    <aliasCCService version="1">
      <body merchantId="{id}">
        <alias>
           <request>
               <cardno>{cardno}</cardno>
           </request>
        </alias>
        <alias>
           <request>
               <cvv>{cvv}</cvv>
           </request>
        </alias>
      </body>
    </aliasCCService>`;

    postData = postData.replace("{id}", Config.pci_proxy.merchantID).replace("{cardno}", req.body.cardno).replace("{cvv}", req.body.cvv);
   // console.log("card xml data", postData);

    const options = {
        hostname: Config.pci_proxy.host,
        port: 443,
        path: Config.pci_proxy.addcard,
        method: 'POST',
        headers: {
            'Authentication': Config.pci_proxy.authentification,
            'Content-Type': 'text/xml'
           // 'Content-Length': Buffer.byteLength(postData)
        }        
      };
      
      const request = https.request(options, (response) => {
       // console.log('statusCode:', response.statusCode);
       // console.log('headers:', response.headers);
        var data = "";
        response.on('data', (d) => {
          data+=d;
        });
        response.on('end', () => {
           // console.log('No more data in response.');
           // console.log("data pci", data);
           res.setHeader("Content-Type", "text/plain");
           res.send(data);
           res.end();
        });        
      });
      
      request.write(postData);
      
      request.on('error', (e) => {
        console.error(e);
        res.sendStatus(MessageCode.codes.bad_req.code);
        res.send(e);
      });

      request.end();    
});

module.exports = router;