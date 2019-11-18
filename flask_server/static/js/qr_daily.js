

var ranges = 15, months = 31; 


function qr_total_kpi(echarts){
    var myChart = echarts.init(document.getElementById('qr_total_kpi'));
    var option = {
        title: { text: '二维码业务的总体指标完成情况', subtext: '' },
        tooltip: { trigger: 'axis' },
        grid: { left: '5%', right: '10%', bottom: '10%', containLabel: true }, 
        toolbox: { feature: { saveAsImage: {}, dataView: { readOnly: false }, restore: {} }, 
                   orient: 'vertical', top: 'middle', right: '3%' 
            } 
        };
    myChart.setOption(option);
    myChart.showLoading(); 
    // 填充默认值
    $.ajax({
        url: '/qr/kpi', type: 'get', async: true, dataType: 'json', 
        success: function (data) {
            myChart.hideLoading();
            myChart.setOption({
                series: [
                {   
                    name: '交易笔数', type: 'gauge', 
                    detail: { formatter: "{value}%", fontSize: 20 }, 
                    data: [{ value: (data['trans_num'] / 50 * 100).toFixed(2), name: '年累计交易量\n'+data['trans_num']+'亿笔' }], 
                    center: ['25%', '45%'], radius: '70%', 
                    title: { offsetCenter: [0, '70%'] }
                }, 
                {   
                    name: '活卡数', type: 'gauge', 
                    detail: { formatter: "{value}%", fontSize: 20 }, 
                    data: [{ value: (data['card_num'] / 4300 * 100).toFixed(2), name: '月均活卡量\n'+data['card_num']+"万张" }], 
                    center: ['75%', '45%'], radius: '70%', 
                    title: { offsetCenter: [0, '70%'] }
                }] 
            });
            window.addEventListener("resize", function() { myChart.resize(); });
        }, 
        error: function(e) {
            alert("请求二维码总体KPI数据失败!");
        }
    });
    // 获取日期的下拉菜单列表
    $.ajax({
        url: '/qr/total', 
        type: 'get', 
        async: true,
        dataType: 'json', 
        success: function (data) {
            var length = data['date'].length; 
            $("#date_select").append("<option value='昨天' selected='selected'>" + data['date'][length-1] + "</option>");
            var i = length; 
            for(; i>length-months; i--)
            {
                $("#date_select").append("<option value='"+data['date'][i]+"'>" + data['date'][i] + "</option>");
            }
            $("#date_select").selectpicker("refresh");
        }, 
        error: function(e) {
            alert("请求KPI的日期下拉列表数据失败!");
        }
    });
    $('#date_select').on('change', function() {
        var val = $(this).val();
        $.ajax({
            url: '/qr/kpi', type: 'post', async: true, dataType: 'json', 
            data: {'date': val}, 
            success: function (data) {
                myChart.hideLoading();
                myChart.setOption({
                    series: [
                    {   
                        name: '交易笔数', type: 'gauge', 
                        detail: { formatter: "{value}%", fontSize: 20 }, 
                        data: [{ value: (data['trans_num'] / 50 * 100).toFixed(2), name: '年累计交易量\n'+data['trans_num']+'亿笔' }], 
                        center: ['25%', '45%'], radius: '70%', 
                        title: { offsetCenter: [0, '70%'] }
                    }, 
                    {   
                        name: '活卡数', type: 'gauge', 
                        detail: { formatter: "{value}%", fontSize: 20 }, 
                        data: [{ value: (data['card_num'] / 4300 * 100).toFixed(2), name: '月均活卡量\n'+data['card_num']+"万张" }], 
                        center: ['75%', '45%'], radius: '70%', 
                        title: { offsetCenter: [0, '70%'] }
                    }] 
                });
                window.addEventListener("resize", function() { myChart.resize(); });
            }, 
            error: function(e) {
                alert("请求二维码总体KPI数据失败!");
            }
        });
     });
    
};



