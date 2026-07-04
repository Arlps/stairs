// x=500
// 15m:499根
// 30m:249根
// 1h:124根
// 2h:61根
// 4h:30根
// 8h:15根
// 12h:9根
// 1d:4根

//阶梯信号，num为A的搜索范围 实际需要数量=pre+num+2
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
	else if (item == "30m") { pre = 10; per = 0.01; vol2 = 500000; }
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
				
	    // 5m/15m的前提下  A的最高价大于前面任意一根的最高价================================
		// if(item=="5m" || item=="15m"){
		// 	const preHighMax = Math.max(...preKlines.map(k => k.high));
		// 	if (A.high <= preHighMax) continue;
		// }
	   
		
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
				
	    const n1Change = (next1.close - next1.open) / next1.open;
	    const n2Change = (next2.close - next2.open) / next2.open;
				
	    // A 之后的两根K线，每根的涨跌幅绝对值必须小于 A 涨幅的 1/5=======================
	    if (Math.abs(n1Change) >= aChange / 5) continue;
	    if (Math.abs(n2Change) >= aChange / 5) continue;
				
	    //A 之后的两根K线，每根的高低点范围必须小于 A 范围的 1.2 倍=======================
	    const n1Range = next1.high - next1.low;
	    const n2Range = next2.high - next2.low;
	    if (n1Range >= aRange * 1.2) continue;
	    if (n2Range >= aRange * 1.2) continue;

		collect_signal( symbol, item, `0启动`, A.time);
			
		return true;
	}

	return false;
}

//大级别承接
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
	if(symbol=="TACUSDT" && item=="1d"){
		console.log(JSON.stringify(arr))
	}
	for (let aIdx = 1; aIdx < candles.length; aIdx++) {
		const A = candles[aIdx]; // A 是 M 后面的那根K线
		if(symbol=="TACUSDT" && item=="1d" && A.open=="0.019681"){
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
