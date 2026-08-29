// x=500
// 15m:499根
// 30m:249根
// 1h:124根
// 2h:61根
// 4h:30根
// 8h:15根
// 12h:9根
// 1d:4根

// if (item == "1m") { }
// else if (item == "5m") { }
// else if (item == "15m") { }
// else if (item == "30m") { }
// else if (item == "1h") { }
// else if (item == "2h") {  }
// else if (item == "4h") { }
// else if (item == "8h") { }
// else if (item == "12h") { }
// else if (item == "1d") { }

//=====================================================================================小时阶梯信号==
// ###### 阶梯信号，num为A的搜索范围 实际需要数量=pre+num+2

// A必须是阳线，即收盘价大于开盘价。
// A的涨幅必须大于当前周期的预设阈值per（如1m为0.5%，1h为2%）。
// 前方pre根K线中若有阳线，则A的涨幅必须大于它们之中最大的涨幅。
// A之后的2根K线最低价不得低于A的开盘价。A之后两根K线若方向相反，各自涨跌幅绝对值均须小于A涨幅的1/4；若方向相同，两者累计涨跌幅绝对值须小于A涨幅的1/4。
// A之后两根K线的各自振幅（最高减最低）均须小于A振幅的1.2倍。
function x_start0(symbol, item, arr, num) {
	// return;
	if(symbol=="MMTUSDT"){
		console.log(item+":"+arr.length+"根")
	}

	// if (!arr || arr.length < num) {
	// 	return false;
	// }

	let pre = 10;
	let per = 0.01;
	let vol2 = 1000000;
	if (item == "1m") { pre = 10; per = 0.005; vol2 = 10000; }
	if (item == "5m") { pre = 50; per = 0.005; vol2 = 10000; }
	if (item == "15m") { pre = 20; per = 0.005; vol2 = 10000; }
	else if (item == "30m") { pre = 30; per = 0.01; vol2 = 500000; }
	else if (item == "1h") { pre = 10; per = 0.02; vol2 = 500000; }
	else if (item == "2h") { pre = 10; per = 0.02; vol2 = 1000000; }
	else if (item == "4h") { pre = 5; per = 0.02; vol2 = 2000000; }
	else if (item == "8h") { pre = 5; per = 0.02; vol2 = 2000000; }
	else if (item == "12h") { pre = 5; per = 0.02; vol2 = 2000000; }
	else if (item == "1d") { pre = 5; per = 0.02; vol2 = 2000000; }
	else{ pre = 10; per = 0.01; vol2 = 500000; }

	// num 只是 A 的候选区间，不包含 pre
	const klines = arr.slice(-(num + pre + 2));

	// 至少需要：pre(前) + num(候选A) + 2(后)
	if (klines.length < pre + num + 2) {
		console.log("数量不足"+(num + pre + 2)+"："+symbol + " " + item + " " + klines.length)
		return false;
	}
	
	// A 的合法起始索引：从 pre 开始，到倒数第 2 根结束
	for (let i = pre; i < pre + num; i++) {
		let enhance="";
	    const A = klines[i];
		
		if(symbol=="SKYUSDT"&& item=="1d" && A.open==0.04961){
			console.log(1)
		}
		
		
	    // A必须是阳线（上涨K线）======================
	    if (A.close <= A.open) continue;
		
		

				
	    // 取消：A 的成交额必须大于等于 vol2 =========================
	    // if (A.quoteVolume < vol2) continue;
				
	    // A 的涨幅必须大于 per=======================
	    const aChange = (A.close - A.open) / A.open;
	    if (aChange <= per) continue;
				
	    const preKlines = klines.slice(i - pre, i);
		
		// 【新增条件】30m：A的交易量必须 >= 前面20根任意一根的交易量
		if (item == "30m" || item == "15m") {
		    const pre20VolumeMax = Math.max(
		        ...klines.slice(i - 20, i).map(k => k.volume)
		    );
		
		    if (A.volume < pre20VolumeMax) continue;
		}
				
	    // 5m/15m的前提下  A的最高价大于前面任意一根的最高价================================
		// if(item=="5m" || item=="15m"){
		// 	const preHighMax = Math.max(...preKlines.map(k => k.high));
		// 	if (A.high <= preHighMax) continue;
		// }
		
		// 增强 突破前期
		// 	const preHighMax = Math.max(...preKlines.map(k => k.high));
		// 	if (A.close = preHighMax) continue;
		
		
		//信号增强： A的收盘价大于前面任意一根的最高价================================
		const preHighMax = Math.max(...preKlines.map(k => k.close));
		if (A.close >= preHighMax){
			enhance="+";
		}
	   
		
	    // 前面 pre 根中没有阳线，则自动通过此条件==============================
	    let riseFlag = false;
	    let hasUpKline = false;
	    for (const prev of preKlines) {
	        if (prev.close > prev.open) {
	            hasUpKline = true;
	            const prevChange = (prev.close - prev.open) / prev.open;
	            if (aChange > prevChange) {
	                riseFlag = true;
	                break;
	            }
	        }
	    }
	    if (hasUpKline && !riseFlag) continue;
				
	
		//A 之后的两根K线=================================================
	    const aRange = A.high - A.low;
	    const next1 = klines[i + 1];
	    const next2 = klines[i + 2];
		
		// 【新增条件1】A之后的两根K线，最低价不小于A的开盘价
		if (next1.low < A.open) continue;
		if (next2.low < A.open) continue;
				
	    const n1Change = (next1.close - next1.open) / next1.open;
	    const n2Change = (next2.close - next2.open) / next2.open;
				
	    // 判断两根K线的方向
	    const n1IsUp = n1Change > 0;
	    const n2IsUp = n2Change > 0;
	    
	    if (n1IsUp !== n2IsUp) {
	        // 一涨一跌：每根绝对值分别小于 A涨幅的 1/4
	        if (Math.abs(n1Change) >= aChange / 4) continue;
	        if (Math.abs(n2Change) >= aChange / 4) continue;
	    } else {
	        // 两连涨或两连跌：累计涨跌幅绝对值小于 A涨幅的 1/4
	        const totalChange = Math.abs(n1Change + n2Change);
	        if (totalChange >= aChange / 4) continue;
	    }
				
	    //A 之后的两根K线，每根的高低点范围必须小于 A 范围的 1.2 倍=======================
	    const n1Range = next1.high - next1.low;
	    const n2Range = next2.high - next2.low;
	    if (n1Range >= aRange * 1.2) continue;
	    if (n2Range >= aRange * 1.2) continue;

		collect_signal( symbol, item, `0启动`+enhance, A.time);
			
		return true;
	}

	return false;
}



