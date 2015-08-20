(function(){
    angular.module('aD3', [])
    .factory('aD3.utils', [function(){

    }])
    .directive('ad3', [function(scope, elm){
        return {
            restrict : 'EA',
            scope : {
                ad3Dataset : '=',
                ad3Options : '@'
            },
            link : function(scope, elm, attrs){
                var dataset = scope.ad3Dataset;
                var options = {
                    
                    
                    projection : ['y', 'x']
                };
                options = angular.extend(options, scope.ad3Options);
                
                //D3布局对象，用来转换数据以便适用于将要生成的图表类型
                var d3Layout = d3.layout[options.layout]()
                                .size(options.size);
                var nodes = d3Layout.nodes(options.ad3Dataset); //生成节点数据
                var links = d3Layout.links(nodes);              //生成路径数据
                
                //创建对角线生成器
                var diagonal = d3.svg.diagonal()
                    .projection(function(d){
                        return [d[options.projection[0]], d[options.projection[1]]];
                })
                var svg = d3.select(elem[0])
                    .append('svg')
                    .width(options.size[0])
                    .height(options.size[1])
                    .append('g')
                    .attr('transform', 'translate(40,0)');  //设置padding.left和padding.top
                //绘制路径，即节点之间的连线
                var link = svg.selectAll(elem[0].querySelectorAll('.link'))
                    .data(links)
                    .enter()
                    .append('path')
                    .attr('class', 'd3-link')
                    .attr('d', diagonal);
                //绘制节点
                var node = svg.selectAll(elem[0].querySelectorAll('.link'))
                    .data(nodes)
                    
                
                d3Chart[options.type]();


                scope.$watch('data', function(newData, oldData){

                })

            }
        }





    }])
    var d3Chart = {};
    d3Chart.layout = {
        bundle : {},
        chord : {},
        cluster : {},
        force : {},
        tree : {},
    };
    d3Chart.layout.tree.create = function (){
        tree.children();//修改children字段的名称
    }
    
    function clusterChart(){
        
    }







})()