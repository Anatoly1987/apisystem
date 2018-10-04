var config = {
    mongodb_uri:"mongodb://localhost/apidb",
    vaultdb_config:{
        host: "vaultdb-instance.cyy5y7sz2ajc.us-east-2.rds.amazonaws.com",//"localhost",
        user: "admin",//"vaultuser",
        password: "101rdsadmin201",//"123!@#vault&8(",
        database:"vaultdb"
      },
    twilio_config:{
        accountSid:"AC497bf0118ec84a2a374d423a064de5f1",
        authToken:"020e0418549cc492ab3bfb9e9c78493c",
        fromNumber:"+16195972521"
    },
    jwt_key_gen_code:'sec_key_jwt_generation',
    mandrill_api_key:'gmr6zMGxBMA4Dd7Wzayjmw',
    pci_proxy:{
        merchantID:'1100016179',
        authentification:'Basic MTEwMDAwNzAwNjpLNnFYMXUkIQ==',
        sec_key:'180619095833270562',
        salt:'DdyEYEbe5E5kb3JJjbKpBtKo6xRkJuV4V40ZRIJd0xt6G8NyqB',
        host:'api.sandbox.datatrans.com',
        addcard:'/upp/jsp/XML_AliasGateway.jsp'
    }
}

module.exports = config;