//=====================================================================================分钟阶梯信号==
// A必须是上涨K线（close > open）
// 从A前一根开始向前找，找到最近的M使得A的成交量 ≥ M成交量×R倍（R=8）
// A的成交量必须大于前面pre根到M之间（不含M）每一根的成交量
// A的成交量必须是上述K线成交量平均值的R倍以上
// A之后两根K线的涨跌幅绝对值都必须小于per（1.5%）
// 如果后两根同向（同涨或同跌），还需满足|(next1.open - next2.close)/next2.close| < per
function x_start_mm(symbol, item, arr,num) {
	
	const testMode=false;
	const testTime="20260812 1800";
	const testText=symbol+" "+testTime+" ";
	
	// 周期自适应参数
	let pre = 50;
	if (item === "5m") pre = 25;
	else if (item === "15m") pre = 10;
	
	// num 为A检测范围，不传入则从arr首位+pre开始检测
	if (num === undefined) {
		// 没有传入 num 参数
		num = arr.length - pre;
	}
	if (!arr || arr.length < pre + num) {
		console.log("x_start_mm数据不足"+symbol+" "+item)
	    return false;
	}
	
	//A之后两根涨幅上限
	const per = 0.01; 
	//A成交量相比pre的倍数
	const Rvol = 8;
	//A涨幅相比after的倍数
	const Rper=4;
	
	
	
			
	// 只检查最后 num 个成员作为候选 A
	for (let i = arr.length - num; i < arr.length; i++) {
		//增加检测信号
		let plus="";
		let testTarget=false;
		
		
		const A = arr[i];
		
		//定点测试 可忽略
		if(A.timestamp==strToStamp(testTime)){
			testTarget=true;
		}
			
		// 条件1：A必须是上涨的 成交额大于10K 涨幅大于0.5% ,上影线不超过整体的0.4倍
		const volA = A.volume;
		const perA = (A.close - A.open) / A.open;
		
		if (A.close <= A.open || A.quoteVolume <10000 || perA<0.008 || lineObj(A).up_all>=0.4) continue;
		
		// // 信号增强：判断 A的收盘价大于pre中所有K线的最高价，如果成立 则添加信号+
		let maxHighInPre = -Infinity;
		for (let k = i - pre; k < i; k++) {
		    if (k < 0) continue;
		    if (arr[k].high > maxHighInPre) {
		        maxHighInPre = arr[k].high;
		    }
		}
		if (A.close >= maxHighInPre){
			plus+="+";
		}
		
		// 信号增强：判断A的涨幅比前面pre根中所有上涨K线的涨幅都大，如果成立 则添加信号+
		let isMaxGain = true;
		for (let k = i - pre; k < i; k++) {
			if (k < 0) continue;
			const prevK = arr[k];
			// 只考虑上涨K线
			if (prevK.close > prevK.open) {
				const prevPer = (prevK.close - prevK.open) / prevK.open;
				if (perA <= prevPer) {
					isMaxGain = false;
					break;
				}
			}
		}
		if (isMaxGain) {
			plus+="+";
		}
				
		// 条件2：成交量倍数逻辑
		let foundM = false;
		let mIndex = -1;
				
		// 从A的前一根开始往前找，找到第一个成交量满足 valA >= 其成交量 * Rvol 的K线作为M
		for (let j = i - 1; j >= i - pre; j--) {
			if (j < 0) break;
			if (volA >= arr[j].volume * Rvol) {
				foundM = true;
				mIndex = j;
				break;
			}
		}
				
		if (!foundM){
			if(testMode && testTarget){
				console.log(testText+"=========>> 从A的前一根开始往前找，找到第一个成交量满足 valA >= 其成交量 * Rvol 的K线作为M")
			}
			continue;
		}
	
		
		// 新增条件：从M+1 到A（包括A）的所有K线都必须是上涨K线, 并且成交量不大于A的两倍
		let allUp = true;
		for (let k = mIndex+1; k <= i; k++) {
			if (arr[k].close <= arr[k].open || arr[k].volume / volA >=2) {
				allUp = false;
				break;
			}
		}
		
		if (!allUp) {
			if(testMode && testTarget){
				console.log(testText+"=========>> 从M+1 到A（包括A）的所有K线都必须是上涨K线, 并且成交量不大于A的两倍")
			}
			continue;
		}
				
		// 计算从前面pre根到M之间（不包括M）的所有K线成交量的平均值
		let sumVol = 0;
		let count = 0;
		for (let k = i - pre; k <= mIndex; k++) {
			if (k < 0) continue;
			sumVol += arr[k].volume;
			count++;
		}
				
		// 如果前面pre根全在M之后（理论上不会发生，但防御性处理）
		if (count === 0) continue;
				
		const avgVol = sumVol / count;
				
		// A的成交量必须大于前面pre到M之间每一根的成交量
		let allGreater = true;
		for (let k = i - pre; k < mIndex; k++) {
			if (k < 0) continue;
			if (volA <= arr[k].volume) {
				allGreater = false;
				break;
			}
		}
		if (!allGreater){
			if(testMode && testTarget){
				console.log(testText+"=========>> A的成交量必须大于前面pre到M之间每一根的成交量")
			}
			continue;
		}
				
		// A的成交量必须是这些K线平均值的Rvol倍以上
		if (volA <= avgVol * Rvol){
			if(testMode && testTarget){
				console.log(testText+"=========>> A的成交量必须是这些K线平均值的Rvol倍以上")
			}
			continue;
		}
				
		// 条件3：A之后的两根K线
		if (i + 2 >= arr.length) continue;
		const next1 = arr[i + 1];
		const next2 = arr[i + 2];
		
		
		const n1Change = (next1.close - next1.open) / next1.open;
		const n2Change = (next2.close - next2.open) / next2.open;
		
		// perA必须大于后两根分别的涨幅的Rper倍
		if (perA <= Math.abs(n1Change) * Rper) continue;
		if (perA <= Math.abs(n2Change) * Rper) continue;
		
		// 后两根的涨幅分别小于per
		if (Math.abs(n1Change) >= per) continue;
		if (Math.abs(n2Change) >= per) continue;
		
		// 如果后两根同为上涨或同为下跌
		if ((n1Change > 0 && n2Change > 0) || (n1Change < 0 && n2Change < 0)) {
			const perAfter = Math.abs((next1.open - next2.close) / next2.close);
			// perA至少是perAfter的Rper倍, perAfter小于per
			if (perA <= perAfter * Rper || perAfter >= per) continue;
		}
		
		
		// 新增条件：A后两根K线振幅都小于A振幅的0.7
		const waveA = (A.high - A.low) / A.low;
		const n1wave = (next1.high - next1.low) / next1.low;
		const n2wave = (next2.high - next2.low) / next2.low;
		if (n1wave >= waveA * 0.7 || n2wave >= waveA * 0.7) continue;
				
		
        // 所有条件满足
        collect_signal(symbol, item, "stair"+plus, A.time);
        return true;
    }

    return false;
}


