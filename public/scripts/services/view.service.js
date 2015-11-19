angular.module('SimPlannerApp')
    .factory('viewService', function ($localStorage) {
        var service = {};
    
        //  Set a variable in $localstorage.view
        service.setParameters = function(value, variable){
            if($localStorage.view === undefined){
                $localStorage.view = new Object;
            }
            
            $localStorage.view[variable] = value;
            
            return $localStorage.view;
        };
    
        service.getParameters = function(){
            return getParameters();
        };
    
        //  Due to $localstorage converting all datatypes to String, we want to be able to return a Date object.
        service.getParamDate = function(){
            return new Date(getParameters().date);
        };
    
        //  Get all parameters in $localstorage.view. The values are returned as Strings
        function getParameters(){
            if($localStorage.view === undefined){
                $localStorage.view = new Object;
            }
            
            return $localStorage.view;
        };

        return service;
    });