function qr_total(echarts){

    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('qr_total'));
    // 指定图表的配置项和数据
    var option = {
        title: { text: '二维码每日的总体交易情况', subtext: '' },
        tooltip: { trigger: 'axis' },
        grid: { left: '5%', right: '10%', bottom: '10%', containLabel: true }, 
        toolbox: { feature: { 
                        dataZoom: { yAxisIndex: 'none' }, 
                        dataView: { readOnly: false }, 
                        magicType: { type: ['line', 'bar'] }, 
                        restore: {}, 
                        saveAsImage: {}
                       }, 
                       orient: 'vertical', top: 'middle', right: '3%' 
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
                legend: { left: 'center', top: '7%', data:['交易笔数', '优惠笔数', '优惠金额'] },
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
            alert("请求二维码总体交易数据失败!");
        }
    });
};



function qr_product(echarts) {
    var myChart = echarts.init(document.getElementById('qr_product'));
    var option = {
        title: { text: '二维码各产品的交易笔数', subtext: '' },
        tooltip: { trigger: 'axis'},
        grid: { left: '5%', right: '10%', bottom: '10%', containLabel: true }, 
        toolbox: { feature: { 
                        dataZoom: { yAxisIndex: 'none' }, 
                        dataView: { readOnly: false }, 
                        magicType: { type: ['line', 'bar'] }, 
                        restore: {}, 
                        saveAsImage: {}
                   }, 
                   orient: 'vertical', top: 'middle', right: '3%' 
        }, 
        xAxis: { type: 'category', boundaryGap: false },
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
                legend: { type: 'scroll', orient: 'vertical', right: '10', top: '30%', bottom: '30%', data:['被扫', '主扫', '扫码转账', '远程转账', '快速收款码', '直连小微', '行业码', '卡码合一'] },
                series: [
                    {   name: '被扫', type: 'line', data: data['bs_num'] , 
                        markPoint: {
                            data: [{ 
                                name: '被扫', value: Math.round( data['bs_num'][ length - 1 ] ), 
                                coord: [ data['date'][ length-1 ], data['bs_num'][ length - 1 ] ]
                            }]
                        }
                    }, 
                    {   name: '主扫', type: 'line', data: data['zs_num'], 
                        markPoint: {
                            data: [{ 
                                name: '主扫', value: Math.round( data['zs_num'][ length - 1 ] ), 
                                coord: [ data['date'][ length-1 ], data['zs_num'][ length - 1 ] ]
                            }]
                        }
                    },
                    {   name: '扫码转账', type: 'line', data: data['p2p_num'], 
                        markPoint: {
                            data: [{ 
                                name: '扫码转账', value: Math.round( data['p2p_num'][ length - 1 ] ), 
                                coord: [ data['date'][ length-1 ], data['p2p_num'][ length - 1 ] ]
                            }]
                        }
                    }, 
                    {   name: '远程转账', type: 'line', data: data['yc_num'], 
                        markPoint: {
                            data: [{ 
                                name: '远程转账', value: Math.round( data['yc_num'][ length - 1 ] ), 
                                coord: [ data['date'][ length-1 ], data['yc_num'][ length - 1 ] ]
                            }]
                        }
                    }, 
                    {   name: '快速收款码', type: 'line', data: data['ks_num'], 
                        markPoint: {
                            data: [{ 
                                name: '快速收款码', value: Math.round( data['ks_num'][ length - 1 ] ), 
                                coord: [ data['date'][ length-1 ], data['ks_num'][ length - 1 ] ]
                            }]
                        }
                    }, 
                    {   name: '直连小微', type: 'line', data: data['xw_num'], 
                        markPoint: {
                            data: [{ 
                                name: '直连小微', value: Math.round( data['xw_num'][ length - 1 ] ), 
                                coord: [ data['date'][ length-1 ], data['xw_num'][ length - 1 ] ]
                            }]
                        }
                    }, 
                    {   name: '卡码合一', type: 'line', data: data['kama_num'], 
                        markPoint: {
                            data: [{ 
                                name: '卡码合一', value: Math.round( data['kama_num'][ length - 1 ] ), 
                                coord: [ data['date'][ length-1 ], data['kama_num'][ length - 1 ] ]
                            }]
                        }
                    }, 
                    {   name: '行业码', type: 'line', data: data['hym_num'], 
                        markPoint: {
                            data: [{ 
                                name: '行业码', value: Math.round( data['hym_num'][ length - 1 ] ), 
                                coord: [ data['date'][ length-1 ], data['hym_num'][ length - 1 ] ]
                            }]
                        }
                    }
                ], 
                dataZoom: [{ startValue: data['date'].length - ranges, endValue: data['date'].length }]
            });
            window.addEventListener("resize", function() { myChart.resize(); });
        }, 
        error: function(e) {
            alert("请求二维码各产品的交易数据失败!");
        }
    });
};