//=====================================================================================分钟爆量信号==
function x_rocket_1m(symbol, item, arr) {
    // let pre;
    // switch(item) {
    //     case '1m': pre = 100; break;
    //     // case '5m': pre = 200; vol=100000; break;
    //     // case '15m': pre = 30; break;  // 注意：你写的 pre=10，但实际应该是 30？按你给的逻辑 "15m" pre=10
    //     default: pre = 20;
    // }
    			
    			   
    
    const pre=200;
    const per = 0.005;     // 0.5%
    const vol = 25000;     // 成交额阈值
    const Rvol = 8;        // 成交量倍数阈值
    const Rper = 10;       // 涨幅倍数阈值
    
    // 2. 计算需要检测的范围
    const num = arr.length - pre;
    if (num < 0) {
        console.log("x_rocket_mm数据不足 " + symbol + " " + item);
        return false;
    }
    			
    // 3. 遍历最后 num 个成员作为候选启动K线
    for (let i = arr.length - num; i < arr.length; i++) {
        const A = arr[i];
        if(A.timestamp== new Date("2026/08/11 12:36:00").getTime()){
        	console.log("1111111111111111111");
    		console.log(A)
        }
        // 检查索引范围是否足够取前 pre 根和后 5 根
        if (i - pre < 0 || i + 5 >= arr.length) continue;
    			
        // --- 条件1：A是上涨的，涨幅 >= per，成交额 >= vol ---
        const perA = (A.close - A.open) / A.open;
        const volA = A.quoteVolume;  // 成交额
        
        if (perA <= 0 || perA < per || volA < vol) continue;
    			
        // --- 条件2：perA 大于前面 pre 根的每一根涨幅 ---
        let condition2 = true;
        for (let j = i - pre; j < i; j++) {
            const prevPer = (arr[j].close - arr[j].open) / arr[j].open;
            if (perA <= prevPer) {
                condition2 = false;
                break;
            }
        }
        if (!condition2) continue;
    			
        // --- 条件3（修改后）：---
    	// volA 大于前面 pre 根中每一根上涨K线的成交额的5倍以上
    	// 且 volA / 前面 pre 根（不分涨跌）的平均成交额 >= 10
    	let condition3 = true;
    	let totalPrevVol = 0;           // 所有前序K线总成交额（不分涨跌）
    	let upKlineCount = 0;           // 上涨K线数量计数
    	
    	for (let j = i - pre; j < i; j++) {
    		const prevCandle = arr[j];
    		const prevVol = prevCandle.quoteVolume;
    		const prevPer = (prevCandle.close - prevCandle.open) / prevCandle.open;
    		
    		totalPrevVol += prevVol;    // 累加所有K线成交额
    		
    		// 如果是上涨K线，检查 volA 是否大于它的5倍
    		if (prevPer > 0) {
    			upKlineCount++;
    			if (volA <= prevVol * 5) {
    				condition3 = false;
    				break;
    			}
    		}
    	}
    	
    	if (!condition3) continue;
    	
    	// 如果没有上涨K线，跳过（无法满足"大于每根上涨K线5倍"的条件）
    	if (upKlineCount === 0) continue;
    			
        // 计算前 pre 根平均成交额
        const avgPrevVol = totalPrevVol / pre;
        const Ravevol = volA / avgPrevVol;
        
        if (Ravevol < Rvol) continue;  // 平均倍数 >= 10
    			
        // --- 条件4：A后面5根的最低价不低于 A 实体的一半 ---
        const halfBody = (A.close - A.open) / 2 + A.open;
        let condition4 = true;
        for (let j = i + 1; j <= i + 5 && j < arr.length; j++) {
            if (arr[j].low < halfBody) {
                condition4 = false;
                break;
            }
        }
        if (!condition4) continue;

        // --- 所有条件满足，触发信号 ---
        collect_signal(symbol, item, "rocket" + Ravevol.toFixed(2), A.time);
        return true;
    }

    // 没有找到符合条件的 K 线
    return false;
}

