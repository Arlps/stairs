// 转换日期格式
function formatDateForAPI(dateStr) {
    return new Date(dateStr).getTime();
}

// 获取K线数据（不变）
async function getKlineData(symbol, interval, startTime, endTime = null) {
    let url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}`;
    if (startTime) url += `&startTime=${startTime}`;
    if (endTime) url += `&endTime=${endTime}`;
    
    try {
        const response = await $.ajax({ url: url, method: 'GET' });
        return response;
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return null;
    }
}

// 核心优化：并发处理函数
async function processContractsConcurrently(contracts, concurrentLimit = 5) {
    console.log(`🚀 开始并发处理 ${contracts.length} 个合约，并发数: ${concurrentLimit}`);
    const results = [];
    
    // 将大数组按并发数分割成多个小数组
    for (let i = 0; i < contracts.length; i += concurrentLimit) {
        const batch = contracts.slice(i, i + concurrentLimit);
        console.log(`🔧 正在处理第 ${i+1}-${i+batch.length} 个合约...`);
        
        // 使用Promise.all并发处理当前批次的所有合约
        const batchPromises = batch.map(async (contract) => {
            const symbol = contract.symbol;
            const spikeTime = formatDateForAPI(contract.spikeTime);
            
            // 并行获取历史价格和最新价格
            const [spikeKline, latestKline] = await Promise.all([
                getKlineData(symbol, '1m', spikeTime - 60000, spikeTime),
                getKlineData(symbol, '1m', null)
            ]);
            
            const openPrice = spikeKline ? parseFloat(spikeKline[0][1]) : null;
            const latestPrice = latestKline ? parseFloat(latestKline[latestKline.length - 1][4]) : null;
            
            if (openPrice && latestPrice) {
                const changePercent = ((latestPrice - openPrice) / openPrice * 100).toFixed(2);
                return {
                    ...contract,
                    openPrice,
                    latestPrice,
                    changePercent: parseFloat(changePercent)
                };
            }
            return null;
        });
        
        // 等待当前批次所有合约处理完成
        const batchResults = (await Promise.all(batchPromises)).filter(result => result !== null);
        results.push(...batchResults);
        
        // 批次之间添加短暂延迟，友好地对待API
        if (i + concurrentLimit < contracts.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    // 按涨跌幅排序
    results.sort((a, b) => b.changePercent - a.changePercent);
    console.log(`✅ 处理完成！共成功获取 ${results.length} 个合约的数据`);
    return results;
}

// 使用方式
async function main() {
    const contracts = getLocal("Vol1and5"); // 你的100+个合约
    const sortedResults = await processContractsConcurrently(contracts, 5); // 控制并发数为5
    console.log("排序后的合约数据:", sortedResults);
}
// main();