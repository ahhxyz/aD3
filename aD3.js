(function(){
    angular.module('aD3', [])
    .factory('aD3.utils', [function(){

    }])
    .directive('ad3', [function(scope, elem){
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
                D3.root = dataset;
                //D3.elem = elem[0];
                //D3布局对象，用来转换数据以便适用于将要生成的图表类型
                D3.layoutObj = d3.layout[options.layout]().size(options.size);
                D3.svg = d3.select(elem[0])
                    .append('svg')
                    .width(options.size[0])
                    .height(options.size[1])
                    .append('g')
                    .attr('transform', 'translate(40,0)');  //设置padding.left和padding.top
                //创建对角线生成器
                D3.diagonal = d3.svg.diagonal()
                    .projection(function(d){
                        return [d[options.projection[0]], d[options.projection[1]]];
                })
                dataset.x0 = options.height / 2;
                dataset.y0 =0;
                
                
                D3.layout.tree.draw(elem, dataset, options);
                    
                
                //D3[options.type]();


                scope.$watch('data', function(newData, oldData){

                })
                
                

            }
        }





    }]).factory('ad3Util', function(){
        return {
            deph : 0,
            nestable : function(data, pid, option){
                if(typeof pid == 'undefined') pid = 0;
                var opt =  { 'idField' : 'id', 'parentField' : 'pid', 'childField' : 'children'};
                angular.extend(opt, option)
                var tree = [];
                var self = this;
                angular.forEach(data, function(v, k) {
                    if(v[opt['parentField']] == pid) {
                        tmp = data[k];
                        //unset(data[k]);
                        children = self.nestable(data, v[opt['idField']], opt);
                        if(children) tmp[opt['childField']] = children;
                        tree[v[opt['idField']]] = tmp;     //如果不需要使用Id作为键名，则让php自动分配键名即可，不用手动设置键名
                    }
                })
                return tree;
            }
        }
    })
    var D3 = {};
    D3.layout = {
        bundle : {},
        chord : {},
        cluster : {},
        force : {},
        tree : {},
    };
    
    
        D3.layout.tree.draw = function(source){

          /*
          （1） 计算节点和连线的位置
          */

          //应用布局，计算节点和连线
          var nodes = D3.layoutObj.nodes(D3.root);
          var links = D3.layoutObj.links(nodes);

          //重新计算节点的y坐标
          nodes.forEach(function(d) { d.y = d.depth * 180; });

          /*
          （2） 节点的处理
          */

          //获取节点的update部分
          var nodeUpdate = D3.svg.selectAll(".node")
                              .data(nodes, function(d){ return d.name; });

          //获取节点的enter部分
          var nodeEnter = nodeUpdate.enter();

          //获取节点的exit部分
          var nodeExit = nodeUpdate.exit();

          //1. 节点的 Enter 部分的处理办法
          var enterNodes = nodeEnter.append("g")
                          .attr("class","node")
                          .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                          .on("click", function(d) { D3.layout.tree.toggle(d); D3.layout.tree.draw(d); });

          enterNodes.append("circle")
            .attr("r", 0)
            .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

          enterNodes.append("text")
              .attr("x", function(d) { return d.children || d._children ? -14 : 14; })
              .attr("dy", ".35em")
              .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
              .text(function(d) { return d.name; })
              .style("fill-opacity", 0);


          //2. 节点的 Update 部分的处理办法
          var updateNodes = nodeUpdate.transition()
                              .duration(500)
                              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

          updateNodes.select("circle")
            .attr("r", 8)
            .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

          updateNodes.select("text")
            .style("fill-opacity", 1);

          //3. 节点的 Exit 部分的处理办法
          var exitNodes = nodeExit.transition()
                            .duration(500)
                            .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                            .remove();

          exitNodes.select("circle")
            .attr("r", 0);

          exitNodes.select("text")
            .style("fill-opacity", 0);

          /*
          （3） 连线的处理
          */

          //获取连线的update部分
          var linkUpdate = D3.svg.selectAll(".link")
                              .data(links, function(d){ return d.target.name; });

          //获取连线的enter部分
          var linkEnter = linkUpdate.enter();

          //获取连线的exit部分
          var linkExit = linkUpdate.exit();

          //1. 连线的 Enter 部分的处理办法
          linkEnter.insert("path",".node")
                .attr("class", "link")
                .attr("d", function(d) {
                    var o = {x: source.x0, y: source.y0};
                    return D3.diagonal({source: o, target: o});
                })
                .transition()
                .duration(500)
                .attr("d", D3.diagonal);

          //2. 连线的 Update 部分的处理办法
          linkUpdate.transition()
              .duration(500)
              .attr("d", D3.diagonal);

          //3. 连线的 Exit 部分的处理办法
          linkExit.transition()
                .duration(500)
                .attr("d", function(d) {
                  var o = {x: source.x, y: source.y};
                  return D3.diagonal({source: o, target: o});
                })
                .remove();


          /*
          （4） 将当前的节点坐标保存在变量x0、y0里，以备更新时使用
          */
          nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
          });

        }
    
    //节点展开和收起
    D3.layout.tree.toggle = function  (d){
        if(d.children){ //如果有子节点
            d._children = d.children; //将该子节点保存到 _children
            d.children = null;  //将子节点设置为null
        }else{  //如果没有子节点
            d.children = d._children; //从 _children 取回原来的子节点 
            d._children = null; //将 _children 设置为 null
        }
    }
                
    
        
    







})()