//=====================================================================================承接信号==

// 情况一：单根K线暴跌 + 放量确认
// M（最后一根K线）：必须是下跌K线，且单根跌幅 超过 50%。
// A（下一根K线）：
// 成交量 ≥ M成交量的 0.98倍​ 且 ≥ M成交量本身（即放量）。
// 若A是下跌K线，其实体占比 ≤ 15%（即十字星/小实体）。

// 情况二：多根K线连续下跌 + 放量确认
// M区间（至少3根K线）：
// 长度=3：全部为下跌K线。
// 长度>3：最多允许 1根​ 上涨K线，且：
// 涨幅 < 0.2%。
// 该上涨K线 不在首位或末位。
// 总跌幅 ≥ 18%。
// A（M区间后的第一根K线）：
// 成交量 ≥ M最后一根成交量的 0.98倍。
// 若A是下跌K线，其实体占比 ≤ 15%。
function bear(symbol, item, arr, num) {
	// 获取最后 num 根K线（如果数组长度小于 num 则取全部）
	const candles = arr.length <= num ? arr : arr.slice(arr.length - num);

	if (candles.length < 4) return false; // 至少需要 M(3根) + A(1根)

	// 辅助函数
	const isDown = (c) => c.close < c.open; // 判断是否为下跌K线
	const isUp = (c) => c.close > c.open; // 判断是否为上涨K线
	const changePercent = (c) => ((c.close - c.open) / c.open) * 100; // 计算涨跌幅百分比
	const bodyRatio = (c) => { // 计算K线实体占比
		const body = Math.abs(c.close - c.open);
		const total = c.high - c.low;
		return total === 0 ? 0 : body / total;
	};

	// 查找所有有效的 M 区间，并在其后检查 A
	// 遍历可能的 M 结束位置
	// M 必须以 candles[i] 结束，A 是 candles[i+1]

	for (let aIdx = 1; aIdx < candles.length; aIdx++) {
		const A = candles[aIdx]; // A 是 M 后面的那根K线
		if(symbol=="BTWUSDT" && item=="1d" ){//&& A.open=="0.0502500"){
			console.log(1)
		}
		// 尝试找到一个有效的 M，它以 aIdx-1 结束
		// M 可以是单根跌幅 > 50% 的K线，或者连续至少3根下跌K线

		// 检查单根K线作为 M（即 aIdx-1 位置的K线）
		const singleM = candles[aIdx - 1];
		if (isDown(singleM)) {
			const drop = ((singleM.open - singleM.close) / singleM.open) * 100;
			if (drop > 50) { // 单根跌幅超过50%
				// 检查 A 的条件
				const rRaw = A.volume / singleM.volume;
				const r = Math.round(rRaw * 10) / 10; // 成交量倍数，保留1位小数

				if (A.volume >= singleM.volume * 0.98 && A.volume >= singleM.volume) {
					// A 的成交量 >= M 最后一根成交量的0.98倍，且 >= M的平均成交量（单根即自身）
					let aValid = true;
					if (isDown(A)) { // 如果 A 是下跌K线
						if (bodyRatio(A) > 0.15) aValid = false; // 实体占比不能超过15%
					}

					if (aValid) {
						const totalDrop = (((singleM.open - singleM.close) / singleM.open) * 100).toFixed(2) + "%";
						collect_signal(symbol, item, `bear:${totalDrop}${r}倍`, A.time);
						return true;
					}
				}
			}
		}

		// 检查连续的 M 区间，以 aIdx-1 结束
		// M 必须至少有3根K线
		// 尝试所有可能的 M 起始位置
		for (let mStart = 0; mStart <= aIdx - 3; mStart++) {
			const mCandles = candles.slice(mStart, aIdx); // M 区间内的K线
			const mLen = mCandles.length;

			if (mLen < 3) continue; // 长度不足3根，跳过

			// 验证 M 区间：连续下跌趋势并遵循规则
			// - 如果长度为3：必须全部是下跌K线
			// - 如果长度 > 3：最多允许1根上涨K线，但：
			//   * 上涨K线的涨幅必须 < 0.2%
			//   * 上涨K线不能在头部（索引0）或尾部（索引mLen-1）

			let upCount = 0; // 上涨K线的计数
			let upInvalidPosition = false; // 上涨K线位置是否无效
			let upExceedsLimit = false; // 上涨K线是否超过涨幅限制

			for (let i = 0; i < mLen; i++) {
				const c = mCandles[i];
				if (isUp(c)) { // 如果是上涨K线
					upCount++;
					if (mLen === 3) { // 长度为3时不允许上涨
						upInvalidPosition = true;
						break;
					}
					// 对于长度 > 3 的情况
					if (i === 0 || i === mLen - 1) { // 上涨不能在首尾位置
						upInvalidPosition = true;
						break;
					}
					const gainPct = changePercent(c);
					if (gainPct >= 0.2) { // 涨幅不能超过0.2%
						upExceedsLimit = true;
						break;
					}
				}
			}

			if (upInvalidPosition || upExceedsLimit) continue; // 不符合规则，跳过
			if (mLen === 3 && upCount > 0) continue; // 长度为3时不能有上涨
			if (mLen > 3 && upCount > 1) continue; // 长度>3时最多1次上涨

			// 计算 M 区间的总跌幅
			const mOpen = mCandles[0].open; // M 第一根的开盘价
			const mClose = mCandles[mLen - 1].close; // M 最后一根的收盘价
			const totalDropPct = ((mOpen - mClose) / mOpen) * 100; // 总跌幅百分比

			if (totalDropPct < 18) continue; // 总跌幅必须 >= 18%

			// 检查 A 的条件
			const lastMCandle = mCandles[mLen - 1]; // M 的最后一根K线
			const avgMVolume = mCandles.reduce((sum, c) => sum + c.volume, 0) / mLen; // M 的平均成交量

			const rRaw = A.volume / lastMCandle.volume;
			const r = Math.round(rRaw * 10) / 10; // 成交量倍数，保留1位小数

			if (A.volume < lastMCandle.volume * 0.98) continue; // A成交量 >= M最后一根的0.98倍
			// if (A.volume < avgMVolume) continue; // A成交量 >= M平均成交量

			let aValid = true;
			if (isDown(A)) { // 如果 A 是下跌K线
				if (bodyRatio(A) > 0.15) { // 实体占比不能超过15%
					aValid = false;
				}
			}

			if (!aValid) continue;

			const totalDrop = totalDropPct.toFixed(2) + "%";
			// collect_signal(symbol, item, `bear:${totalDrop}${r}倍`, A.time);
			collect_signal(symbol, item, `BEAR:${r}`, A.time);
			return true;
		}
	}

	return false; // 未找到符合条件的信号
}

