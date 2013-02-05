$run(function(){
    eval($global.all);

    var $log = function(){};
    $log.info = function(){};
    $log.warn = function(){};
    $log.debug = function(){};
    $log.error = function(){};

    if(typeof console != "undefined"){
        if(typeof console.log == "function"){
            $log = function(msg){
                console.log(msg);
            };
        }

        var types = ["info","warn","error","debug"];
        var l = types.length;
        while(l--){
            var t = types[l-1];
            if(typeof console[t] == "function"){
                $log[t] = (function(type){
                    return function(msg){
                        console[type](msg);
                    };
                })(t);
            }
        }
    }

    $global("$log", $log);
});
