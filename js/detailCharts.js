//资产配置

function assetAllocation(data, confper) {
    // console.log(assetData(data, confper));
    var assetProportion = assetData(data, confper);

    $('.assetsLists ul li').each(function(i, e) {
        $(e).children('a').eq(0).html(assetProportion[i].toFixed(2) + '%');
    })
    $('.assetsContainer').highcharts({
        chart: {
            type: 'pie',
            // paddingTop: 10,
            marginLeft: 10,
            marginTop: 16,
        },
        title: {
            text: '',
            verticalAlign: 'middle',
            y: -8,
            useHTML: true,
            style: {
                "fontSize": "8px",
                "color": "#999"
            },
            fontFamily: 'Microsoft Yahei',
        },
        credits: {
            enabled: false,
        },
        tooltip: {
            enabled: false
        },
        plotOptions: {
            pie: {
                size: 138,
                innerSize: '90',
                borderColor: 'rgba(0,0,0,0)',
                colors: [
                    '#2ba8ff',
                    '#92c6ff',
                    '#8096df',
                    '#fe9900',
                    '#ffb445',
                    '#e9f3ff',
                    '#fff',
                ],
                dataLabels: {
                    enabled: false,
                },
            },
            series: {
                states: {
                    hover: {
                        enabled: false
                    }
                }
            }
        },
        legend: {
            enabled: false,
        },
        series: [{
            data: assetProportion,
        }]
    });



}

function assetData(data, confper) {
    var newArr = [];
    var difference = 0;
    newArr[0] = resulConfper(data.chstock, data);
    newArr[1] = resulConfper(data.bond, data);
    newArr[2] = resulConfper(data.gold, data);
    newArr[3] = resulConfper(data.intstock, data);
    newArr[4] = resulConfper(data.riskless, data);
    newArr[5] = resulConfper(data.others, data);

    difference += (newArr[0] / 1 + newArr[1] / 1 + newArr[2] / 1 + newArr[3] / 1 + newArr[4] / 1 + newArr[5] / 1).toFixed(2) - 100;
    newArr.push(difference);

    function resulConfper(d1, data) {
        var result = 0;
        for (var i = 0; i < d1.length; i++) {
            result += d1[i] * confper[data.fsymbol[i]]/100;
        }
        return result;
    }
    return newArr;
}

//数据跟踪
function Historicaltracing(data,data1,data2, x) {

    var step = x.length % 5 === 0 ? x.length / 5 + 1 : Math.ceil(x.length / 5);
    var color = step>5?  '#cecece':'#fff';
    $('.afterChart').highcharts({
        chart: {
            type: 'area',
            height: 180,
            backgroundColor: '#fff',
            marginLeft: 35,
            marginRight: 15,
        },
        title: {
            text: ''
        },
        legend: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        xAxis: {
            lineWidth: 0,
            categories: xAxisData(x),
            labels: {
                style: {
                    color: '#ccc',
                    fontSize: 8,
                },
            },
            tickWidth: 0,
            tickInterval: step,
        },
        yAxis: {
            /*  max: max,
              min: min,*/
            title: {
                text: ''
            },
            tickAmount: 4,
            gridLineWidth: 1,
            gridLineDashStyle: 'ShortDash',
            gridLineColor: '#eee',
            labels: {
                formatter: function() {
                    return (+this.value).toFixed(1) + '%';
                },
                x: -2,
                y: -2,
                style: {
                    color: '#ccc',
                    fontSize: 8,
                    'text-align': 'center',
                },
                overflow: 'justify'
            }
        },
        tooltip: {
            enabled: false
        },
        plotOptions: {
            area: {
                dataLabels: {
                    enabled: false
                },
                marker: {
                    enabled: false,
                },

                overflow: 'justify',
                enableMouseTracking: false,
                events: {
                    click: function(event) {
                        var index = event.point.x;
                    }
                }
            },
            series: {
                dataLabels: {
                    enabled: false, //显示点上面的数字
                },
                marker: {
                    enabled: false, //显示点的布尔值
                    states: {
                        hover: {
                            radius: 1,
                            fillColor: '#fff',
                            lineWidth: 0,
                            lineColor: null
                        }
                    },
                },
                lineWidth: 1,
                // fillColor: 'rgba(255,255,255,.12)',
            }
        },
        series: [{
            data: data1.map(function (a){ return a*100}),
            color: "#8ec449",
            fillColor: 'rgba(255,255,255,0)',
        }, {
            data: data2.map(function (a){ return a*100}),
            color: "#047ffa",
            fillColor: 'rgba(255,255,255,0)',
        }, {
            data: data,
            color: "#f5f", // 本基金
            fillColor: "rgba(255,255,255,0)",
        }]
    });

}



function xAxisData(arr) {
    var flagg;
    var newArr = [];
    flag();
    for (var j = 0; j < arr.length; j++) {
        if (flagg) {
                newArr[j] = arr[j].slice(4, 6) + '-' + arr[j].slice(6, 8);
            } else {
                newArr[j] = arr[j].slice(2, 4) + '-' + arr[j].slice(4, 6) + '-' + arr[j].slice(6, 8);
            }
    }
    return newArr;

    function flag() {
        var fisrtYear = [];
        for (var i = 0; i < arr.length; i++) {
            fisrtYear[i] = arr[i].slice(0, 5);
            // console.log(fisrtYear);
            if (fisrtYear[i] !== fisrtYear[0]) {
                return flagg = false;
            } else {
                flagg = true;
            }
        }
    }
}


function axisX(arr) {
    var newArr0 = arr.map(function(a) {
        return a.split(' ')[0];
    });

    newArr0 = xAxisData(newArr0);
    return newArr0;

}




function getMaxDown(data) {
    var top, val, i, j, ret = {
        left: -1,
        right: 10000,
        val: -10000
    };
    var hary = [top = {
        pos: 0,
        val: data[0]
    }];
    for (i = 1; i < data.length - 1; i++) data[i] >= top.val && (top = hary[hary.length - ((i === top.pos + 1) ? 1 : 0)] = {
        pos: i,
        val: data[i]
    });
    var lary = [top = {
        pos: data.length - 1,
        val: data[data.length - 1]
    }];
    for (i = data.length - 2; i > 0; i--) data[i] <= top.val && (top = lary[lary.length - ((i === top.pos - 1) ? 1 : 0)] = {
        pos: i,
        val: data[i]
    });
    for (i = 0; i < lary.length; i++) {
        for (j = 0; j < hary.length; j++) {
            if (hary[j].pos > lary[i].pos) continue;
            if ((val = hary[j].val - lary[i].val) > ret.val) {
                ret = {
                    left: hary[j].pos,
                    right: lary[i].pos,
                    val: val
                };
            }
        }
    }
    if (ret.left < 0 || ret.right >= 10000) {
        return {
            left: 0,
            right: data.length,
            val: 0
        };
    }
    return ret;
}

function splitData(data, mr) {
    var ret = [
            [],
            [],
            []
        ],
        i;
    ret[0].length = ret[1].length = ret[2].length = data.length;
    for (i = 0; i < data.length; i++) {
        ret[0][i] = ret[1][i] = ret[2][i] = null;
    }
    for (i = 0; i <= mr.left; i++) ret[0][i] = data[i];
    for (i--; i <= mr.right; i++) ret[1][i] = data[i];
    for (i--; i < data.length; i++) ret[2][i] = data[i];
    /*console.log(ret);*/
    return ret;
}


