

var ranges = 7; 

function qr_total(echarts){

    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('qr_total'));
    // 指定图表的配置项和数据
    var option = {
        title: { text: '二维码每日的总体交易情况', subtext: '' },
        tooltip: { trigger: 'axis' },
        grid: { left: '5%', right: '10%', bottom: '10%', containLabel: true }, 
        toolbox: { feature: { 
                        saveAsImage: {}, 
                        dataZoom: { yAxisIndex: 'none' }, 
                        dataView: { readOnly: false }, 
                        magicType: { type: ['line', 'bar'] }, 
                        restore: {}, 
                            saveAsImage: {}
                       }, 
                       orient: 'vertical', 
                       top: 'middle', 
                       right: '3%' 
            }, 
            xAxis: { type: 'category', boundaryGap: false, data: [] },
            yAxis: { type: 'value', name: '万笔 / 万元' },
            series: [], 
            dataZoom: [
                { type: 'slider', show: true, 
                  height: '4%', bottom: '5%', 
                   filterMode: 'weakFilter', 
                  handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z', 
                  handleSize: '80%'
                }
            ], 
        };
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    myChart.showLoading(); 
    $.ajax({
        url: '/qr/total', 
        type: 'get', 
        async: true, 
        dataType: 'json', 
        success: function (data) {
            var length = data['date'].length; 
            myChart.hideLoading();
            myChart.setOption({
                xAxis: { data: data['date'] }, 
                legend: { left: 'center', top: '7%', 
                    data:['交易笔数', '优惠笔数', '优惠金额'] 
                },
                series: [
                {   
                    name: '交易笔数', type: 'line', data: data['trans_num'], 
                    // label: { normal: {show: true} }
                    markPoint: { 
                        data: [{
                            name:'昨日交易量', value: Math.round( data['trans_num'][ length - 1 ] ),  
                            coord: [ data['date'][ length - 1], data['trans_num'][ length - 1 ] ]
                        }] 
                    }
                }, 
                {   name: '优惠笔数', type: 'line', data: data['coupon_num'], 
                    // label: { normal: {show: true} }
                    markPoint: { 
                        data: [{ 
                            name: '昨日优惠笔数', value: Math.round( data['coupon_num'][ length - 1 ] ), 
                            coord: [ data['date'][ length-1 ], data['coupon_num'][ length - 1 ] ]
                        }]
                    }
                },
                {   name: '优惠金额', type: 'line', data: data['coupon_at'], 
                    // label: { normal: {show: true} }
                    markPoint: {
                        data: [{ 
                            name: '昨日优惠金额', value: Math.round( data['coupon_at'][ length - 1 ] ), 
                            coord: [ data['date'][ length-1 ], data['coupon_at'][ length - 1 ] ]
                        }]
                    }
                }], 
                dataZoom: [{ startValue: length - ranges, endValue: length }]
            });
            window.addEventListener("resize", function() { myChart.resize(); });
        }, 
        error: function(e) {
            alert("请求数据失败!");
        }
    });
};



function qr_product(echarts) {
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('qr_product'));
    // 指定图表的配置项和数据
    var option = {
        title: { text: '二维码各产品的交易情况', subtext: '' },
        tooltip: { trigger: 'axis'},
        grid: { left: '5%', right: '10%', bottom: '10%', containLabel: true }, 
        toolbox: { feature: { 
                        saveAsImage: {}, 
                        dataZoom: { yAxisIndex: 'none' }, 
                        dataView: { readOnly: false }, 
                        magicType: { type: ['line', 'bar'] }, 
                        restore: {}, 
                        saveAsImage: {}
                   }, 
                   orient: 'vertical', 
                   top: 'middle', 
                   right: '3%' 
        }, 
        xAxis: { type: 'category', boundaryGap: false, data: [] },
        yAxis: { type: 'value', name: '万笔' },
        series: [], 
        dataZoom: [
            { type: 'slider', show: true, 
              height: '4%', bottom: '5%', 
              filterMode: 'weakFilter', 
              handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z', 
              handleSize: '80%'
            }
        ]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    myChart.showLoading(); 
    
    $.ajax({
        url: '/qr/product', 
        type: 'get', 
        async: true, 
        dataType: 'json', 
        success: function (data) {
            var length = data['date'].length; 
            myChart.hideLoading();
            myChart.setOption({
                xAxis: { data: data['date'] }, 
                legend: { left: 'center', top: '7%', 
                    data:['被扫', '主扫', '扫码转账', '远程转账', '快速收款码'] 
                },
                series: [
                    {   name: '被扫', type: 'line', data: data['0135'] , 
                        markPoint: {
                            data: [{ 
                                name: '被扫', value: Math.round( data['0135'][ length - 1 ] ), 
                                coord: [ data['date'][ length-1 ], data['0135'][ length - 1 ] ]
                            }]
                        }
                    }, 
                    {   name: '主扫', type: 'line', data: data['0210'], 
                        markPoint: {
                            data: [{ 
                                name: '主扫', value: Math.round( data['0210'][ length - 1 ] ), 
                                coord: [ data['date'][ length-1 ], data['0210'][ length - 1 ] ]
                            }]
                        }
                    },
                    {   name: '扫码转账', type: 'line', data: data['0231'], 
                        markPoint: {
                            data: [{ 
                                name: '扫码转账', value: Math.round( data['0231'][ length - 1 ] ), 
                                coord: [ data['date'][ length-1 ], data['0231'][ length - 1 ] ]
                            }]
                        }
                    }, 
                    {   name: '远程转账', type: 'line', data: data['0232'], 
                        markPoint: {
                            data: [{ 
                                name: '远程转账', value: Math.round( data['0232'][ length - 1 ] ), 
                                coord: [ data['date'][ length-1 ], data['0232'][ length - 1 ] ]
                            }]
                        }
                    }, 
                    {   name: '快速收款码', type: 'line', data: data['0215'], 
                        markPoint: {
                            data: [{ 
                                name: '快速收款码', value: Math.round( data['0215'][ length - 1 ] ), 
                                coord: [ data['date'][ length-1 ], data['0215'][ length - 1 ] ]
                            }]
                        }
                    }
                ], 
                dataZoom: [{ startValue: data['date'].length - ranges, 
                             endValue: data['date'].length
                }]
            });
            window.addEventListener("resize", function() { myChart.resize(); });
        }, 
        error: function(e) {
            alert("请求数据失败!");
        }
    });
};



