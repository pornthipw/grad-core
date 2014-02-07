
//IMPORTS
var async = require('async');

HrTimer = {

    time: function(task) {
        var t1 = t2 = '';

        async.series([
            function(callback){
              var  t1 = process.hrtime();
              task();
              return process.hrtime(t1);
              //callback();
            },
            task,
            function(callback){
                t2 = process.hrtime();
                callback();
            }
        ]);


        var t1 = t1[0].toString() + '.' + t1[1].toString();
        var t2 = t2[0].toString() + '.' + t2[1].toString();


        var dif = parseFloat(t2)-parseFloat(t1);

        if(dif < 0){

            debugger;
            console.log(t1);
            console.log(t2);
        }

        return dif;
    }
};


module.exports = HrTimer;