function qrApp_timeline(echarts) {
    var myChart = echarts.init(document.getElementById('qrApp_timeline'));
    var option = {
        baseOption: {
            xAxis: [{ type: 'category', boundaryGap: true }], 
            yAxis: [{ type: 'value', name: '万笔' }], 
            series: [{ type: 'line' }], 
            title: { text: '二维码各APP的交易笔数', subtext: '' },
            tooltip: { trigger: 'axis'},
            grid: { left: '5%', right: '10%', bottom: '15%', containLabel: true }, 
            toolbox: { feature: { 
                            dataZoom: { yAxisIndex: 'none' }, 
                            dataView: { readOnly: false }, 
                            magicType: { type: ['line', 'bar'] }, 
                            restore: {}, 
                            saveAsImage: {}
                       }, 
                       orient: 'vertical', top: 'middle', right: '3%' 
            }, 
        }, 
        dataZoom: [
            { type: 'slider', show: true, 
              height: '4%', bottom: '5%', 
              filterMode: 'weakFilter', 
              handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z', 
              handleSize: '80%'
            }
        ]
    };
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
            for(i=li-ranges; i<li; i++)
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
            var myOptions = [];
            for(i=li-ranges; i<li; i++)
            {   
                var optSeries = {  
                                series: [
                                {   name: '借记卡', type: 'bar', stack: '笔数', data: debit[ data['index'][i] ] }, 
                                {   name: '贷记卡', type: 'bar', stack: '笔数', data: credit[ data['index'][i] ] }],
                            };
                myOptions.push( optSeries );
                console.log(i);
            }
            myChart.hideLoading();
            myChart.setOption({
                baseOption: { 
                    timeline: { axisType: 'category', show: true, bottom: '3%', currentIndex: ranges-1, data: data['index'].slice(li-ranges, li)  },
                    legend: { left: 'center', top: '7%', data:['借记卡', '贷记卡'] },
                    xAxis: { data: xticks }
                }, 
                options: myOptions 
            });
            window.addEventListener("resize", function() { myChart.resize(); });
        }, 
        error: function(e) {
            alert("请求二维码各APP的Timeline数据失败!");
        }
    });
};



