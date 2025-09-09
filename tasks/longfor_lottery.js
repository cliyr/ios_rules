console.log("开始运行抽取脚本");
const method = `POST`;
var ua=``;
var authtoken = ``;
var cookie = ``;
var xgaiaapikey = ``;
var dxRiskToken = ``;
var channel='';
var body = ``;
var bucode=``;
var app=``;

console.log("开始初始化休眠函数");

// 休眠随机时间函数
function sleepRandom(minMs = 1000, maxMs = 5000) 
{
    
}

console.log("初始化脚本参数");

//API格式：longfor_lottery.js#at=AAA

// 获取脚本参数
const sourcePath = $environment.sourcePath;
const sourceUrl = new URL(sourcePath);
const sourceHash = sourceUrl.hash;
const scriptParams = new URLSearchParams(sourceHash.substring(1));
function getParam(name)
{
    if (scriptParams.has(name)) 
    {
        return scriptParams.get(name);
    }
    else
    {
        throw new Error(`没有参数：`+name);
    }
}

console.log("准备第1次休眠");
await sleepRandom(1000, 60000);

try
{    
    if(getParam("iw") == '1')
    {
        ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.50(0x1800323d) NetType/WIFI Language/zh_CN miniProgram/wx50282644351869da';
        channel='C2';
        bucode=`C20400`;
        app='Wechat';
    }
    else
    {
        ua = `Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 &MAIAWebKit_iOS_com.longfor.supera_1.16.8_202508121148_Default_3.2.4.9`;
        channel='L0';
        bucode=`L00602`;
        app='App';
    }
    const cno=getParam('cn');
    const ano=getParam('an');    
    body = `{"component_no":"${cno}","activity_no":"${ano}"}`;
    
    authtoken = getParam("at");
    cookie = getParam("ck");
    xgaiaapikey = getParam("gak");
    dxRiskToken = getParam("drt");
}
catch(e)
{
    console.log('\r↓↓↓↓↓↓↓ 龙湖龙珠抽取异常 ↓↓↓↓↓↓↓'+app);
    console.log('初始化参数异常：'+e.message);
    console.log(e.stack);
    console.log('↑↑↑↑↑↑↑ 龙湖龙珠抽取异常 ↑↑↑↑↑↑↑\r'+app);
    $done();
    return;
}

console.log("准备第2次休眠");
await sleepRandom(1000, 60000);


console.log("初始化日志");
function log(msg, err = null) 
{
    var m = '【龙珠抽取】' + app + msg;    
    if (err !== null) {
        m = m + err;
    }    
    console.log(m);
    $notify("龙珠抽取", app, msg);
}


const headers = {
'x-gaia-api-key' : xgaiaapikey,
'X-LF-DXRisk-Token' : dxRiskToken,
'Cookie' : cookie,
'authtoken' : authtoken,
'User-Agent' : ua,
'bucode' : bucode,
'channel' : channel,
'Accept-Encoding' : `gzip, deflate, br`,
'Host' : `gw2c-hw-open.longfor.com`,
'Origin' : `https://llt.longfor.com`,
'Sec-Fetch-Dest' : `empty`,
'Connection' : `keep-alive`,
'Sec-Fetch-Site' : `same-site`,
'Content-Type' : `application/json`,
'Referer' : `https://llt.longfor.com/`,
'X-LF-DXRisk-Source' : `2`,
'Accept-Language' : `zh-CN,zh-Hans;q=0.9`,
'Accept' : `application/json, text/plain, */*`,
'Sec-Fetch-Mode' : `cors`
};

const signRequest = {
    url: `https://gw2c-hw-open.longfor.com/llt-gateway-prod/api/v1/activity/auth/lottery/sign`,
    method: method,
    headers: headers,
    body: body
};

$task.fetch(signRequest).then(response1 => {
    try 
    {
        const result1 = JSON.parse(response1.body);         
        // 检查签到的返回码
        if (result1.code !== "0000") 
        {
            // 签到失败，推送通知
            log(`签到失败: ${result1.message||response1.body}`,response1.body);
            $done();
            return;
        }        
        
        console.log("准备第3次休眠");
        await sleepRandom(10000, 60000);
        
        // 签到成功，继续抽取
        const clickRequest = {
            url: "https://gw2c-hw-open.longfor.com/llt-gateway-prod/api/v1/activity/auth/lottery/click",            
            method: method,
            headers: headers,
            body: body
        };      
      
        //执行抽取流程
        $task.fetch(clickRequest).then(response2 => {
            try
            {
                const result2 = JSON.parse(response2.body);
                
                if (result2.code === "0000") {
                    // 抽取成功，推送成功通知
                    const data1 = result2.data?.prize_name || "未知奖品";
                    const data2 = result2.data?.reward_num ? Number(result2.data.reward_num).toFixed(1) : "未知数据";
                    const combinedData = `抽取完成: ${data1}：${data2}`;                    
                    log(combinedData,response2.body);
                } 
                else 
                {
                    // 抽取成功 API 返回错误码
                    log(`抽取失败: ${result2.message||response2.body}`,response2.body);
                }
            } 
            catch (e) 
            {
                // 抽取API JSON 解析错误
                log(`抽取异常: ${e.message}`);
            }
            $done();
        }, reason2 => {
            // 第二个 API 网络请求失败
            log(`抽取请求失败: ${reason2.error}`);
            $done();
        });
        
    } 
    catch (e) 
    {
        // 签到 API JSON 解析错误
        log(`签到异常: ${e.message}`);
        $done();
    }
}, reason1 => {
    // 第一个 API 网络请求失败
    log(`签到请求失败: ${reason1.error}`);
    $done();
});
