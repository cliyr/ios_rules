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

//API格式：longfor_lottery.js#authtoken=AAA&cookie=BBB&gaiaapikey=CCC&DXRiskToken=DDDD&iswx=1
//at=authtoken
//ck=cookie
//gak=gaiaapikey
//drt=DXRiskToken
//iw=iswx
//cn=component_no
//an=activity_no

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

try
{    
    if (scriptParams.has("iw")) {
       const iswx = scriptParams.get("iw");
       if(iswx == '1')
        {
            ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.50(0x1800323d) NetType/WIFI Language/zh_CN miniProgram/wx50282644351869da';
            channel='C2';
            bucode=`C20400`;
            body = `{"component_no":"CE13Q42B02A04I6W","activity_no":"AP25Z07390KXCWDP"}`;
            app='Wechat';
        }
        else
         {
           ua = `Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 &MAIAWebKit_iOS_com.longfor.supera_1.16.8_202508121148_Default_3.2.4.9`;
           channel='L0';
           bucode=`L00602`;
            app='App';
         }
    }
    else
    {
        throw new Error(`没有参数：iw`);
    }

    const component_no=getParam('cn');
    const activity_no=getParam('an');
    
    body = `{"component_no":component_no,"activity_no":activity_no}`;
    
    if (scriptParams.has("at")) {
        authtoken = scriptParams.get("at");
    }
    else
    {
        throw new Error(`没有参数：at`);
    }
    if (scriptParams.has("ck")) {
        cookie = scriptParams.get("ck");
    }
    else
    {
        throw new Error(`没有参数：ck`);
    }
    if (scriptParams.has("gak")) {
        xgaiaapikey = scriptParams.get("gak");
    }
    else
    {
       throw new Error(`没有参数：gak`);
    }
    if (scriptParams.has("drt")) {
        dxRiskToken = scriptParams.get("drt");
    }
    else
    {
      throw new Error(`没有参数：drt`);
    }
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
            $notify("龙珠抽取", app, `签到失败: ${result1.message || response1.body}`);
            $done();
            return;
        }        
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
                    $notify("龙珠抽取", app, combinedData);
                } 
                else 
                {
                    // 抽取成功 API 返回错误码
                    $notify("龙珠抽取", app, `抽取失败: ${result2.message || response2.body}`);
                }
            } 
            catch (e) 
            {
                // 抽取API JSON 解析错误
                $notify("龙珠抽取", app, `抽取异常: ${e.message}`);
            }
            $done();
        }, reason2 => {
            // 第二个 API 网络请求失败
            $notify("龙珠抽取", app, `抽取请求失败: ${reason2.error}`);
            $done();
        });
        
    } 
    catch (e) 
    {
        // 签到 API JSON 解析错误
        $notify("龙珠抽取", app, `签到异常: ${e.message}`);
        $done();
    }
}, reason1 => {
    // 第一个 API 网络请求失败
    $notify("龙珠抽取", app, `签到请求失败: ${reason1.error}`);
    $done();
});
