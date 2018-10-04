var MessageCode={
    ok:1,
    error:0,
    support_status:{
        opened:1,
        closed:0
    },
    user_types:{
        customer:0,
        employee:1,
        admin:2
    },

    //Success
    success:1,
    fail:0,
    codes:{
        bad_req:{
            code:400,
            msg:"Bad Request"
        },
        success:{
            code:200,
            msg:"Success"
        }
    }
}

module.exports=MessageCode;