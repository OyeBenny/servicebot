let consume = require("pluginbot/effects/consume");
let {call} = require("redux-saga/effects");
let PluginOption = require("../../models/services/pluginOption");
let run = function*(config, provide, services){
  let database = yield consume(services.database);
  //todo: move this to some installation script when it's more fleshed out
    let createDB = function(database){
      return database.schema.hasTable('stripe_event_logs').hasTable('stripe').then(function(exists){
            if(exists.every(e => !e)){
                return database.schema.createTable('stripe_event_logs', function(table){
                    table.inherits('event_logs');
                    table.string('event_id');
                    console.log("Created 'stripe_event_logs' table.");
                });
            }else{
                return false;
            }
        })
    };

    let routeDefinition = [
        require("./api/webhook")(database),
        ...require("./api/reconfigure")(database),
        require("./api/import")(database),
        {
            "endpoint" : "/hello/world",
            "method" : "get",
            "permissions" : [],
            "description" : "ello",
            "middleware" : [function(req,res){
                console.log("HELLO WORLD!");
                res.json({hello : "world"});
            }]
        }
    ];



    yield call(createDB, database);
    let pluginOption = new PluginOption(
        function(){
            return "YEAH I'M HERE";
        },
        null,
        "testoption",
        "payment",
        "text",
        true

    );
    yield provide({routeDefinition, pluginOption});
};

module.exports = {run};