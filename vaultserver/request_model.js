var Request_model={
    sql_get_number_of_pending_requests:"select count(*) as total from requests req where req.phone='%phone' and req.status=0  and req.created>subdate('%current_time',interval 2 hour)",
    sql_insert_request:"INSERT INTO requests SET ?",
    sql_select_request_by_unique_id:function(reqid){
      return  "select * from requests where request_uniq_id='%reqid'".replace("%reqid",reqid);
    }
}

module.exports=Request_model;