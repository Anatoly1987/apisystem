var mongoose = require("mongoose");

var apikey_schema = mongoose.Schema({
    from:String,
    to:[mongoose.Schema.Types.Mixed],  /*
        {
            "email": "recipient.email@example.com",
            "name": "Recipient Name",
            "type": "to"
        }
     */
    title:String,
    content:String,
    to_send:[String]
     /*
        storeid:Number,
        storename:String,
        sites[
            {
                apikey:String,
                sitename:String,
                created:String,
                status:Number
            }
        ]
    */    
});

var apikey = mongoose.model('reserved_email', apikey_schema);

module.exports  = apikey;