function qrApp_timeline(echarts) {
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('qrApp_timeline'));
    // 指定图表的配置项和数据
    var option = {
        baseOption: {
            timeline: { axisType: 'category', show: true, currentIndex: 1, data: [] },
            xAxis: [{ type: 'category', boundaryGap: true, data: [] }], 
            yAxis: [{ type: 'value', name: '万笔' }], 
            series: [{ type: 'line', }, ], 
            title: { text: '二维码各APP的交易情况', subtext: '' },
            tooltip: { trigger: 'axis'},
            grid: { left: '5%', right: '10%', bottom: '10%', containLabel: true }, 
            toolbox: { feature: { 
                            saveAsImage: {}, 
                            dataZoom: { yAxisIndex: 'none' }, 
                            dataView: { readOnly: false }, 
                            magicType: { type: ['line', 'bar'] }, 
                            restore: {}, 
                            saveAsImage: {}
                       }, 
                       orient: 'vertical', 
                       top: 'middle', 
                       right: '3%' 
            }, 
        }, 
        series: [], 
        dataZoom: [
            { type: 'slider', show: true, 
              height: '4%', bottom: '5%', 
              filterMode: 'weakFilter', 
              handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z', 
              handleSize: '80%'
            }
        ]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    myChart.showLoading();
    
    $.ajax({
        url: '/qr/app', 
        type: 'get', 
        async: true, 
        dataType: 'json', 
        success: function (data) {
            var xticks = [], i = 0, j = 0, length = data['columns'].length;
            for(i=0; i<length; i+=2) {
                xticks.push( data['columns'][i][0] );
            };
            var li = data['data'].length, lj = data['data'][0].length;
            var debit = {}, credit = {};
            for(i=0; i<li; i++)
            {
                debit[ data['index'][i] ] = [], credit[ data['index'][i] ] = [];
                for(j=0; j<lj; j++)
                {
                    if(j % 2 == 0)
                    {   debit[ data['index'][i] ].push( data['data'][i][j] ); }
                    else
                    {   credit[ data['index'][i] ].push( data['data'][i][j] ); }
                }
            }
            myChart.hideLoading();
            myChart.setOption({
                baseOption: { 
                   timeline: { data: data['index'] }, 
                legend: { left: 'center', top: '7%', data:['借记卡', '贷记卡'] },
                xAxis: { data: xticks }
                }, 
                options: [
                {  
                    series: [
                    {   name: '借记卡', type: 'bar', stack: '笔数', data: debit[ data['index'][0] ] }, 
                    {   name: '贷记卡', type: 'bar', stack: '笔数', data: credit[ data['index'][0] ] }],
                }, 
                {
                    series: [
                    {   name: '借记卡', type:'bar', stack: '笔数', data: debit[ data['index'][1] ] }, 
                    {   name: '贷记卡', type:'bar', stack: '笔数', data: credit[ data['index'][1] ] }]
                } 
                ]
            });
            window.addEventListener("resize", function() { myChart.resize(); });
        }, 
        error: function(e) {
            alert("请求数据失败!");
        }
    });
};




