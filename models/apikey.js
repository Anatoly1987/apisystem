var mongoose = require("mongoose");

var apikey_schema = mongoose.Schema({
    businessid:Number,
    clientid:String,
    businessname:String,
    api_sec_key:String,
    apikeys:[mongoose.SchemaTypes.Mixed]  
     /*
        storeid:Number,
        storename:String,
        sites[
            {
                apikey:String,
                sitename:String,
                created:String,
                status:Number,
                history:[],
                
            }
        ]
    */    
});

var apikey = mongoose.model('apikey', apikey_schema);

module.exports  = apikey;