function qr_oneApp(echarts) {
    var myChart = echarts.init(document.getElementById('qr_oneApp'));
    var option = {
        title: { text: '二维码单个APP的交易情况', subtext: '' },
        tooltip: { trigger: 'axis'},
        grid: { left: '5%', right: '10%', bottom: '10%', containLabel: true }, 
        toolbox: { feature: { 
                        dataZoom: { yAxisIndex: 'none' }, 
                        dataView: { readOnly: false }, 
                        magicType: { type: ['line', 'bar'] }, 
                        restore: {}, 
                        saveAsImage: {}
                   }, 
                   orient: 'vertical', top: 'middle', right: '3%' 
        }, 
        xAxis: { type: 'category', boundaryGap: true, data: [] },
        yAxis: { type: 'value', name: '万笔 / 万元' },
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
        url: '/qr/oneApp', 
        type: 'get', 
        async: true,
        dataType: 'json', 
        success: function (data) {
            var length = data['date'].length; 
            myChart.hideLoading();
            myChart.setOption({
                xAxis: { data: data['date'] }, 
                legend: { left: 'center', top: '7%', 
                    data:['借记卡笔数', '贷记卡笔数', '优惠笔数', '优惠金额'] 
                },
                series: [
                    {   name: '借记卡笔数', type: 'bar', stack: '笔数', data: data['借记卡'] }, 
                    {   name: '贷记卡笔数', type: 'bar', stack: '笔数', data: data['贷记卡'] },
                    {   name: '优惠笔数', type: 'line', data: data['coupon_num'] }, 
                    {   name: '优惠金额', type: 'line', data: data['coupon_at'] }
                ], 
                dataZoom: [{ startValue: data['date'].length - ranges, endValue: data['date'].length }]
            });
            window.addEventListener("resize", function() { myChart.resize(); });
        }, 
        error: function(e) {
            alert("请求默认云闪付APP的交易数据失败!");
        }
    });
    // 获取APP下拉菜单列表
    $.ajax({
        url: '/qr/app', 
        type: 'get', 
        async: true,
        dataType: 'json', 
        success: function (data) {
            var length = data['columns'].length; 
            $("#app_select").append("<option value='云闪付APP' selected='selected'>云闪付APP</option>");
            var i = 0; 
            for(i=0; i<length; i+=2)
            {
                $("#app_select").append("<option value='"+data['columns'][i][0]+"'>" + data['columns'][i][0] + "</option>");
            }
            $("#app_select").selectpicker("refresh");
        }, 
        error: function(e) {
            alert("请求APP的下拉列表数据失败!");
        }
    });
    // APP选项变更时获取新的数据
    $('#app_select').on('change', function() {
        var val = $(this).val();
        $.ajax({
            url: '/qr/oneApp', 
            type: 'post', 
            async: true,
            data: {'app_nm': val}, 
            dataType: 'json', 
            success: function (data) {
                var length = data['date'].length; 
                myChart.setOption({
                    xAxis: { data: data['date'] }, 
                    legend: { left: 'center', top: '7%', 
                        data:['借记卡笔数', '贷记卡笔数', '优惠笔数', '优惠金额'] 
                    },
                    series: [
                        {   name: '借记卡笔数', type: 'bar', stack: '笔数', data: data['借记卡'] }, 
                        {   name: '贷记卡笔数', type: 'bar', stack: '笔数', data: data['贷记卡'] },
                        {   name: '优惠笔数', type: 'line', data: data['coupon_num'] }, 
                        {   name: '优惠金额', type: 'line', data: data['coupon_at'] }
                    ], 
                    dataZoom: [{ startValue: data['date'].length - ranges, endValue: data['date'].length }]
                });
                window.addEventListener("resize", function() { myChart.resize(); });
            }, 
            error: function(e) {
                alert("请求二维码单个APP的交易数据失败!");
            }
        })
     });
    
};



function qrBranch_timeline(echarts) {
    var myChart = echarts.init(document.getElementById('qrBranch_timeline'));
    var option = {
        baseOption: {
            xAxis: [{ type: 'category', boundaryGap: true }], 
            yAxis: [{ type: 'value', name: '万笔' }], 
            series: [{ type: 'line' }], 
            title: { text: '二维码分公司的交易笔数', subtext: '' },
            tooltip: { trigger: 'axis'},
            grid: { left: '5%', right: '10%', bottom: '15%', containLabel: true }, 
            toolbox: { feature: { 
                            dataZoom: { yAxisIndex: 'none' }, 
                            dataView: { readOnly: false }, 
                            magicType: { type: ['line', 'bar'] }, 
                            restore: {}, 
                            saveAsImage: {}
                       }, 
                       orient: 'vertical', top: 'middle', right: '3%' 
            }, 
        }, 
        dataZoom: [
            { type: 'slider', show: true, 
              height: '4%', bottom: '5%', 
              filterMode: 'weakFilter', 
              handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z', 
              handleSize: '80%'
            }
        ]
    };
    myChart.setOption(option);
    myChart.showLoading();
    
    $.ajax({
        url: '/qr/branch', 
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
            };
            var myOptions = [];
            for(i=0; i<ranges+1; i++)
            {
                var optSeries = {  series: [
                                    {   name: '借记卡', type: 'bar', stack: '笔数', data: debit[ data['index'][i] ] }, 
                                    {   name: '贷记卡', type: 'bar', stack: '笔数', data: credit[ data['index'][i] ] } ],
                                };
                myOptions.push( optSeries );
                
            };
            myChart.hideLoading();
            myChart.setOption({
                baseOption: { 
                    timeline: { axisType: 'category', show: true, bottom: '3%', currentIndex: ranges, data: data['index']  },
                    legend: { left: 'center', top: '7%', data:['借记卡', '贷记卡'] },
                    xAxis: { data: xticks }
                }, 
                options: myOptions, 
            });
            window.addEventListener("resize", function() { myChart.resize(); });
        }, 
        error: function(e) {
            alert("请求各个分公司的交易数据失败!");
        }
    });
};