//=====================================================================================连续上涨==
function x_bow(symbol, item, arr, num) {
    // 检查数据量是否足够
    if (arr.length < num) {
        console.log("x_bow数据不足 " + symbol + " " + item);
        return false;
    }

    // 只检测最后 num 根K线
    const startIndex = arr.length - num;
    
    // 遍历寻找连续上涨区间 M
    let currentStreak = 0;
    let streakStartIndex = -1;
    
    for (let i = startIndex; i < arr.length; i++) {
        const candle = arr[i];
        const isUp = candle.close > candle.open;  // 收盘价大于开盘价为上涨
        
        if (isUp) {
            // 如果是第一根上涨K线，记录起始位置
            if (currentStreak === 0) {
                streakStartIndex = i;
            }
            currentStreak++;
            
            // 如果连续上涨达到至少8根，检查成交量条件
            if (currentStreak >= 8) {
                const n = currentStreak;  // M的K线数量
                
                // 检查M之前是否有足够的K线（至少n根）
                if (streakStartIndex - n < startIndex) {
                    // 数据不足，继续往后找更长的区间
                    continue;
                }
                
                // 计算M的成交量之和
                let mVolumeSum = 0;
                for (let j = streakStartIndex; j <= i; j++) {
                    mVolumeSum += arr[j].quoteVolume;
                }
                
                // 计算M的第一根的前n根成交量之和
                let prevVolumeSum = 0;
                for (let j = streakStartIndex - n; j < streakStartIndex; j++) {
                    prevVolumeSum += arr[j].quoteVolume;
                }
                
                // 条件2：M的成交量之和 > 前n根成交量之和
                if (mVolumeSum > prevVolumeSum) {
                    const M_start_time = arr[streakStartIndex].time;
                    collect_signal(symbol, item, "M", M_start_time);
                    return true;
                }
            }
        } else {
            // 遇到非上涨K线，重置计数
            currentStreak = 0;
            streakStartIndex = -1;
        }
    }

    // 没有找到符合条件的连续上涨区间
    return false;
}


