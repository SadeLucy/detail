    var id = getQueryString('id');
    store.set('token', '395ead7e5f8c8df4ae1ebb79fd060c80');
    store.set('login',true);
    $(document).ready(function() {
        var curType;
        var obj = {};
        var hasCache = {};
        var productions = {};


        $('.recordList').addClass('hide');

        queryDataSetByTxno({ txno: 6010, fid: id }, null, null, null, function(jdata) {
           // console.log(jdata);
            $('.part0 .title h5').html(jdata.info.title);

            function Color(ele, data) {
                var num = (data / 1).toFixed(2);
                if (num < 0) {
                    ele.attr('class', 'green');
                    ele.html(num + '%');
                } else if (num == 0) {
                    num = num.indexOf('-') < 0 ? num : num.split('-')[1];
                    ele.attr('class', 'gray');
                    ele.html(num + '%');
                } else {
                    ele.attr('class', 'red');
                    ele.html('+' + num + '%');
                }
            }



            Color($('.yesterday p'), jdata.info.dayrate);
            Color($('.profit p'), jdata.info.totalrate);

            // $('.profit p').html(jdata.info.totalrate + '%');
            // $('.yesterday p').html(jdata.info.dayrate + '%');
            $('.part4 p').html(jdata.info.desctxt);

            if (!jdata.info.realname) {
                $('.name').html('');
            } else {
                $('.name ').html('<img src="' + getWebRootUrl() + 'res?type=headpic&arg0=' + id + '">' + jdata.info.realname);
            }

            var tlist = (jdata.prelist && jdata.prelist.fsymbol) ? jdata.prelist : jdata.list;
            if (!tlist.confper) {
                tlist.confper = tlist.hold.map(function(a) {
                    return (a / jdata.info.total * 100).toFixed(2) / 1
                });
            } else {
                tlist.confper = tlist.confper.map(function(a) {
                    return +a
                });
            }
            obj = {
                confper: tlist.confper,
                prdid: tlist.fsymbol
            };
            detailList(tlist);
            HistoricalData(obj);
        }, -1);

        // '00115aa563f34ea9bd02035de0cd3660'

        queryDataSetByTxno({ txno: 6017, fid: id }, null, null, null, function(jdata) {
            //console.log(jdata);
            try {
                var dataValue = jdata.value.map(function(a) {
                    return a * 100;
                });
                Historicaltracing(dataValue, jdata.val1, jdata.val2, jdata.days);

                fontColor(dataValue, $('.profit00 span'));
                fontColor(jdata.val1.map(function(a) {
                    return a * 100
                }), $('.profit01 span'));
                fontColor(jdata.val2.map(function(a) {
                    return a * 100
                }), $('.profit02 span'));

                $('.rate00 p  span').html(" " + jdata.maxback);
                $('.rate06   p  span').html(" " + (jdata.avgrate * 100).toFixed(2) + '%');

            } catch (e) {
                console.log(e);
            }
        }, -1);


        queryDataSetByTxno({ txno: 6019, fid: id }, null, null, null, function(jdata) {
            // console.log(jdata);
            transfer(jdata.list);

        }, -1);
        //"'+list[i].fsymbol[j]+'","'+list[i].name[j]+'""
        function transfer(list) {
            str = '';
            for (var i = 0; i < list.length; i++) {
                var day = list[i].day;
                str += '<li class="record00">';
                str += '                    <h6><i>' + day.slice(0, 4) + '-' + day.slice(4, 6) + '-' + day.slice(6) + '</i><span></span></h6>';
                for (var j = 0; j < list[i].fsymbol.length; j++) {

                    // str += '                   <div class="recordList">';
                    var strD = list.length > 1 ? '<div class="recordList hide">' : '<div class="recordList">';
                    str += strD;
                    str += '                       <div class="left">';
                    str += '                          <p class="scroll">' + list[i].name[j] + '</p>';
                    str += '                         <span>(' + list[i].fsymbol[j] + ')</span>';
                    str += '                      </div>';
                    str += '                      <div class="right">';
                    str += '                         <p><span>' + list[i].preconfper[j] + '%</span><i></i><a>' + list[i].confper[j] + '%</a></p>';
                    str += '                      </div>';
                    str += '                 </div>';
                }
                str += '  </li>';
            }


            $('.record').html(str);
            $('.recordList').addClass('hide');
            $('.record00 span').removeClass('down');
            $('.record00:eq(0) .recordList').removeClass('hide');
            $('.record00:eq(0)  h6 span').addClass('down');
            clickFade();

            /*  $('.left').on('click', function() {
                  try {
                      aow.newWebview(JSON.stringify({ url: getRootWeb() + "/view/fundhealth?symbol=" + prdid, backurl: "", title: xxx.fdsname }));
                  } catch (e) {}

              })*/



        }



        function HistoricalData(obj) {
            $.ajax({
                type: 'post',
                // url: 'http://<192 class="168 1 102:8070"></192>/WEALTH/dir',
                url: getWebRootUrl() + "dir",
                dataType: 'jsonp',
                data: {
                    type: 'ghrhist',
                    plid: 22,
                    scope: '1m',
                    prdid: JSON.stringify(obj.prdid),
                    confper: JSON.stringify(obj.confper),
                    queryConfper: 1
                },
                jsonp: 'callback',
                jsonpCallback: "successCallback2",
                success: function(data) {
                    try {
                        if (data.error) {
                            window.aow.alert(data.error);
                        }
                        // console.log(data);

                        productions = proConfper(obj);
                        assetAllocation(data.confper, productions);

                    } catch (e) {
                        console.log(e);
                    } finally {
                        curType = null;
                    }

                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    window["exx"] = {
                        p: 3,
                        req: XMLHttpRequest,
                        ts: textStatus,
                        et: errorThrown
                    };
                    // curType = null;
                    alert(XMLHttpRequest.status + "   " + XMLHttpRequest.readyState + "   " + textStatus);
                }
            });
        }


        // 配置详情列表
        function detailList(data) {
            // console.log(data);
            var str = '';
            var Rate = [];
            var newRate;
            for (var i = 0; i < data.growrate.length; i++) {
                Rate[i] = data.growrate[i] == '--' ? data.growrate[i] : (data.growrate[i] * 100).toFixed(2);
            }

            for (var i = 0; i < data.fsymbol.length; i++) {
                str += '<li>';
                str += '            <div   onclick="infoDetail(\'' +data.fsymbol[i] + '\',\'' + data.fdsname[i] + '\')">';
                str += '                   <h6 class="titleList scroll">' + data.fdsname[i] + '</h6><span>(' + data.fsymbol[i] + ')</span>';
                str += '               </div>';
                str += '              <div>';
                // str += Rate[i].split("%")[0].indexOf('-') < 0 ? ' <p class="red">' : ' <p class="green">';
                if (Rate[i] / 1 < 0) {
                    str += ' <p class="green">' + Rate[i];
                } else if (Rate[i] / 1 == 0) {
                    newRate = Rate[i].indexOf("-") < 0 ? Rate[i] : Rate[i].split('-')[1];
                    str += ' <p class="gray">' + newRate;
                } else {
                    str += ' <p class="red">' + "+" + Rate[i];
                }
                str += '%</p><span>昨日涨幅</span>';
                str += '              </div>';
                str += '              <div>';
                str += '                 <p class="scroll">' + data.confper[i] + '%</p><span>占比</span>';
                str += '             </div>';
                str += ' </li>';
            }

            $('.configure').append(str);


        }

        // 重组obj数据位置
        function proConfper(data) {
            for (var i = 0; i < data.prdid.length; i++) {
                productions[data.prdid[i]] = data.confper[i];
            }
            return productions;
        }




    });


    //获得投资报告书的id值
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    function getWebRootUrl() {
        return ((window.location.href + "").match(/^[\w]{2,}:\/\/[\w|\d|\.|\:]{10,}\/[\w|\d}\_]{2,}\//g))[0];
    }




    /*点击显示调仓记录*/


    function clickFade() {
        $('.record00').on('click', 'h6', function() {
            var ele = $(this).parent('li').find('div');
            var flag = ele.attr('class').indexOf('hide');
            if (flag > 0) {
                $('span', this).addClass('down');
                ele.fadeIn(300);
                ele.removeClass('marginT');
                ele.removeClass('hide');
            } else {
                $('span', this).removeClass('down');
                ele.addClass('marginT');
                ele.fadeOut(500);
                ele.addClass('hide');
            }
        })
    }





    function fontColor(num, ele) {
        var Num = (num[num.length - 1]).toFixed(2);
        if (Num > 0) {
            ele.attr('class', 'red');
            ele.html("+" + Num + '%');
        } else if (Num == 0) {
            Num = Num.indexOf("-") === 0 ? Num.split('-')[1] : Num;
            ele.attr('class', 'gray');
            ele.html(Num + '%');
        } else {
            ele.attr('class', 'green');
            ele.html(Num + '%');
        }
    }



    function infoDetail(fsymbol, name) {
        try {
            aow.newWebview(JSON.stringify({ url: getWebRootUrl() + "/view/fundhealth.html?symbol=" + fsymbol, backurl: "", title: name }));
        } catch (e) {
            alert(e);
        }
    }
