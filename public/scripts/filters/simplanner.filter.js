angular.module('SimPlannerApp')
    .filter('simplanner', function ($filter, sharedService) {
        return function(input, type, format) {
            if(input === undefined || input === null){
                return '';
            }
            
            type = type.toLowerCase();
            
            if(type === 'digits'){
                return input.toFixed(format);
            }
            
            if(type === 'date'){
                return $filter('date')(new Date(input), format);;
            }
            
            if(type === 'weekday'){
                return new Date(input).toLocaleDateString(format, { weekday: 'long' });
            }
            
            if(type === 'weeknr'){
                return sharedService.getWeek(new Date(input));
            }

            return input;
        };
    });