// 30m 箱体突破
function breakbox(symbol, item, arr, num = 10) {
    const pre = 50;
    
    // 如果数组长度不足，返回false
    if (arr.length < 2) return false;
    
    // 确定要检查的K线范围
    const checkCount = Math.min(num, arr.length);
    const startIndex = arr.length - checkCount;
    
    // 获取pre根K线（从倒数第checkCount根之前开始取）
    const preStartIndex = Math.max(0, startIndex - pre);
    const preKlines = arr.slice(preStartIndex, startIndex);
    
    // 如果preKlines不足pre根，用全部可用的
    const actualPre = preKlines.length;
    if (actualPre < 1) return false;
    
    // 计算pre中的最高价
    const preHighs = preKlines.map(k => k.high);
    const maxPreHigh = Math.max(...preHighs);
    
    // 检查最后num根K线中是否存在符合条件的K线A
    for (let i = startIndex; i < arr.length; i++) {
        const currentK = arr[i];
        
        // 条件1: 价格大于pre中的最高价
        if (currentK.high <= maxPreHigh) continue;
        
        // 获取当前K线之前的10根K线（用于比较成交量和涨幅）
        const prevStart = Math.max(0, i - 11); // 包含当前K线前一格，共10根
        const prevKlines = arr.slice(prevStart, i);
        
        if (prevKlines.length < 10) continue; // 不足10根，跳过
        
        // 检查成交量是否大于前10根每一根
        let volumeCondition = true;
        for (let j = 0; j < prevKlines.length; j++) {
            if (currentK.volume <= prevKlines[j].volume) {
                volumeCondition = false;
                break;
            }
        }
        if (!volumeCondition) continue;
        
        // 计算当前K线涨幅
        const currentChange = (currentK.close - currentK.open) / currentK.open;
        
        // 检查涨幅是否大于前10根每一根
        let changeCondition = true;
        for (let j = 0; j < prevKlines.length; j++) {
            const prevChange = (prevKlines[j].close - prevKlines[j].open) / prevKlines[j].open;
            if (currentChange <= prevChange) {
                changeCondition = false;
                break;
            }
        }
        if (!changeCondition) continue;
        
        // 条件2: 统计pre中最高价前3名（间隔至少2根K线，且不相差1%）
        // 先按最高价排序并筛选符合条件的K线
        const sortedByHigh = [...preKlines]
            .map((k, idx) => ({ ...k, originalIndex: idx }))
            .sort((a, b) => b.high - a.high);
        
        // 筛选出符合间隔条件的K线
        const selected = [];
        for (let k of sortedByHigh) {
            if (selected.length >= 3) break;
            
            // 检查与已选K线的间隔
            let valid = true;
            for (let s of selected) {
                if (Math.abs(k.originalIndex - s.originalIndex) < 3) { // 至少相隔2根 => index差>=3
                    valid = false;
                    break;
                }
            }
            
            if (valid) {
                selected.push(k);
            }
        }
        
        // 如果选出的K线少于3个，条件不满足
        if (selected.length < 3) continue;
        
        // 检查前三名最高价是否相差不超过1%
        const top3Highs = selected.slice(0, 3).map(k => k.high);
        const maxHigh = Math.max(...top3Highs);
        const minHigh = Math.min(...top3Highs);
        
        if ((maxHigh - minHigh) / maxHigh > 0.01) continue;
        
        // 所有条件满足，执行collect_signal
        collect_signal(symbol, item, "box", currentK.time);
        return true;
    }
    
    return false;
}




