           $("body").css("position","relative");
		   $('<span id="tipsBox"></span>').appendTo($("body"));
		   $('<div id="localBox" class="show-pc"></div>').appendTo($("body"));
		   $('<div id="breakList">1231233</div>').appendTo($("body"));
		   //生成本地数据读取
		   var $dom_local=$('<select id="local"></select>');
		   var $dom_localBtn=$('<button id="loadLocal">加载</button>');
		   var allLocal=getLocal("local_daily");
		   for(var key in allLocal){
		   	$dom_local.append($("<option value="+key+">"+key+"</option>"));
		   }
		   $("#localBox").append($dom_local);
		   $("#localBox").append($dom_localBtn);
		   //添加到历史储存
		   $("#loadLocal").click(function(){
		   	var datex=$("#local").val();
		   	const arr=getLocal("local_daily")[datex];
		   	var nowInterval=$("#chooseTime").val();
		   	if(!nowInterval){
		   		 $("#chooseTime option[value='1d']").prop("selected", true);
		   	}
		   	startShow2(arr,"1d")
		   })
		   
		   //全局数据
		   let charts = {};
		   let newListings = [];
		   var kedu="1d";
		   var chartArr=[];
		   
		   
		   //设置本地存储
		   if(!getLocal("local_turnover")){
		   	setLocal("local_turnover",[])
		   }
		   if(!getLocal("local_daily")){
		   	setLocal("local_daily",{})
		   }
		   
		   // 目标价本地存储
		   if(!getLocal("priceAlarm")){
				setLocal("priceAlarm",{});
		   	// console.log(getLocal(dataX))
		   }
		   
		   if(!getLocal("priceAlarmList")){
		   				setLocal("priceAlarmList",[]);
		   	// console.log(getLocal(dataX))
		   }
		   //工具栏结构
		   var $menus=$('<div id="menus" class="sticky" style=""></div>');
		   var $menus=$(
				`<div id="menus" class="sticky">
				
					<span class="label">Quest</span>
					<select id="questNum">
						<option value="" selected="" disabled="">none</option>
						<option value="30">30</option>
						<option value="50">50</option>
						<option value="100">100</option>
						<option value="150">150</option>
						<option value="200" selected>200</option>
						<option value="300">300</option>
						<option value="500">500</option>
						<option value="1000">1000</option>
					</select>
					
					<span class="label">Time</span>
					<select id="chooseTime">
						<option value="" selected="" disabled="">none</option>
						<option value="1m">1m</option>
						<option value="5m">5m</option>
						<option value="15m">15m</option>
						<option value="30m">30m</option>
						<option value="1h">1h</option>
						<option value="2h">2h</option>
						<option value="4h">4h</option>
						<option value="8h">8h</option>
						<option value="12h">12h</option>
						<option value="1d">1d</option>
						<option value="1w">1w</option>
					</select>
					
					<span class="label">Show</span>
					<select id="numK">
						<option value="" selected="" disabled="">none</option>
						<option value="30">30</option>
						<option value="50">50</option>
						<option value="100">100</option>
						<option value="150">150</option>
						<option value="200">200</option>
						<option value="300">300</option>
						<option value="500">500</option>
						<option value="1000">1000</option>
					</select>
					
					<span class="show-pc">
						<span class="label">refresh</span>
						<input type="checkbox" id="refresh">
					
						<span class="label">double</span>
						<input type="checkbox" id="width" checked="">
					
						<span class="label">
							<input type="text" id="coinglass" style="width:100px" placehoder="coinglass">
							<button id="goCoinglass">>>></button>
						</span>
						<span class="label">
							<input type="text" id="targetPrice" style="width:100px">
							<button id="targetBtn">set</button>
						</span>
					
						<span class="label msg-box">
							<span id="msg">noMsg</span></span>
						<button id="msgBtn">Copy</button>
						<span class="label">
							<button id="backupBtn">Backup</button>
						</span>
					</span>
				</div>
		   `)
		   
			$(".chart-container").before($menus);
			// displayNewListings();
			//生成统一时间刻度
			const intervals = [
			    { text: '1m', value: '1m' },
			    { text: '5m', value: '5m' },
			    { text: '15m', value: '15m' },
			    { text: '30m', value: '30m' },
			    { text: '1h', value: '1h'},
				{ text: '2h', value: '2h'},
			    { text: '4h', value: '4h' },
				{ text: '8h', value: '8h' },
				{ text: '12h', value: '12h' },
			    { text: '1d', value: '1d' },
			    { text: '1w', value: '1w' }
			];
			//请求数量
			//生成统一K线根数
			let totalCount = $("#questNum").val();
			$("#questNum").change(function(){
				totalCount=$(this).val()
			})
			//interval
			$("#chooseTime").change(function(){
				var thistime=$(this).val();
				$(".interval-btn").each(function(idx,item){
					if($(item).data("interval")==thistime){
						$(item).trigger("click")
					}
				})
			})
			$("#chooseTime option[value=1m]").prop("selected", true);
			//展示数量
			$("#numK").change(function(){
				const N = parseInt($(this).val());
				$('.chart-box').each(function(i, el) {
					var $chart=($(this).children(".chart-content"))[0];
					var chart = echarts.init($chart);
					if($(this).data("name")=="GAIBUSDT"){
						console.log(chart.getOption())
					}
					// console.log($('.chart-box').attr("id"))
					const chartData=chart.getOption()
					if(chartData){
						const dataCount = chartData.series[0].data.length;
						const start = dataCount> N ?100 - (N/dataCount*100):0;
						const end=100;
						chart.dispatchAction({ type:'dataZoom', start, end });
					}
					
				});
			})
			//生成刷新选项
			var timerY;
			$(document).on('change', '#refresh', function() {
			    if ($(this).prop('checked')) {
			        console.log('复选框已被选中！');
					if(!timerY){
						 timerY = setInterval(refreshAllCharts, 60000);
					}
			        // 注意变量名统一为 timerY
			    } else {
			        console.log('复选框已被取消。');
			        clearInterval(timerY);
			    }
			});
			//调整宽度选项
			$(document).on('change', '#width', function() {
				console.log($(this).prop('checked'))
				const widthClass = $(this).prop('checked')  ?  "width50" : "width100";
				$(".chart-box").removeClass("width50").removeClass("width100").addClass(widthClass);
			  
				setTimeout(() => {
				  // 3. 找到每个 chart-box 中的 echarts 实例并调整
					$(".chart-box").each(function() {
						const chartDom = $(this).find('.chart-content')[0]; // 假设你的 echarts 容器是 div
						if (chartDom) {
							const chartInstance = echarts.getInstanceByDom(chartDom);
							if (chartInstance) {
								chartInstance.resize();
							}
						}
					});
					// 4. 触发窗口 resize
					$(window).trigger('resize');
				}, 100);
			});
			//访问coinglass
			$(document).on('click', '#goCoinglass', function() {
				const symbol=$("#coinglass").val();
				window.open("https://www.coinglass.com/tv/zh/Binance_"+symbol, '_blank');
			});
			
			//设置警报线
			$(document).on('click', '#targetBtn', function() {
				const arr=($("#targetPrice").val()).split(" ");
				if(arr.length==2){
					const local=getLocal("priceAlarm");
					const symbol=arr[0],price=arr[1];
					local[symbol]=price;
					setLocal("priceAlarm",local);
					topTips("目标价格："+symbol+"--"+price)
				}
			});
			
			//备注信息
			$("#msgBtn").click(function(){
				copy("msg")
			})
			//备份所有local数据
			$("#backupBtn").click(function(){
				backup()
			})
			
			//双击页面回到页面顶部
			$('.chart-container').on('dblclick', function(e) {
			    // 检查点击的是不是空白区域（不是box或其它元素）
			    if ($(e.target).hasClass('chart-container')) {
			        $('html, body').animate({ scrollTop: 0 }, 500);
			    }
			});
			//=======================================================================================================================================================
			
			
			//重新获取所有永续合约
			function getBinancePerpetualSymbolsSync() {
			    var symbolsArray = []; // 初始化空数组用于存储结果
			    
			    // 发起同步AJAX请求[2,7](@ref)
			    $.ajax({
			        url: 'https://fapi.binance.com/fapi/v1/exchangeInfo', // 币安永续合约API地址[5](@ref)
			        type: 'GET', // 使用GET方法[1](@ref)
			        dataType: 'json', // 预期返回JSON格式数据[1](@ref)
			        async: false, // 关键设置：启用同步模式[2,6,7](@ref)
			        success: function(response) {
			            // 成功回调函数内处理数据[1,3](@ref)
			            if (response && response.symbols) {
			                // 筛选永续合约并提取名称[1](@ref)
			                symbolsArray = response.symbols
			                    .filter(symbol => symbol.contractType === 'PERPETUAL') // 过滤永续合约
			                    .map(symbol => symbol.symbol); // 提取交易对名称
			            }
						symbolsArray=symbolsArray.filter(Symbol=>Symbol!=="GAIBUSDT");
						// console.log(symbolsArray)
			        },
			        error: function(xhr, status, error) {
			            // 错误处理[1,7](@ref)
			            console.error('请求失败:', status, error);
			            alert('获取数据失败，请检查网络连接或API可用性。');
			        }
			    });
			    
			    return symbolsArray.reverse(); // 返回结果数组[8](@ref)
			}
			
			// 调用函数并输出结果
			var allSymbolsArr = getBinancePerpetualSymbolsSync();
			

   
			//对象数组中的名称属性
			function startShow(arr,time,refresh){
				// console.log("start===========")
				kedu=time;
				for (var i = 0; i < arr.length; i++) {
					if(arr[i].value==kedu){
						arr[i].default=true;
					}
				}
				$(".chart-box").remove();
				newListings=arr.map(a=>a.symbol); console.log(newListings)
				if (newListings.length > 0) {
				    displayNewListings();
				} else {
				    $('#loadingIndicator').html('<div class="text-center">没有数据</div>');
				}
			}
			
			//直接名称数组
			function startShow2(arr,time,refresh){
				kedu=time;
				for (var i = 0; i < arr.length; i++) {
					if(arr[i].value==kedu){
						arr[i].default=true;
					}
				}
				$(".chart-box").remove();
				newListings=arr
				if (newListings.length > 0) {
				    displayNewListings();
				} else {
				    $('#loadingIndicator').html('<div class="text-center">没有数据</div>');
				}
			}
			
			//直接名称数组
			function startShowX(arr,time,msgKey){
				kedu=time;
				for (var i = 0; i < arr.length; i++) {
					if(arr[i].value==kedu){
						arr[i].default=true;
					}
				}
				$(".chart-box").remove();
				newListings=arr
				if (newListings.length > 0) {
				    displayNewListings(msgKey);
				} else {
				    $('#loadingIndicator').html('<div class="text-center">没有数据</div>');
				}
			}
			// 显示新上线币种的图表
			function displayNewListings(msgKey) {
				// $("#menus").show();
			    $('#loadingIndicator').hide();
			    // $("#chooseTime option[value="+kedu+"]").prop("selected", true);
				if(chartArr.length){
					chartArr.forEach(c=>c.dispose());
					chartArr=[];
				}
				
				var idxx=0;
				var timerX=setInterval(function(){
					if(idxx<newListings.length){
						addChart(newListings[idxx],msgKey)
						idxx++
					}else{
						clearInterval(timerX);
					}
				},2)
			    
			    // 启动定时刷新
			    // startAutoRefresh();
			}
			
			
			//添加到每天历史储存
			$(".chart-container").on("click", ".chart-box .save", function() {
				const name = $(this).siblings('.symbol-name').text();
				let $daily = getLocal("local_daily");
				const today=getToday();
				if(!$daily[today]){
					$daily[today]=[] 
				}
				if(!$daily[today].includes(name)){
					$daily[today].push(name);
					console.log($daily)
					setLocal("local_daily",$daily);
					$("#tipsBox").html(`已添加 "${name}" 到${today}`).removeClass("tips-fail").fadeIn(300).delay(1000).fadeOut(1000);
				}else{
					$("#tipsBox").html(today+"已存在"+name).addClass("tips-fail").fadeIn(300).delay(1000).fadeOut(1000);
				}			
			});
			
			//添加到监控本地存储
			$(".chart-container").on("click", ".chart-box .monitor", function() {
				const name = $(this).siblings('.symbol-name').text();
				let $monitor = getLocal("HeatMonitor");
				if(!$monitor.find(item => item.name === name)){
					$monitor.push({
						name:name,
						targetPrice:"",
						highLight:"",
						volume:""
					})
					setLocal("HeatMonitor",$monitor);
					$("#tipsBox").html(`已添加 "${name}" 到monitor`).removeClass("tips-fail").fadeIn(300).delay(1000).fadeOut(1000);
				}else{
					$("#tipsBox").html("monitor已存在"+name).addClass("tips-fail").fadeIn(300).delay(1000).fadeOut(1000);
				}		
			});
			
			//添加到定点复盘储存-上升
			$(".chart-container").on("click", ".chart-box .review", function() {
				const name = $(this).siblings('.symbol-name').text();
				let $review= getLocal("AnalysisData2");
				// if ($review.findIndex(trade => trade.name == name) > -1) {
				//   $("#tipsBox").html("复盘数据已经存在").addClass("tips-fail").fadeIn(300).delay(1000).fadeOut(1000);
				// }else{
					$review.push({
						name:name,
						time:"",
						tip:"",
						id:randomID()
					})
					setLocal("AnalysisData2",$review);
					$("#tipsBox").html(`已添加 "${name}" 到上涨复盘数据`).removeClass("tips-fail").fadeIn(300).delay(1000).fadeOut(1000);
				// }
			});
			
			//添加到定点复盘储存-承接
			$(".chart-container").on("click", ".chart-box .review2", function() {
				const name = $(this).siblings('.symbol-name').text();
				let $review= getLocal("AnalysisData4");
				// if ($review.findIndex(trade => trade.name == name) > -1) {
				//   $("#tipsBox").html("复盘数据已经存在").addClass("tips-fail").fadeIn(300).delay(1000).fadeOut(1000);
				// }else{
					$review.push({
						name:name,
						time:"",
						tip:"",
						id:randomID()
					})
					setLocal("AnalysisData4",$review);
					$("#tipsBox").html(`已添加 "${name}" 到下跌复盘数据`).removeClass("tips-fail").fadeIn(300).delay(1000).fadeOut(1000);
				// }
			});
			
			//添加到定点复盘储存-signal
			$(".chart-container").on("click", ".chart-box .signal", function() {
				const name = $(this).siblings('.symbol-name').text();
				let $review= getLocal("AnalysisSignal");
				// if ($review.findIndex(trade => trade.name == name) > -1) {
				//   $("#tipsBox").html("复盘数据已经存在").addClass("tips-fail").fadeIn(300).delay(1000).fadeOut(1000);
				// }else{
					$review.push({
						name:name,
						time:"",
						tip:"",
						id:randomID()
					})
					setLocal("AnalysisSignal",$review);
					$("#tipsBox").html(`已添加 "${name}" 到信号复盘数据`).removeClass("tips-fail").fadeIn(300).delay(1000).fadeOut(1000);
				// }
			});
			
			//添加到定点复盘储存-structure
			$(".chart-container").on("click", ".chart-box .structure", function() {
				const name = $(this).siblings('.symbol-name').text();
				let $review= getLocal("AnalysisStructure");
					$review.push({
						name:name,
						time:"",
						tip:"",
						id:randomID()
					})
					setLocal("AnalysisStructure",$review);
					$("#tipsBox").html(`已添加 "${name}" 到结构复盘数据`).removeClass("tips-fail").fadeIn(300).delay(1000).fadeOut(1000);
				// }
			});
			
			
			//添加到定点复盘储存-stairs
			$(".chart-container").on("click", ".chart-box .stairs", function() {
				const name = $(this).siblings('.symbol-name').text();
				let $review= getLocal("AnalysisStairs");
					$review.push({
						name:name,
						time:"",
						tip:"",
						id:randomID()
					})
					setLocal("AnalysisStairs",$review);
					$("#tipsBox").html(`已添加 "${name}" 到结构复盘数据`).removeClass("tips-fail").fadeIn(300).delay(1000).fadeOut(1000);
				// }
			});
			//获取实时日期 => 20260124
			function getToday() {
			  const now = new Date();
			  return now.getFullYear().toString() + 
			         String(now.getMonth() + 1).padStart(2, '0') + 
			         String(now.getDate()).padStart(2, '0');
			}
			
			// 启动定时刷新
			function startAutoRefresh() {
			    // 先立即刷新一次
			    refreshAllCharts();
			    
			    // 然后每分钟刷新一次
					// setInterval(refreshAllCharts, 60000);
			    
			}
			
			// 刷新所有图表数据
			function refreshAllCharts() {
				console.log("准备刷新")
				if(Object.keys(charts).length>0){
					console.log("刷新中")
					Object.keys(charts).forEach(symbol => {
						fetchKlineDataX(symbol, charts[symbol].interval);
						// fetchCurrentPrice(symbol);
					});
				}else{
					console.log("刷新空")
				}
			    
			}
			
			// 添加图表函数
			function addChart(symbol,msgKey) {
				let time;
				let signal;
				let msg="";
				if (typeof symbol === 'object' ) {
					 if(symbol.time){
						 time=symbol.time
					 }
					 if(symbol.signal){
					 	signal=symbol.signal
					 }
					if(msgKey){
						msg=symbol[msgKey];				 
					}
					symbol=symbol.symbol
				}
				

				
				
				var positionArr=allSymbolsArr.indexOf(symbol)+1;
				var totalnum=allSymbolsArr.length;
			    const chartId = `chart-${symbol}`;
				if($("#"+chartId).length>0){
					return;
				}
				
				var widthClass=$("#width").prop('checked')?"width50":"width100";
				
			    const chartBox = $(`
			        <div class="chart-box ${widthClass}" id="${chartId}" data-name="${symbol}">
			            <div class="chart-header">
			                <div class="symbol-info show-pc">
								
			                    <span class="symbol-name" data-symbol="${symbol}">${symbol}</span>
								<a class="coinglass" href="https://www.coinglass.com/tv/zh/Binance_${symbol}" target="_blank">></a>
								<span class="position">${positionArr}</span>
								<input type="checkbox" name="save-${symbol}" class="save" />
								<span class="label2">日</span>
								<input type="checkbox" name="monitor-${symbol}" class="monitor" />
								<span class="label2">监</span>
								<input type="checkbox" name="review-${symbol}" class="review" />
								<span class="label2">涨</span>
								
								<input type="checkbox" name="signal-${symbol}" class="signal" />
								<span class="label2">Sg</span>
								<input type="checkbox" name="signal-${symbol}" class="structure" />
								<span class="label2">构</span>
								<input type="checkbox" name="signal-${symbol}" class="stairs" />
								<span class="label2">梯</span>
								<input type="checkbox" name="review2-${symbol}" class="review2" />
								<span class="label2">承</span>
								
			                    <div class="price-info">
			                        <span class="price" id="price-${symbol}" style="display:none">--</span>
			                        <span class="price-change" id="change-${symbol}" style="display:none">--</span>
			                    </div>
								
								
			                </div>
							<div class="msg-info">
								<span class="symbol-msg">${msg}</span>
							</div>
			                <div class="time-intervals">
			                    ${intervals.map(interval => `
			                        <button class="interval-btn ${interval.value==$("#chooseTime").val() ? 'active' : ''}" data-symbol="${symbol}" data-interval="${interval.value}">${interval.text}</button>
			                    `).join('')}
			                </div>
			            </div>
			            <div class="chart-content"></div>
			        </div>
			    `);
			    // AnalysisData4
			    // 添加到图表容器（越新的币种越后）
			    $('#chartContainer').append(chartBox);
			    
			    // 初始化图表
			    const chartDom = $(`#${chartId} .chart-content`)[0];//echarts.init($("#chart-NAORISUSDT .chart-content")[0]);			
				let old = echarts.getInstanceByDom(chartDom);
				if (old) {
				    old.dispose();
				}
			    const myChart = echarts.init(chartDom);
				
				chartArr.push(myChart);
				
				
				//标记时间点
				if(time){
					const $chart=echarts.getInstanceByDom(chartDom);
					setTimeout(function(){
						addMarkPointInside($chart,time,signal)
					},1000)
					
					
				}
				
				
				//某根K线点击事件
				myChart.on('click', function (params) {
					// 只处理K线
					if (params.seriesType !== 'candlestick') return
					// console.log(params)
					const kline={
						open:params.data[1],
						close:params.data[2],
						low:params.data[3],
						high:params.data[4]
					}
					const obj=lineObj(kline);
					console.log(obj)
					const str="实体:"+obj.middle_all+"_"+"下线:"+obj.down_all;
					$("#msg").html(str)
				})
			    
			    // 默认设置
			    charts[symbol] = {
			        instance: myChart,
			        interval: kedu, // 默认1h时间间隔
			        data: null,
			        lastPrice: null,
			        priceChange: null,
			        dataZoom: [{ startValue: 100, endValue: 199 }] // 默认显示50根K线(200-150=50)
			    };
				// console.log(kedu)
			    
			    // 绑定时间间隔切换事件
			    $(`#${chartId} .interval-btn`).click(function() {
			        const symbol = $(this).data('symbol');
			        const interval = $(this).data('interval');
			        
			        // 更新选中状态
			        $(`#${chartId} .interval-btn`).removeClass('active');
			        $(this).addClass('active');
			        
			        // 更新图表间隔
			        charts[symbol].interval = interval;
			        
			        fetchKlineDataX(symbol, interval);
			    });
			    
			    // 绑定币种名称点击事件（跳转币安官网）
			    $(`#${chartId} .symbol-name`).click(function() {
			        const symbol = $(this).data('symbol');
			        window.open(`https://www.binance.com/zh-CN/futures/${symbol}`, '_blank');
			    });
			    
			    // 加载初始数据
			    // fetchKlineDataX(symbol, kedu);
				fetchKlineDataX(symbol, $("#chooseTime").val());
				
				
			    // fetchCurrentPrice(symbol);
			    
			    // 调整图表大小
			    // window.addEventListener('resize', function() {
			    //     myChart.resize();
			    // });
			}
			
			window.addEventListener('resize', function() {
			    Object.values(charts).forEach(c => {
			        if (c.instance) {
			            c.instance.resize();
			        }
			    });
			});
			
			// 获取K线数据
			function fetchKlineDataX(symbol, interval) {
				// console.log(totalCount)
				// console.log(symbol,interval)
				// console.log("正在请求"+totalCount)
			    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${totalCount}`;
			    // console.log(url,"++++")
			    $.ajax({
			        url: url,
			        method: 'GET',
			        dataType: 'json',
			        timeout: 10000,
			        beforeSend: function() {
			            const chart = charts[symbol].instance;
			            chart.showLoading({
			                text: '加载中...',
			                color: '#0ecb81',
			                textColor: '#e0e0e0',
			                maskColor: 'rgba(0, 0, 0, 0.3)'
			            });
			        },
			        success: function(data) {
			            if (data && data.length > 0) {
			                processKlineData(symbol, data);
							//console.log(data)
			            } else {
			                throw new Error('返回数据为空');
			            }
			        },
			        error: function(xhr, status, error) {
			            console.error(`获取 ${symbol} K线数据失败:`, error);
			            charts[symbol].instance.hideLoading();
			            
			            // 显示错误信息
			            $(`#price-${symbol}`).html(`
			                <span class="error-message">数据加载失败: ${error}</span>
			            `);
			        }
			    });
			}
			
			function fillArr(rawData,minNum,direction){
				var len=rawData.length;
				//len 能请求到的数量   min展示最少的数量  total 要求请求的数量
				if(len<minNum && len<totalCount){
					if(len>1){
						var addtime=rawData[len-1].timestamp-rawData[len-2].timestamp;
						if(direction=="front"){
							var firstKtime=rawData[0].timestamp;
							var neednum=minNum-len;
							var frontArr=[];
							var price=rawData[0].open;
							for (var i = 1; i < neednum; i++) {
								frontArr.push({
									timestamp:firstKtime-addtime*i,
									// open:price,
									// high:price,
									// close:price,
									// low:price,
									// changePercent:0,
									// volume:0,
									// turnover:0,
									// color:"#ef4e63"
								});
							}
							rawData=frontArr.reverse().concat(rawData)
						}else if (direction=="end"){
							var lastKtime=rawData[len-1].timestamp;
							var price=rawData[len-1].close;
							var neednum=minNum-len;
							for (var i = 1; i < neednum; i++) {
								rawData.push({
									timestamp:lastKtime+addtime*i,
									// open:price,
									// high:price,
									// close:price,
									// low:price,
									// changePercent:0,
									// volume:0,
									// turnover:0,
									// color:"#ef4e63"
								})
							}
						}
					}else{
						// var addtime=transtime($("#timeframe").val());
						return rawData;
					}
					
					
				}
				// console.log(rawData)
				return rawData;
			}
			
			//将5m 1h转时间戳
			function transtime(str){
				const num= parseInt(str);
				const unit = str.slice(-1);
				const trans = { 
				    'm': 60 * 1000, 
				    'h': 60 * 60 * 1000, 
				    'd': 24 * 60 * 60 * 1000, 
				    'w': 7 * 24 * 60 * 60 * 1000 
				};
				return num*trans[unit];
			}
			// 处理K线数据
			function processKlineData(symbol, rawData) {
				
				// var aaa=combineK(rawData, 5);
				// console.log(aaa)
				// console.log("option")
			    const chart = charts[symbol];
			    const upColor = '#39d566';//'#18BE4C';
			    const downColor =  '#ef4e63';//'#FB2242';
			    
			    // 转换数据格式
			    var klineData = rawData.map(item => {
			        const open = parseFloat(item[1]);
			        const close = parseFloat(item[4]);
					const high = parseFloat(item[2]);
					const low = parseFloat(item[3]);
			        const changePercent = ((close - open) / open * 100).toFixed(2);
					const wavePercent=((high - low) / low * 100).toFixed(2);
			        return {
			            timestamp: item[0],//时间戳
			            open: open,
			            close: close,
			            low: parseFloat(item[3]),
			            high: parseFloat(item[2]),
			            volume: parseFloat(item[5]),
			            turnover: parseFloat(item[7]),
			            color: open > close ? downColor : upColor,
			            changePercent: changePercent,
						wavePercent:wavePercent
			        };
			    });
				// console.log(klineData.length)
			    
			    // 存储最新价格
			    const lastKline = klineData[klineData.length - 1];
			    chart.lastPrice = lastKline.close;
			    // updatePriceDisplay(symbol, lastKline.close, lastKline.open);
			   klineData=fillArr(klineData,100,"front");
			   
			   //构建完 klineData 后，计算最高成交量对应的成交额
			   var maxVolumeTurnover = '';
			   var maxVolume = -Infinity;
			   for (var i = 0; i < klineData.length; i++) {
			       if (klineData[i].volume > maxVolume && klineData[i].turnover !== undefined) {
			           maxVolume = klineData[i].volume;
			           maxVolumeTurnover = klineData[i].turnover;
			       }
			   }
				 // fillArr(klineData,200,"end")
			    // 准备ECharts数据
			    const dates = klineData.map(item => {
			        const date = new Date(item.timestamp);
			        return date.toLocaleString('zh-CN', {
			            year: 'numeric',
			            month: '2-digit',
			            day: '2-digit',
			            hour: '2-digit',
			            minute: '2-digit',
			            second: '2-digit',
			            hour12: false
			        })//.replace(/\//g, '-');
			    });
				// console.log(klineData)
				// console.log("x轴时间")
				// console.log(dates);  //echart时间格式=> "2025-11-03 06:00:00"
			    
			    // 计算要显示的K线数量（最多50根）
			    const totalKlines = klineData.length;
			    const showKlines = Math.min($("#numK").val(), totalKlines);
			    const startValue = totalKlines - showKlines;
			    const endValue = totalKlines - 1;
			    
			    // 设置图表选项（K线图和交易量图在同一option中）
			    const option = {
			        backgroundColor: '#15161a',
					graphic: [{
					    type: 'text',
					    z: 0,                // 放在最底层
					    silent: true,
					    left: 'center',
					    top: 'top',
					    style: {
					        text: symbol,
					        fill: 'rgba(255,255,255,0.6)',
					        fontSize: 50
					    }
					}],
			        animation: false,
			        tooltip: {
			            trigger: 'axis',
			            axisPointer: {
			                type: 'cross',
			                label: {
			                    backgroundColor: '#6a7985'
			                }
			            },
						// backgroundColor:"rgba(255,255,255,0.2)",
			            backgroundColor: 'rgba(0,0,0,0.7)',
			            borderColor: '#333',
						padding:[2,2],
			            textStyle: {
			                color: '#e0e0e0',
							fontSize:14
			            },  
						position: function (point, params, dom, rect, size) {
							let x = point[0] - 100;
							let y = point[1] - 90;
					
							// 防止超出左/上边界
							x = Math.max(0, x);
							y = Math.max(0, y);
					
							return [x, y];
						},
			            formatter: function(params) {
							// console.log(params);
							if(params[0].data[1]){
								const data = params[0].data;
								const kline = klineData[params[0].dataIndex];
								// console.log(params)
								return [
									// '开盘: ' + kline.open.toFixed(4) + '<br/>',
									// '收盘: ' + data[1] + '<br/>',
									// '最低: ' + data[2] + '<br/>',
									// '最高: ' + data[3] + '<br/>',
									"<span class='ctips3'>涨:</span> <span class='ctips'>"+kline.changePercent + '%</span>',
									"<span class='ctips3'>振:</span> <span class='ctips'>"+kline.wavePercent + '%</span><br/>',
									"<span class='ctips3'>量:</span> <span class='ctips'>"+energyback(kline.volume.toFixed(2)) + "</span><span class='ctips3'>; 额:</span> <span class='ctips'>"+energyback(kline.turnover.toFixed(2)) + "</span><br/>",
									"<span class='ctips2'>"+params[0].axisValue.split(" ")[0] + '</span><br/>',
									"<span class='ctips2'>"+params[0].axisValue.split(" ")[1]+ '</span>'
								].join('');
							}
			                
			            }
			        },
			        axisPointer: {
			            link: { xAxisIndex: 'all' },
			            label: {
			                backgroundColor: '#6a7985'
			            }
			        },
			        grid: [
			            {
			                left: '1%',
			                right: '6%',
			                top: '5%',
			                height: '60%',
			                bottom: '45%',
			            },
			            {
			                left: '1%',
			                right: '6%',
			                top: '60%',
			        		bottom:"5%",
			                // height: '28%'
			            }
			        ],
			        xAxis: [
			            {
			                type: 'category',
			                data: dates,
			                scale: true,
			                boundaryGap: false,
			                axisLine: { onZero: false },
			                splitLine: { show: false },
			                splitNumber: 20,
			                min: 'dataMin',
			                max: 'dataMax',
			                axisLabel: {
			                    color: '#999',
			                    fontSize: 12,
			                    show: false
			                },
			                axisLine: {
			                    lineStyle: {
			                        color: '#444'
			                    }
			                },
							axisPointer: {
							    label: {
							      show: false // 隐藏 X 轴浮框
							    }
							}
			            },
			            {
			                type: 'category',
			                gridIndex: 1,
			                data: dates,
			                scale: true,
			                boundaryGap: false,
			                axisLine: { onZero: false },
			                axisTick: { show: false },
			                splitLine: { show: false },
			                axisLabel: {
			                	color: '#fff',
			                	fontSize: 12,
			                	formatter:function(e){
			                		if(e[0]=="2"){
			                			const arr=e.split(" ");
			                			const date=arr[0].split("/");
			                			const time=arr[1].split(":");
			                			return date[1]+"/"+date[2]+" "+time[0]+":"+time[1]
			                		}
			                		
			                	}
			                },
			                axisLine: {
			                    lineStyle: {
			                        color: '#444'
			                    }
			                },
							axisPointer: {
							    label: {
							      show: false // 隐藏 X 轴浮框
							    }
							}
			            }
			        ],
			        yAxis: [
			            {
			                scale: true,
							position: 'right',
							splitNumber: 5,
			                splitArea: {
			                    show: true,
			                    areaStyle: {
			                        color: ['rgba(255,255,255,0.02)', 'rgba(0,0,0,0)']
			                    }
			                },
			                axisLabel: {
			                    color: '#fff',
			                    fontSize: 14,
								margin:7
			                    // inside: true
			                },
			                splitLine: {
			                    lineStyle: {
			                        color: '#181A20'
			                    }
			                },
			                axisLine: {
			                    lineStyle: {
			                        color: '#444'
			                    }
			                },
							 axisPointer: {
								 // show:false,
							      label: {
							        // 设置文字样式
							        textStyle: {
							          color: '#82e821',      // 文字颜色
							          fontSize: 16,   
										  // fontWeight:"bold"// 字体大小
							        },
							        // 设置背景颜色和边框
							        backgroundColor: 'rgba(0,0,0,0.9)', // 背景色
							        padding: [5, 1],    // 上下为8px，左右为12px
									formatter:function(params){
										
										var price20=params.value*0.8;
										var first=parseInt((params.value-chart.lastPrice)/chart.lastPrice*1000)/10+"%"
										var second=+parseInt((chart.lastPrice-params.value)/params.value*1000)/10+"%"
										// return first+"\n"+second
										return xNum(params.value,3)+"\n"+xNum(price20,3)+"\n"+first+"\n"+second
									}
							    },
							},
						},
			            {
			                scale: true,
							position: 'right',
			                gridIndex: 1,
			                splitNumber: 2,
			                // axisLabel: { show: false },
							axisLabel: {
							    color: '#b4b0a5',
							    fontSize: 12,
								zIndex:1111,
								margin:7,
							    // inside: true,
								formatter:function(value){
									return energyback(value)
								}
							},
			                axisLine: { show: false },
			                axisTick: { show: false },
			                splitLine: { show: false },
							 axisPointer: {
								 show:false,
							      label: {
							        // 设置文字样式
							        textStyle: {
							          color: '#e9ffab',      // 文字颜色
							          fontSize: 12,       // 字体大小
							        },
							        // 设置背景颜色和边框
							        backgroundColor: 'rgba(0,0,0,0.5)', // 背景色
							        padding: [1, 1],    // 上下为8px，左右为12px
							    },
							},
			            }
			        ],
			        dataZoom: [
			            {
			                type: 'inside',
			                xAxisIndex: [0, 1],
			                startValue: startValue,
			                endValue: endValue,
			                filterMode: 'filter',
			                zoomLock: false
			            }
			        ],
			        series: [
			            {
			                name: "symbol",
			                type: 'candlestick',
							barWidth: '80%',
			                data: klineData.map(item => {
			                    return [item.open, item.close, item.low, item.high];
			                }),
							
							
			                itemStyle: {
			                    color: upColor,
			                    color0: downColor,
			                    borderColor: upColor,
			                    borderColor0: downColor,
			                    borderWidth: 1
			                },
			                // barWidth: '60%',
			                // barCategoryGap: '20%',
							markLine: {
								silent: true,        // 不响应鼠标事件（非常重要）
								symbol: 'none',      // 不要两端的小箭头
								lineStyle: {
								    type: 'dashed',    // 虚线
								    width: 1,
								    color: 'rgba(255,255,0,0.3)'
								},
								label: {
								    show: true,
								    position: 'end',
								    formatter: chart.lastPrice,
								    color: '#ff0',
									// fontWeight:"bold",
								    backgroundColor: 'rgba(0,0,0,1)',
								    padding: [5,0],
									fontSize:14,
									formatter:function(params){
										// console.log(num)
										return xnumn(params.value)
									}
								},
								data: [{
									yAxis: chart.lastPrice.toFixed(10)
								}]
							}
			            },
			            {
			                name: '成交量',
			                type: 'bar',
							barWidth: '80%',     // 关键
							 barGap: '0%',        // ❗不要留缝
							 barCategoryGap: '0%', // ❗类目之间不留空
			                xAxisIndex: 1,
			                yAxisIndex: 1,
			                data: klineData.map((item, index) => {
			                    return {
			                        value: item.volume,
									// value:item.turnover,
			                        itemStyle: {
			                            color: item.color
			                        }
			                    };
			                }),
							//显示柱子代表的最高价
							// markPoint: {
							// 	data: [
							// 	  {
							// 		type: 'max', // 自动识别最大值
							// 		name: '最高值', // 显示的标签名称
							// 		symbol: 'arrow',
							// 		symbolSize: 0.5,
							// 		label:{
							// 			color: '#fff',
							// 			position: 'top',  // 在标记点上方显示
							// 			formatter:function(params){
							// 				console.log(params)
							// 				return energyback((params.value).toFixed(2));
											
											
							// 			}
							// 		}
							// 	  }
							// 	]
							//   },
							  //显示对应的成交额
							  markPoint: {
							      data: [
							          {
							              type: 'max', // 自动识别最大值
							              name: '最高值',
							              symbol: 'arrow',
							              symbolSize: 0.5,
							              label:{
							                  color: '#fff',
							                  position: 'top',
							                  formatter: function(params) {
												  return energyback(maxVolumeTurnover.toFixed(2));
							                  }
							              }
							          }
							      ]
							  }
			                // barWidth: '60%',
			                // barCategoryGap: '20%'
			            }
			        ]
			    };
				
			    chart.instance.setOption(option);
			    chart.instance.hideLoading();
			    chart.data = klineData;
			    
			    // 监听数据缩放事件
			    chart.instance.on('dataZoom', function(params) {
			        let zoomData;
			        
			        if (params.batch) {
			            zoomData = params.batch.map(item => ({
			                startValue: item.startValue,
			                endValue: item.endValue
			            }));
			        } else {
			            zoomData = [{
			                startValue: params.startValue,
			                endValue: params.endValue
			            }];
			        }
			        
			        charts[symbol].dataZoom = zoomData;
			    });
			}
			
			// 获取当前价格
			function fetchCurrentPrice(symbol) {
				// console.log("price")
			    const url = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`;
			    
			    $.ajax({
			        url: url,
			        method: 'GET',
			        dataType: 'json',
			        timeout: 5000,
			        success: function(data) {
			            const price = parseFloat(data.price);
			            updatePriceDisplay(symbol, price);
			        },
			        error: function(xhr, status, error) {
			            console.error(`获取 ${symbol} 当前价格失败:`, error);
			        }
			    });
			}
			
			// 更新价格显示
			function updatePriceDisplay(symbol, currentPrice, openPrice) {
			    const chart = charts[symbol];
			    if (!chart) return;
			    
			    if (chart.lastPrice) {
			        const change = currentPrice - chart.lastPrice;
			        const changePercent = (change / chart.lastPrice * 100).toFixed(2);
			        
			        $(`#price-${symbol}`).text(currentPrice.toFixed(4));
			        $(`#change-${symbol}`).html(`
			            <span class="${change >= 0 ? 'price-up' : 'price-down'}">
			                ${change >= 0 ? '+' : ''}${change.toFixed(4)} (${changePercent}%)
			            </span>
			        `);
			    } else {
			        $(`#price-${symbol}`).text(currentPrice.toFixed(4));
			        $(`#change-${symbol}`).text('--');
			    }
			    
			    chart.lastPrice = currentPrice;
			}
			function energy(str){
				var num=parseInt(str);
				if (str.indexOf("K")>-1){
					return 1000*num;
				}else if(str.indexOf("M")>-1){
					return 1000000*num;
				}else if(str.indexOf("B")>-1){
					return 1000000000*num;
				}
			}
			function energyback(num){
				var aaa=num;
				if (typeof value !== 'number') {
				        aaa=Number(aaa);
				    }
				
				if(num/1000000000>=1){
					return parseInt(num/100000000)/10+"B";
				}else if(num/1000000>=1){
					return parseInt(num/1000000)+"M";
				}else if(num/1000>=1){
					return parseInt(num/1000)+"K"
				}else{
					return num
				}
			}
			
			function riseLine(kline,way){
				var lineRatio=0;
				if(way=="up"){
					lineRatio=(kline.high-kline.close)/(kline.close-kline.open)
				}else if(way=="down"){
					lineRatio=(kline.open-kline.low)/(kline.close-kline.open)
				}
				return lineRatio;
			}
			
			function chartTips(tdidx){
				setTimeout(function(){
					$(".chart-box").each(function(idx,item){
						//显示关键时间点
						var datex=$("table tr").eq(idx+1).find("td").eq(tdidx).html()
						// console.log(datex)
						// $(item).find(".price-up").html("关键时间："+datex);
						
						//标记关键K线
						// var $chart = echarts.init(($(this).children(".chart-content"))[0]);
						var dom = ($(this).children(".chart-content"))[0];
						var $chart = echarts.getInstanceByDom(dom);
						// console.log($chart)
						if (!$chart) return;
						
						$chart.setOption({
							series: [{
								markPoint: {
									data: [{
										coord: [datex, 'max'] ,
										y: '5%',                // 相对图表底部位置
										symbol: 'arrow',
										symbolSize: 8,
										symbolRotate: 180, 
										itemStyle: { color: 'yellow'},
										label: { color: '#fff',  formatter: '' }
									}]
								}
							}]
						});
						
					})
				},2500)
			}
			
			function chartTips2($table,tdidx){
				setTimeout(function(){
					$(".chart-box").each(function(idx,item){
						//显示关键时间点
						var datex=$table.find("tr").eq(idx+1).find("td").eq(tdidx).html()
						// console.log(datex)
						// $(item).find(".price-up").html("关键时间："+datex);
						
						//标记关键K线
						// console.log(($(this).children(".chart-content"))[0])
						// var $chart = echarts.init(($(this).children(".chart-content"))[0]);
						
						var dom = ($(this).children(".chart-content"))[0];
						var $chart = echarts.getInstanceByDom(dom);
						if (!$chart) return;
						// console.log($chart)
						$chart.setOption({
							series: [{
								markPoint: {
									data: [{
										coord: [datex, 'max'] ,
										y: '5%',                // 相对图表底部位置
										symbol: 'arrow',
										symbolSize: 8,
										symbolRotate: 180, 
										itemStyle: { color: 'yellow'},
										label: { color: '#fff',  formatter: '' }
									}]
								}
							}]
						});
						
					})
				},2500)
			}
			
			function addMarkPoint(symbol,time){
				setTimeout(function(){
					//设置标记点
					var dom = ($("#chart-"+symbol).children(".chart-content"))[0];
					var $chart = echarts.getInstanceByDom(dom);
					if (!$chart) return;
					const datex=formatTimex(time)//"2026/03/30 11:45:00";
					$chart.setOption({
						series: [{
							markPoint: {
								data: [{
									coord: [datex, 'max'] ,
									y: '5%',                // 相对图表底部位置
									symbol: 'arrow',
									symbolSize: 10,
									symbolRotate: 180, 
									itemStyle: { color: '#b3ff00'},
									label: { color: '#fff',  formatter: '' }
								}]
							}
						}]
					});
				},200)
			}
			
			function addMarkPointInside($chart,time,signal){
				
					const datex=formatTimex(time)//"2026/03/30 11:45:00";
					// console.log(time,new Date(time),datex)
					$chart.setOption({
						series: [{
							markPoint: {
								data: [{
									coord: [datex, 'max'] ,
									y: '5%',                // 相对图表底部位置
									symbol: 'arrow',
									symbolSize: 10,
									symbolRotate: 180, 
									itemStyle: { color: '#b3ff00'},
									label: {
										color: '#fff',
										formatter: function(params) {
											// 直接使用外部传入的 signal 变量
											return signal;
										},
										// 可选：调整标签位置和样式
										 position: 'top',    // 关键：文字在符号上方
										offset: [0, 0],   // 关键：向上偏移10像素
										fontSize: 16,
										backgroundColor: 'rgba(0,0,0,0.5)',
										padding: [0,0]
									}
								}]
							}
						}]
					});
			}
			
			function test(){
				var sss=($("#chart-TRBUSDT").children(".chart-content"))[0];
				var yyy = echarts.init(sss);
				var  tar='2025-11-11 14:00:00'
				var datay = yyy.getOption().xAxis[0].data;
				if (datay.includes(tar)) {
					console.log(1111);
				}else{
					  alert()
				};
				yyy.setOption({
					series: [{
						markPoint: {
							data: [{
								coord: [tar, 'max'] ,
								y: '10%',                // 相对图表底部位置
								symbol: 'arrow',
								symbolSize: 10,
								symbolRotate: 180, 
								itemStyle: { color: 'yellow'},
								label: { color: '#fff',  formatter: '' }
							}]
						}
					}]
				});
			}
			function formatTimex(timestamp) {
			    const date = new Date(timestamp); 
			    const year = date.getFullYear();
			    const month = (date.getMonth() + 1).toString().padStart(2, '0');
			    const day = date.getDate().toString().padStart(2, '0');
			    const hours = date.getHours().toString().padStart(2, '0');
			    const minutes = date.getMinutes().toString().padStart(2, '0');
			    const seconds = date.getSeconds().toString().padStart(2, '0');
			    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
			}
			
			function xnumn(num) {
				num=Number(num)
			    // 处理边界情况
			    if (num === 0) return '0';
			    if (!num || isNaN(num)) return 'NaN';
			    
			    // 检查是否为整数
			    if (Number.isInteger(num)) {
			        return num.toString();
			    }
			    
			    // 对于小数，保留两位有效数字
			    return num.toPrecision(3);
			}
			
			//showUnit($("#klineInterval"),$('#klineLimit'),$("#res"))
			function showUnit($dom_interval1,$dom_num,$dom_interval3){
				$dom_interval1.change(function(){
					combineUnit($dom_interval1,$dom_num,$dom_interval3)
				});
				$dom_num.on('input', function() {
					combineUnit($dom_interval1,$dom_num,$dom_interval3)
				});
				$dom_interval1.trigger("change")
				
			}
			function combineUnit($dom_interval1,$dom_num,$dom_interval3){
				var val=$dom_interval1.val();
				var unit=val.slice(-1);
				var a=parseInt(val),b=parseInt($dom_num.val());
				$dom_interval3.html(timeUnit((a*b+unit),2))
			}
			function timeUnit(timeStr, decimalPlaces = 2) {
			    function convertToMinutes(inputStr) {
			        let totalMinutes = 0;
			        const regex = /(\d+)([hm])/gi;
			        let match;
			        
			        while ((match = regex.exec(inputStr)) !== null) {
			            const value = parseInt(match[1]);
			            const unit = match[2].toLowerCase();
			            
			            if (unit === 'h') totalMinutes += value * 60;
			            else if (unit === 'm') totalMinutes += value;
			        }
			        return totalMinutes;
			    }
			    
			    const totalMinutes = convertToMinutes(timeStr);
			    const hours = totalMinutes / 60;
			    const days = totalMinutes / (60 * 24);
			    
			    return `${totalMinutes}分钟 / ${hours.toFixed(decimalPlaces)}小时 / ${days.toFixed(decimalPlaces)}天`;
			}
			
			function getLocal(key){
				return JSON.parse(localStorage.getItem(key))
			}
			
			function setLocal(key,data){
				localStorage.setItem(key,JSON.stringify(data))
			}
			
			function removeLocal(key){
				localStorage.removeItem(key)
			}
			// 处理复选框点击事件
			function localCheck($dom_interval,key) {
				// const $checkbox = $(this);
				const symbol = $dom_interval.next('.symbol-name').text();
				let localSymbolsArr = getLocal(key);
			
				if ($dom_interval.is(':checked')) {
					// 如果符号不在数组中，则添加
					if (!localSymbolsArr.includes(symbol)) {
						localSymbolsArr.push(symbol);
						console.log(`已添加 "${symbol}" 到本地存储`);
					}
				} else {
					// 如果符号在数组中，则移除
					const index = localSymbolsArr.indexOf(symbol);
					if (index !== -1) {
						localSymbolsArr.splice(index, 1);
						console.log(`已从本地存储移除 "${symbol}"`);
					}
				}
			
				// 保存更新后的数组到本地存储
				setLocal(key,localSymbolsArr);
				console.log('当前本地存储内容:', localSymbolsArr);
			}
			
			// 恢复之前保存的选中状态
			function autoRecheck(key) {
				const localSymbolsArr = getLocal(key);
				$('.save').each(function() {
					const symbol = $(this).next('.symbol-name').text();
					if (localSymbolsArr.includes(symbol)) {
						$(this).prop('checked', true);
					}
				});
			}
			//保留3位非0数字
			function xNum(numStr) {
			    
			    // 尝试将字符串转换为数字
			    const number = parseFloat(numStr);
			    
			    // 检查转换结果是否为有效数字
			    if (isNaN(number)) {
			       return;
			    }
			    // 判断是否为整数
			    if (Number.isInteger(number)) {
			        return number//.toString();
			    }
			    
			    // 对于小数，保留三位有效数字
			    // 使用toPrecision方法指定有效数字位数[6,7](@ref)
			    let result = number.toPrecision(3);
			    
			    // 移除可能存在的末尾小数点（例如将"123."转换为"123"）
			    if (result.endsWith('.')) {
			        result = result.slice(0, -1);
			    }
			    return result;
			}
			
			

			//无论涨跌：输出k线上影线+实体+下影线三部分比例
			function lineObj(k){
				let part;
				let direction;
				if(k.close>k.open){
					direction="up";
					part={
						up:k.high-k.close,
						middle:k.close-k.open,
						down:k.open-k.low,
						all:k.high-k.low
					}
				}else{
					direction="down"
					part={
						up:k.high-k.open,
						middle:k.open-k.close,
						down:k.close-k.low,
						all:k.high-k.low
					}
				}
				return {
					direction:direction,
					part:part,
					up_all:(part.up/part.all).toFixed(2),
					middle_all:(part.middle/part.all).toFixed(2),
					down_all:(part.down/part.all).toFixed(2),
					down_up:(part.down/part.up).toFixed(2)
				}
			}
			function combineX(klines, interval) {
			    let targetMin = 1;  // 默认改为1
			    
			    if(interval=="1m"){targetMin=1}
			    else if(interval=="5m"){targetMin=5}
			    else if(interval=="15m"){targetMin=15}
			    else if(interval=="30m"){targetMin=30}
			    else if(interval=="1h"){targetMin=60}
			    else if(interval=="2h"){targetMin=120}
			    else if(interval=="4h"){targetMin=240}
				else if(interval=="8h"){targetMin=480}
			    else if(interval=="12h"){targetMin=720}
			    else if(interval=="1d"){targetMin=1440}
			    else if(interval=="1w"){targetMin=10080}
				
			    if (!klines || klines.length === 0) return [];
			    
			    klines.sort((a, b) => a[0] - b[0]);
			    
			    const sourceIntervalMs = klines[0][6] - klines[0][0] + 1;
			    const targetIntervalMs = targetMin * 60 * 1000;
			    
			    // 如果目标周期等于源周期，直接返回原数据（但转换为对象格式,没有删除最后一根未完成K线）
			    // if (targetIntervalMs === sourceIntervalMs) {
			    //     return klines.map(k => ({
			    //         time: k[0],
			    //         open: +k[1],
			    //         high: +k[2],
			    //         low: +k[3],
			    //         close: +k[4],
			    //         volume: +k[5],
			    //         quoteVolume: +k[7],
			    //         count: 1,
			    //         lastCloseTime: k[6]
			    //     }));
			    // }
				// 如果目标周期等于源周期，直接返回原数据（但转换为对象格式,删除最后一根未完成K线）
				if (targetIntervalMs === sourceIntervalMs) {
				    let data = klines;
				    
				    // 判断最后一根是否已完成：收盘时间 < 当前时间
				    const lastK = klines[klines.length - 1];
				    if (lastK[6] >= Date.now()) {
				        // 最后一根未完成，去掉它
				        data = klines.slice(0, -1);
				    }
				    
				    return data.map(k => ({
				        time: k[0],
				        open: +k[1],
				        high: +k[2],
				        low: +k[3],
				        close: +k[4],
				        volume: +k[5],
				        quoteVolume: +k[7],
				        count: 1,
				        lastCloseTime: k[6]
				    }));
				}
			    
			    if (targetIntervalMs % sourceIntervalMs !== 0) {
			        // console.warn(interval+'不是源周期的整数倍');
			        return [];
			    }
			    
			    const needCount = targetIntervalMs / sourceIntervalMs;
			    const now = Date.now();
			    
			    const map = new Map();
			    
			    for (const k of klines) {
			        const openTime = k[0];
			        const keyTime = Math.floor(openTime / targetIntervalMs) * targetIntervalMs;
			        
			        if (!map.has(keyTime)) {
			            map.set(keyTime, {
			                time: keyTime,
			                open: +k[1],
			                high: +k[2],
			                low: +k[3],
			                close: +k[4],
			                volume: +k[5],
			                quoteVolume: +k[7],
			                count: 1,
			                lastCloseTime: k[6]
			            });
			        } else {
			            const bar = map.get(keyTime);
			            bar.high = Math.max(bar.high, +k[2]);
			            bar.low = Math.min(bar.low, +k[3]);
			            bar.close = +k[4];
			            bar.volume += +k[5];
			            bar.quoteVolume += +k[7];
			            bar.count++;
			            bar.lastCloseTime = k[6];
			        }
			    }
			    
			    const completedBars = Array.from(map.values())
			        .filter(bar => {
			            const expectedCloseTime = bar.time + targetIntervalMs - 1;
			            
			            return (
			                bar.count === needCount &&                  // 数量完整
			                bar.lastCloseTime === expectedCloseTime &&  // 小周期严格对齐
			                expectedCloseTime < now                     // 时间已走完
			            );
			        })
			        .sort((a, b) => a.time - b.time);
			    
			    return completedBars;
			}

			//K线聚合
			function combineX_no1m(klines, interval) {
				let targetMin=5;
				if(interval=="5m"){targetMin=5}
				else if(interval=="15m"){targetMin=15}
				else if(interval=="30m"){targetMin=30}
				else if(interval=="1h"){targetMin=60}
				else if(interval=="2h"){targetMin=120}
				else if(interval=="4h"){targetMin=240}
				else if(interval=="8h"){targetMin=480}
				else if(interval=="12h"){targetMin=720}
				else if(interval=="1d"){targetMin=1440}
				else if(interval=="1w"){targetMin=10080}
				
				if (!klines || klines.length === 0) return [];
			
				klines.sort((a, b) => a[0] - b[0]);
			
				const sourceIntervalMs = klines[0][6] - klines[0][0] + 1;
				const targetIntervalMs = targetMin * 60 * 1000;
			
				if (targetIntervalMs % sourceIntervalMs !== 0) {
					// console.warn(interval+'不是源周期的整数倍');
					return [];
				}
			
				const needCount = targetIntervalMs / sourceIntervalMs;
				const now = Date.now();
			
				const map = new Map();
			
				for (const k of klines) {
					const openTime = k[0];
					const keyTime = Math.floor(openTime / targetIntervalMs) * targetIntervalMs;
			
					if (!map.has(keyTime)) {
						map.set(keyTime, {
							time: keyTime,
							open: +k[1],
							high: +k[2],
							low: +k[3],
							close: +k[4],
							volume: +k[5],
							quoteVolume: +k[7],
							count: 1,
							lastCloseTime: k[6]
						});
					} else {
						const bar = map.get(keyTime);
						bar.high = Math.max(bar.high, +k[2]);
						bar.low = Math.min(bar.low, +k[3]);
						bar.close = +k[4];
						bar.volume += +k[5];
						bar.quoteVolume += +k[7];
						bar.count++;
						bar.lastCloseTime = k[6];
					}
				}
			
				const completedBars = Array.from(map.values())
					.filter(bar => {
						const expectedCloseTime = bar.time + targetIntervalMs - 1;
			
						return (
							bar.count === needCount &&                  // 数量完整
							bar.lastCloseTime === expectedCloseTime &&  // 小周期严格对齐
							expectedCloseTime < now                     // 时间已走完
						);
					})
					.sort((a, b) => a.time - b.time);
			
				return completedBars;
			}
			
			
			function randomID(){
				return Math.floor(Math.random() * 90000000) + 10000000;
			}
			
			
			function formatTimeString(timeStr) {
			    const date = new Date(timeStr.replace(' ', 'T'));
			    return date.toISOString().replace('T', ' ').slice(0, 19).replace(/-/g, '/');
			}
			
			//复制文本
			function copy(id) {
			    const $temp = $('<textarea>');
			    $('body').append($temp);
			    $temp.val($('#'+id).text()).select();
			    
			    try {
			        document.execCommand('copy');
			    } catch (e) {
			        console.error('复制失败:', e);
			    }
			    
			    $temp.remove();
			}
			//备份所有local数据
			function backup(){
				// 1. 获取所有 localStorage 数据
				const allData = {};
				for (let i = 0; i < localStorage.length; i++) {
				    const key = localStorage.key(i);
				    let value = localStorage.getItem(key);
				    // 尝试解析 JSON，如果不是 JSON 就保留原始字符串
				    try {
				        value = JSON.parse(value);
				    } catch (e) {}
				    allData[key] = value;
				}
				
				// 2. 转为 JSON 字符串
				const dataStr = JSON.stringify(allData, null, 2); // 格式化缩进 2 空格
				
				// 3. 创建下载链接
				const blob = new Blob([dataStr], { type: "application/json" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = "localStorage_backup.json";
				document.body.appendChild(a);
				a.click();
				
				// 4. 清理
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				
				alert("备份成功")
			}
			
			
			//判断K线是否完成
			function isKlineCompleted(klineData) {
			    if (!klineData || klineData.length === 0) {
			        return true; // 空数组认为已完成
			    }
			    
			    const lastKline = klineData[klineData.length - 1];
			    const closeTime = lastKline[6]; // 索引6是收盘时间
			    const now = Date.now();
			    
			    // 如果收盘时间小于当前时间，说明K线已完成
			    return closeTime < now;
			}
			
			function isMachineKline(klineData,symbol){
				if (!klineData || klineData.length === 0) {
				    return true; // 空数组认为已完成
				}
				const last1=klineData.at(-1);
				
				const arr=[parseFloat(last1[1]),parseFloat(last1[2]),parseFloat(last1[3]),parseFloat(last1[4])];
				const freq = {};
				for (const item of arr) {
					freq[item] = (freq[item] || 0) + 1;
				}
				
				const values = Object.values(freq);
				// if(symbol=="ALICEUSDT"){
				// 	console.log(last1);
				// 	console.log(values.includes(3)||(values.length === 2 && values.every(v => v === 2)))
				// }
				
				// 三个相同的判断
				if (values.includes(3)||(values.length === 2 && values.every(v => v === 2))) {
					return true;
				}
				
				return false;
				// if(last1[1]==last1[3] && last1[2]==last1[4]){
				// 	return true;
				// }
			}
			
			function isMachineKlineReKey(arr) {
			    if (!arr || arr.length === 0) return false;
			
			    const k = arr[arr.length - 1];
			    const values = [k.open, k.close, k.high, k.low];
			
			    // 统计每个值出现次数
			    const countMap = new Map();
			    for (const v of values) {
			        countMap.set(v, (countMap.get(v) || 0) + 1);
			    }
			
			    const counts = Array.from(countMap.values());
			
			    // 情况1：有3个或4个值相同
			    if (counts.some(c => c >= 3)) return true;
			
			    // 情况2：两两相同，即恰好有两组，每组各2个 [2, 2]
			    if (counts.length === 2 && counts.every(c => c === 2)) return true;
			
			    return false;
			}
			
			function calcuPercent(k){
				return (k[4]-k[1])/k[4]
			}
			
			function topTips(str){
				$("#tipsBox").html(str).removeClass("tips-fail").fadeIn(300).delay(1000).fadeOut(1000);
			}
			
			function now_hhmm(){
				const now = new Date();
				let hours = now.getHours();
				let minutes = now.getMinutes();
				
				// 补零格式化
				hours = hours.toString().padStart(2, '0');  // 例如: 9 → "09"
				minutes = minutes.toString().padStart(2, '0');  // 例如: 5 → "05"
				
				// console.log(`当前时间: ${hours}:${minutes}`);
				return hours+":"+minutes
			}
			
			function hhmm(timestamp){
				const now = new Date(timestamp);
				let hours = now.getHours();
				let minutes = now.getMinutes();
				
				// 补零格式化
				hours = hours.toString().padStart(2, '0');  // 例如: 9 → "09"
				minutes = minutes.toString().padStart(2, '0');  // 例如: 5 → "05"
				
				// console.log(`当前时间: ${hours}:${minutes}`);
				return hours+":"+minutes
			}
			function mmddhh(timestamp) {
			    const now = new Date(timestamp);
			
			    const month = (now.getMonth() + 1).toString().padStart(2, '0');
			    const date = now.getDate().toString().padStart(2, '0');
			    const hour = now.getHours().toString().padStart(2, '0');
			
			    return `${month}${date}-${hour}`;
			}
			
			function sortDataByTime(data) {
			    const result = {};
			
			    // 遍历对象的每一个 key
			    for (const key in data) {
			        if (Array.isArray(data[key])) {
			            // 对数组进行排序：按 time 降序（最新到最早）
			            result[key] = data[key].sort((a, b) => b.time - a.time);
			        } else {
			            // 如果不是数组则保持不变
			            result[key] = data[key];
			        }
			    }
			
			    return result;
			}