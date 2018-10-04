var SqlString = require('sqlstring');
var Business_model={
    sql_select_business_by_api_key:function(apikey){
      return  "select bs.*, ba.sitename, ba.apikey as siteapikey from (select * from business_api where apikey='%apikey') ba join business bs on ba.businessid=bs.id".replace("%apikey",apikey);
    }  
}

module.exports=Business_model;