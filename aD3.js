angular.module('aD3', [])
.directive('ad3', [function(scope, elm){
    return {
        restrict : 'EA',
        scope : {
            data : '=',
        },
        link : function(scope, elm, attrs){
            
            scope.$watch('data', function(data){
                
            })
            
        }
    }
                        
                        
                        
                        
                        
}])
.factory('aD3')