function qr_oneBranch(echarts) {
    var myChart = echarts.init(document.getElementById('qr_oneBranch'));
    var option = {
        title: { text: '二维码单个分公司的交易情况', subtext: '' },
        tooltip: { trigger: 'axis'},
        grid: { left: '5%', right: '10%', bottom: '10%', containLabel: true }, 
        toolbox: { feature: { 
                        dataZoom: { yAxisIndex: 'none' }, 
                        dataView: { readOnly: false }, 
                        restore: {}, 
                        saveAsImage: {}
                   }, 
                   orient: 'vertical', top: 'middle', right: '3%' 
        }, 
        xAxis: { type: 'category', boundaryGap: true },
        yAxis: { type: 'value', name: '万笔 / 万元' },
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
        url: '/qr/oneBranch', 
        type: 'get', 
        async: true,
        dataType: 'json', 
        success: function (data) {
            var length = data['date'].length; 
            myChart.hideLoading();
            myChart.setOption({
                xAxis: { data: data['date'] }, 
                legend: { left: 'center', top: '7%', 
                    data:['借记卡笔数', '贷记卡笔数', '优惠笔数', '优惠金额'] 
                },
                series: [
                    {   name: '借记卡笔数', type: 'bar', stack: '笔数', data: data['01'] }, 
                    {   name: '贷记卡笔数', type: 'bar', stack: '笔数', data: data['02'] },
                    {   name: '优惠笔数', type: 'line', data: data['coupon_num'] }, 
                    {   name: '优惠金额', type: 'line', data: data['coupon_at'] }
                ], 
                dataZoom: [{ startValue: data['date'].length - ranges, endValue: data['date'].length }]
            });
            window.addEventListener("resize", function() { myChart.resize(); });
        }, 
        error: function(e) {
            alert("请求上海分公司的交易数据失败!");
        }
    });
    // 获取分公司的下拉菜单列表
    $.ajax({
        url: '/qr/branch', 
        type: 'get', 
        async: true,
        dataType: 'json', 
        success: function (data) {
            var length = data['columns'].length; 
            $("#branch_select").append("<option value='云闪付APP' selected='selected'>云闪付APP</option>");
            var i = 0; 
            for(i=0; i<length; i+=2)
            {
                $("#branch_select").append("<option value='"+data['columns'][i][0]+"'>" + data['columns'][i][0] + "</option>");
            }
            $("#branch_select").selectpicker("refresh");
        }, 
        error: function(e) {
            alert("请求分公司的下拉列表数据失败!");
        }
    });
    $('#branch_select').on('change', function() {
        var val = $(this).val();
        $.ajax({
            url: '/qr/oneBranch', 
            type: 'post', 
            async: true,
            data: {'branch_nm': val}, 
            dataType: 'json', 
            success: function (data) {
                var length = data['date'].length; 
                myChart.hideLoading();
                myChart.setOption({
                    xAxis: { data: data['date'] }, 
                    legend: { left: 'center', top: '7%', 
                        data:['借记卡笔数', '贷记卡笔数', '优惠笔数', '优惠金额'] 
                    },
                    series: [
                        {   name: '借记卡笔数', type: 'bar', stack: '笔数', data: data['01'] }, 
                        {   name: '贷记卡笔数', type: 'bar', stack: '笔数', data: data['02'] },
                        {   name: '优惠笔数', type: 'line', data: data['coupon_num'] }, 
                        {   name: '优惠金额', type: 'line', data: data['coupon_at'] }
                    ], 
                    dataZoom: [{ startValue: data['date'].length - ranges, endValue: data['date'].length }]
                });
                window.addEventListener("resize", function() { myChart.resize(); });
            }, 
            error: function(e) {
                alert("请求单个分公司的交易数据失败!");
            }
        })
     });
    
};