//单根下跌承接
function bear1(symbol, item, arr, num) {
	const pre = 10;
	const volumeR = 5;

	if (!arr || arr.length < pre + 2) {
		return false;
	}

	// A检测范围
	const start = Math.max(pre, arr.length - num);
	const end = arr.length - 1; // A后面还要有B

	for (let i = start; i < end; i++) {

		const A = arr[i];
		const B = arr[i + 1];

		// A必须是阴线
		if (A.close >= A.open) {
			continue;
		}

		const preArr = arr.slice(i - pre, i);

		// ---------- 条件1 ----------
		const ADrop = (A.open - A.close) / A.open;

		let lowestLow = Infinity;
		let maxPrevDrop = 0;

		for (const k of preArr) {

			// 前20根最低价
			if (k.low < lowestLow) {
				lowestLow = k.low;
			}

			// 前20根阴线最大跌幅
			if (k.close < k.open) {
				const drop = (k.open - k.close) / k.open;
				if (drop > maxPrevDrop) {
					maxPrevDrop = drop;
				}
			}
		}

		if (A.low >= lowestLow) {
			continue;
		}

		if (ADrop <= maxPrevDrop) {
			continue;
		}

		// ---------- 条件2 ----------
		let maxVol = 0;
		let sumVol = 0;

		for (const k of preArr) {
			if (k.volume > maxVol) {
				maxVol = k.volume;
			}
			sumVol += k.volume;
		}

		const avgVol = sumVol / pre;

		if (A.volume <= maxVol) {
			continue;
		}

		if (A.volume < avgVol * volumeR) {
			continue;
		}

		// ---------- 条件3 ----------
		if (B.close <= B.open) {
			continue;
		}

		if (B.volume <= A.volume) {
			continue;
		}

		collect_signal(
			symbol,
			item,
			"1bear:" + volumeR + "倍",
			A.time
		);

		return true;
	}

	return false;
}

