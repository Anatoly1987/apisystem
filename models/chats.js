var mongoose = require("mongoose");

var chats_schema = mongoose.Schema({
    customerID:String,
    userInfo:String,
    userName:String,
	readFlag:Number,
	lastTime:String,
    messages:[{
        date:String,
        message:[{
            adminID:String,
            adminName:String,
            adminInfo:String,
            content:String,    
            time:String,
        }]
    }],
    created:String,
    status:Number
});

var chats = mongoose.model('chats', chats_schema);

module.exports  = chats;