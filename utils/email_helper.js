var Config  = require('../config/config');
var MessageCode = require('../config/message_code');
var Crypto = require('crypto');
var mandrill = require('mandrill-api/mandrill');

var Utils = {
    send_email_by_mandrill:function(from, to  , title, content, text, attachment){

        mandrill_client = new mandrill.Mandrill(Config.mandrill_api_key);
        var message = {
            "html": content,
            "text": text,
            "subject": title,
            "from_email": from,
            "from_name": 'The Vault App',
            "to": to,
            "headers": {
                "Reply-To": "support@thevaultapp.com",
                "Content-Type": "text/html; charset=UTF-8"
            },
            "important": false,
            "track_opens": null,
            "track_clicks": null,
            "auto_text": null,
            "auto_html": null,
            "inline_css": null,
            "url_strip_qs": null,
            "preserve_recipients": null,
            "view_content_link": null,
            "bcc_address": from,
            "tracking_domain": null,
            "signing_domain": null,
            "return_path_domain": null,
            "merge": true,
            "merge_language": "mailchimp",
            "global_merge_vars": [],
            "merge_vars": [],
            "tags": [
                "password-resets"
            ],
            "google_analytics_domains": [
                "thevaultapp.com"
            ],
            "google_analytics_campaign": "support@thevaultapp.com",
            "metadata": {
                "website": "www.thevaultapp.com"
            },
            "recipient_metadata": [],
            "attachments": [],
            "images": []
        };
        var async = false;
        var ip_pool = "Main Pool";
       // var send_at = "2018-01-01 12:00:00";
       // mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
        mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
            console.log(result);
            /*
            [{
                    "email": "recipient.email@example.com",
                    "status": "sent",
                    "reject_reason": "hard-bounce",
                    "_id": "abc123abc123abc123abc123abc123"
                }]
            */
        }, function(e) {
            // Mandrill returns the error as an object with name and message keys
            console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
            // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
        });   
        /*            "attachments": [{
                    "type": "text/plain",
                    "name": "myfile.txt",
                    "content": "ZXhhbXBsZSBmaWxl"
                }],
            "images": [{
                    "type": "image/png",
                    "name": "IMAGECID",
                    "content": "ZXhhbXBsZSBmaWxl"
                }]
                */     
    }
}

module.exports = Utils;