//放量突破新高
function bamboo(symbol, item, arr, num) {
	let pre= 20;
	// if (item == "1m") { pre = 1; }
	if (item == "5m") { pre = 300; }
	if (item == "15m") { pre = 300; }
	else if (item == "30m") { pre = 150; }
	else if (item == "1h") { pre = 100; }
	else if (item == "2h") { pre = 40;  }
	else if (item == "4h") { pre = 20; }
	// else if (item == "8h") { pre = 5; }
    
    
    // 数据量不够直接返回false
    if (!arr || arr.length < pre + 2) return false;
    
    // 取最后num根，如果不够则取全部
    const len = Math.min(num, arr.length);
    const targetArr = arr.slice(-len);
    
    // 遍历寻找符合条件的连续两根K线
    for (let i = 1; i < targetArr.length; i++) {
        const B = targetArr[i - 1]; // 前一根
        const A = targetArr[i];     // 后一根
        
        // 找到B在原始数组中的索引
        const bIndex = arr.indexOf(B);
        if (bIndex < pre) continue; // 前面不够20根
        
        // 区间M: B的前20根到其前1根
        const M = arr.slice(bIndex - pre, bIndex);
        
        // 条件2: M的最高价
        const mHigh = Math.max(...M.map(k => k.high));
        if (B.close >= mHigh) continue; // B收盘价不小于M最高价，不符合
        if (A.close <= mHigh) continue; // A收盘价不大于M最高价，不符合
        
        // 条件3: A是上涨的
        if (A.close <= A.open) continue;
        
        // 条件3: A的成交量比M里面任意成交量都大
        const mVolumes = M.map(k => k.volume);
        const mMaxVolume = Math.max(...mVolumes);
        if (A.volume <= mMaxVolume) continue;
        
        // 条件3: A的成交量是M平均成交量的2倍以上
        const mAvgVolume = mVolumes.reduce((sum, v) => sum + v, 0) / mVolumes.length;
        const R = (A.volume / mAvgVolume).toFixed(1);
        if (R < 1.5) continue;
        
        // 所有条件满足，执行信号
        collect_signal(symbol, item, `笋:${R}倍`, A.time);
        return true;
    }
    
    return false;
}


//小级别连续倍量上涨
function x_mountain(symbol, item, arr, num) {
  // 常量定义
  const pre = 10;
  const series = 5;
  const ratio = 8;
  
  // 如果没有传入num，默认为arr.length - 10
  if (num === undefined) {
    num = arr.length - 10;
  }
  
  // num小于5时，返回false
  if (num < 5) {
    return false;
  }
  
  // 数据量检查：arr长度需要足够提供num根K线和前面的pre根
  if (arr.length < num + pre) {
    return false;
  }
  
  // 取最后num根K线
  const recentKlines = arr.slice(-num);
  
  // 遍历查找连续上涨区间M（至少series根）
  for (let startIdx = 0; startIdx <= recentKlines.length - series; startIdx++) {
    // 检查从startIdx开始的连续上涨
    let endIdx = startIdx;
    while (endIdx + 1 < recentKlines.length && 
           recentKlines[endIdx + 1].close > recentKlines[endIdx].close) {
      endIdx++;
    }
    
    // 上涨区间长度
    const upLength = endIdx - startIdx + 1;
    
    // 条件1：连续上涨不少于series根（5根）
    if (upLength < series) continue;
    
    // 提取上涨区间M
    const M = recentKlines.slice(startIdx, endIdx + 1);
    
    // 条件2：M的平均交易量 > M前面pre根K线平均交易量的ratio倍
    // M的第一根在原始数组中的索引
    const mFirstGlobalIndex = arr.indexOf(M[0]);
    
    // 前面不够pre根K线
    if (mFirstGlobalIndex < pre) continue;
    
    // M前面的pre根K线
    const prevKlines = arr.slice(mFirstGlobalIndex - pre, mFirstGlobalIndex);
    
    // 计算M的平均交易量
    const mTotalVolume = M.reduce((sum, k) => sum + k.volume, 0);
    const mAvgVolume = mTotalVolume / upLength;
    
    // 计算前面pre根的平均交易量
    const prevTotalVolume = prevKlines.reduce((sum, k) => sum + k.volume, 0);
    const prevAvgVolume = prevTotalVolume / pre;
    
    // 条件2检查：ratio倍以上（8倍）
    if (mAvgVolume <= prevAvgVolume * ratio) continue;
    
    // 条件3：M的第一根是A
    const A = M[0];
    
    // 所有条件成立，执行signal
    collect_signal(symbol, item, "山", A.time);
    return true;
  }
  
  // 没找到符合条件的区间
  return false;
}

