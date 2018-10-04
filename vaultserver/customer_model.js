var SqlString = require('sqlstring');
var Customer_model={
    sql_select_profile_logo:function(customerid){
      return  "select * from profile where customerid='%customerid'".replace("%customerid",customerid);
    },
    sql_update_customer:function(fields, values){
      var where  = " where id= 0";
      if(!Array.isArray(fields) || !Array.isArray(values) || fields.length != values.length){
        return "select 1";
      }

      var idindex =fields.indexOf("id");
      if( idindex == -1){
        return "select  1";
      }else{
        where =  " where status=4 and id = "+values[idindex]; //4 is 24 hour pause
      }
      var keys=["phone","tip","status","firstname", "lastname", "email", "fcmid", "logo", "setdetail" , "created", "paid_amount"];


      var length = fields.length;
      var query  = "";
      for(var i=0; i<length; i++){
        if(keys.indexOf(fields[i]) != -1){
          query = query + fields[i] +"=" + SqlString.escape(values[i])+",";
        }
      }

      if(query.length>0) query = query.substr(0, query.length-1);
      return  "update customers set " + query + where;
    }    
}

module.exports=Customer_model;