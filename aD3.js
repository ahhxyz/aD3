(function(){
    angular.module('aD3', [])
    .factory('aD3Utils', [function(){
        return {
            nestable : function(data, pid, option){
                if(typeof pid == 'undefined') pid = 0;
                var opt =  { 'idField' : 'id', 'parentField' : 'pid', 'childField' : 'children'};
                angular.extend(opt, option)
                var tree = [];
                var self = this;
                angular.forEach(data, function(v, k) {
                    //console.log(v, v[opt['parentField']] , pid, v[opt['parentField']] == pid)
                    if(v[opt['parentField']] == pid) {
                        var tmp = data[k];
                        //unset(data[k]);
                        var children = [];
                        children = self.nestable(data, v[opt['idField']], opt);
                        if(children) tmp[opt['childField']] = children;
                        tree.push(tmp);     

                    }
                })
                return tree;
            }
        }
    }])
    .directive('ad3Chart', ['aD3Utils', function(aD3Utils){
        return {
            restrict : 'EA',
            replace: true,
            template: '<div class="d3Chart"></div>',
            scope : {
                ad3Data : '=',
                ad3Options : '='
            },
            link : function(scope, elem, attrs){
                var dataset = scope.ad3Data;
                var options = {
                    width : 600, 
                    height : 800,
                    padding : {left: 80, right:50, top: 20, bottom: 20 },
                    projection : ['y', 'x'],
                    fields : ['id', 'name', 'children', 'parent', 'pid']
                };
                options = angular.extend(options, scope.ad3Options);
                D3.root = dataset;
                //D3.elem = elem[0];
                //D3布局对象，用来转换数据以便适用于将要生成的图表类型
                D3.layoutObj = d3.layout[options.layout]().size([options.width, options.height]);
                D3.svg = d3.select(elem[0])
                    .append('svg')
                    .attr('width', options.width)
                    .attr('height', options.height)
                    .append('g')
                    .attr('transform', "translate("+ options.padding.left + "," + options.padding.top + ")");  //设置padding.left和padding.top
                //创建对角线生成器
                D3.diagonal = d3.svg.diagonal()
                    .projection(function(d){
                        return [d[options.projection[0]], d[options.projection[1]]];
                })
                
                
                
                    
                
                //D3[options.type]();


                scope.$watch('ad3Data', function(data){
                    if(!data.length) return;
                    var _data = angular.copy(data);
                    angular.forEach(_data, function(v, k) {
                        angular.forEach(v, function(val, key){
                            if(options.fields.indexOf(key) == -1){
                                delete v[key];
                            }
                        })
                        _data[k] = v;
                    })  
                    var root = {
                        x0 : options.height / 2,
                        y0 : 0,
                        children : []
                    }
                    root.children = aD3Utils.nestable(_data);
                    D3.root = root;
                    D3.layout.tree.draw(root);
                })
                
                

            }
        }





    }])
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