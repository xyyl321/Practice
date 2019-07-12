$(function () {

    //左上 收入数据对比
    function income() {
        $.ajax({
            url: config.mon_number,
            success: function (res) {
                if (res.code === 1) {  //为1，数据获取成功
                    let data = res.data;
                    $(".left-math").html(data.t_number),
                        $(".right-money .ratio").html(data.ratio + "%");
                }
            },
            error: function () {
                $(".left-math").html("99999999"),
                    $(".right-money .ratio").html("0.99%")
            }
        })
    }
    income();

    //左中 当前城市的停车时长
    function parkTime() {
        $.ajax({
            url: config.current_ratio,
            success: function (res) {
                if (res.code === 1) {
                    let data = res.data;
                    let newData = setData(data);
                    let myChart = echarts.init(document.getElementById("stop-length"));
                    let option = {
                        series: [
                            {
                                type: 'pie',
                                radius: ["50%", "75%"],
                                color: ['#fbff86', '#ff6f6f', '#ab6eff', '#1dd7ff', '#7dff89'],
                                data: newData
                            }
                        ],
                        tooltip: {
                            show: true,
                            trigger: 'item',
                            formatter: "时长：{b}<br>总计：{c}<br>占比：{d}%"
                        }
                    }
                    myChart.setOption(option);
                }
            }
        })
        function setData(data) {
            let arr = [];
            data.forEach((v) => {
                let obj = {};
                obj.name = v.name;
                obj.value = v.total;
                obj.ratio = v.ratio;
                arr.push(obj)
            });
            return arr;
        }
    }
    parkTime();

    //右上 获取城市的停车信息 总车位 占有车位利用率
    function parkSpace() {
        $.ajax({
            url: config.stop_info,
            success: function (res) {
                if (res.code === 1) {
                    $("#seat1").text(res.data.total_seat);
                    $("#seat2").text(res.data.occupy_seat);
                    $("#seat3").text(res.data.ratio + "%");
                }
            }
        })
    }
    parkSpace();

    //右中 城市的收费排行
    //不需要拿数据，因为数据为空。
    function charges() {
        let myChart1 = echarts.init(document.querySelector("#charge1"));
        let myChart2 = echarts.init(document.querySelector("#charge2"));
        let option1 = {
            series: [
                {
                    type: 'pie',
                    name: '缴费类型',
                    radius: ['40%', '60%'],
                    avoidLabelOverlap: false,
                    center: ["50%", "40%"],
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: true,
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    color: ['#fffbbe', '#ffbd3d'],
                    data: [
                        {
                            name: '现金缴费',
                            value: 35,
                            selected: true
                        },
                        {
                            name: '电子缴费',
                            value: 310,
                        }
                    ]
                }
            ],
            tooltip: {
                trigger: 'item',
                formatter: "{a}<br>{b}:{c}({d}%)"
            },
            legend: {
                bottom: 30,
                itemWidth: 5,
                textStyle: {
                    color: '#839bb0'
                }
            }
        };
        let option2 = {
            series: [
                {
                    type: 'pie',
                    name: '缴费情况',
                    radius: ['40%', '60%'],
                    avoidLabelOverlap: false,
                    center: ["50%", "40%"],
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: true,
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    color: ['#b8e3ff', '#009cff'],
                    data: [
                        {
                            name: '提前缴费',
                            value: 120,
                            selected: true
                        },
                        {
                            name: '出口缴费',
                            value: 310,
                        }
                    ]
                }
            ],
            tooltip: {
                trigger: 'item',
                formatter: "{a}<br>{b}:{c}({d}%)"
            },
            legend: {
                bottom: 30,
                itemWidth: 5,
                textStyle: {
                    color: '#839bb0'
                }
            }
        };
        myChart1.setOption(option1);
        myChart2.setOption(option2);
    }
    charges();

    // function map(){
    //     $.ajax({
    //         url:config.all_city_stop,
    //         success:function(res){
    //             if(res.code===1){
    //                 let newData=getData(res.data);

    //                 let myChart=echarts.init(document.querySelector("#map"));
    //                 let option={
    //                     geo:{
    //                         map:'china',
    //                         zoom:5,
    //                         layoutCenter:['50%','50%'],
    //                         layoutSize:100,
    //                         itemStyle:{
    //                             normal:{
    //                                 areaColor:'#19417c',
    //                                 borderColor:'#111'
    //                             },
    //                             emphasis:{
    //                                 areaColor:'#52a8eb'
    //                             } 
    //                         }
    // data: newData,
    //                     },
    //                     series:[
    //                         {
    //                             type:'scatter',
    //                             coordinateSystem:'geo',
    //                             
    //                             symbolSize:10
    //                         }
    //                     ]

    //                 }
    //                 myChart.setOption(option);

    //             }
    //         }
    //     })

    //     function getData(data){
    //         let arr=[];
    //         data.forEach((v)=>{
    //             let obj={};
    //             obj.name=v.name;
    //             obj.position=[v.baidumap_longitude,v.baidumap_longitude],
    //             obj.value=v.value;
    //             arr.push(obj);
    //         })
    //         return arr;
    //     }

    // }
    // map();

    // 中间地图部分
    let map = echarts.init(document.querySelector('.map'));
    let mapName = 'china'
    let data = []
    let geoCoordMap = {};
    let toolTipData = [];

    /*获取地图数据*/
    map.showLoading();
    var mapFeatures = echarts.getMap(mapName).geoJson.features;
    map.hideLoading();
    mapFeatures.forEach(function (v) {
        // 地区名称
        var name = v.properties.name;
        // 地区经纬度
        geoCoordMap[name] = v.properties.cp;
        data.push({
            name: name,
            value: Math.round(Math.random() * 100 + 10)
        })
        toolTipData.push({
            name: name,
            value: [{
                name: "车型一",
                value: Math.round(Math.random() * 100 + 10) + '辆'
            },
            {
                name: "车型二",
                value: Math.round(Math.random() * 100 + 10) + '辆'
            }
            ]
        })
    });
    let max = 480,
        min = 9;
    let maxSize4Pin = 50,
        minSize4Pin = 20;

    let convertData = function (data) {
        var res = [];
        for (var i = 0; i < data.length; i++) {
            var geoCoord = geoCoordMap[data[i].name];
            if (geoCoord) {
                res.push({
                    name: data[i].name,
                    value: geoCoord.concat(data[i].value),
                });
            }
        }
        return res;
    };
    option = {
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                if (typeof (params.value)[2] == "undefined") {
                    var toolTiphtml = ''
                    for (var i = 0; i < toolTipData.length; i++) {
                        if (params.name == toolTipData[i].name) {
                            toolTiphtml += toolTipData[i].name + ':<br>'
                            for (var j = 0; j < toolTipData[i].value.length; j++) {
                                toolTiphtml += toolTipData[i].value[j].name + ':' + toolTipData[i].value[j].value + "<br>"
                            }
                        }
                    }
                    console.log(toolTiphtml)
                    // console.log(convertData(data))
                    return toolTiphtml;
                } else {
                    var toolTiphtml = ''
                    for (var i = 0; i < toolTipData.length; i++) {
                        if (params.name == toolTipData[i].name) {
                            toolTiphtml += toolTipData[i].name + ':<br>'
                            for (var j = 0; j < toolTipData[i].value.length; j++) {
                                toolTiphtml += toolTipData[i].value[j].name + ':' + toolTipData[i].value[j].value + "<br>"
                            }
                        }
                    }
                    console.log(toolTiphtml)
                    // console.log(convertData(data))
                    return toolTiphtml;
                }
            }
        },
        legend: {
            orient: 'vertical',
            y: 'bottom',
            x: 'right',
            data: ['credit_pm2.5'],
            textStyle: {
                color: '#fff'
            }
        },
        visualMap: {
            show: false,
            min: 0,
            max: 600,
            left: 'left',
            top: 'bottom',
            text: ['高', '低'], // 文本，默认为数值文本
            calculable: true,
            seriesIndex: [1],
            inRange: {
                color: '#19417c',
            }
        },
        /*工具按钮组*/
        toolbox: {
            show: false,
            orient: 'vertical',
            left: 'right',
            top: 'center',
            feature: {
                dataView: {
                    readOnly: false
                },
                restore: {},
                saveAsImage: {}
            }
        },
        geo: {
            type: 'map',
            map: 'china',
            zoom: 5,
            layoutCenter: ['50%', '50%'],
            layoutSize: 100,
            roam: true,
            itemStyle: {
                normal: {
                    areaColor: '#19417c',
                    borderColor: '#111'
                },
                emphasis: {
                    areaColor: '#52abe6',
                }
            }
        },
        series: [{
            name: '散点',
            type: 'scatter',
            coordinateSystem: 'geo',
            data: convertData(data),
            symbolSize: function (val) {
                return val[2] / 10;
            },
            label: {
                normal: {
                    formatter: '{b}',
                    position: 'right',
                    show: false
                },
                emphasis: {
                    show: false
                }
            },
            itemStyle: {
                normal: {
                    color: '#C3414B'
                }
            }
        },
        {
            type: 'map',
            map: mapName,
            geoIndex: 0,
            aspectScale: 0.75, //长宽比
            showLegendSymbol: false, // 存在legend时显示
            label: {
                normal: {
                    show: true
                },
                emphasis: {
                    show: false,
                    textStyle: {
                        color: '#fff'
                    }
                }
            },
            roam: true,
            itemStyle: {
                normal: {
                    areaColor: '#19417c',
                    borderColor: '#111'
                },
                emphasis: {
                    areaColor: '#52abe6',
                }
            },
            animation: false,
            data: data
        },
        {
            name: '点',
            type: 'scatter',
            coordinateSystem: 'geo',
            symbol: 'pin', //气泡
            symbolSize: function (val) {
                var a = (maxSize4Pin - minSize4Pin) / (max - min);
                var b = minSize4Pin - a * min;
                b = maxSize4Pin - a * max;
                return a * val[2] + b;
            },
            label: {

                normal: {
                    show: false,
                    formatter: function (params) { return params.data.value[2] },
                    textStyle: {
                        color: '#fff',
                        fontSize: 9,
                    }
                }
            },
            itemStyle: {

                normal: {
                    color: 'rgba(255,255,0,0)',
                }
            },
            zlevel: 6,
            data: convertData(data),
        },
        {
            name: 'Top 5',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: convertData(data.sort(function (a, b) {
                return b.value - a.value;
            }).slice(0, 5)),
            symbolSize: function (val) {
                return val[2] / 10;
            },
            showEffectOn: 'render',
            rippleEffect: {
                brushType: 'stroke'
            },
            hoverAnimation: true,
            label: {
                normal: {
                    formatter: '{b}',
                    position: 'right',
                    show: true
                }
            },
            itemStyle: {
                normal: {
                    color: '#4AFFD2',
                    shadowBlur: 10,
                    areaColor: '#52abe6',
                }
            },
            zlevel: 1
        }
        ]
    };
    map.setOption(option)

})