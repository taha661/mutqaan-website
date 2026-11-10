const L=require('../lib/server.js');
module.exports=L.wrap(async(req,res)=>L.send(res,200,{ok:true,service:'mutqaan',store:L.hasStore(),ai:!!(L.env('ANTHROPIC_API_KEY')&&+L.env('AI_DAILY_LIMIT')>0)}),['GET']);
