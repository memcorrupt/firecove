const fs = require("fs");
const https = require("https");
const config = require("./config.json");
const ovh = require("ovh")({
    endpoint: config.ovh.endpoint,
    appKey: config.ovh.appKey,
    appSecret: config.ovh.appSecret,
    consumerKey: config.ovh.consumerSecret
});

function fetchCfIps(){
    return new Promise((resolve, reject) => {
        https.get("https://www.cloudflare.com/ips-v4", (res) => {
            if(res.statusCode != 200)
                return reject(new Error("Could not fetch Cloudflare IPs: Response code " + res.statusCode));

            let data = "";
            res
                .on("data", e => { data += e; })
                .on("error", reject)
                .on("end", () => resolve(data.split("\n").filter(e => e.length)));
        });
    });
}

function fetchHistoricalIps(){
    return new Promise((resolve, reject) => {
        fs.readFile("historical.json", "utf8", (err, data) => {
            if(err)
                return err.code == "ENOENT" ? resolve({}) : reject(err);
            
            let json;
            try{
                json = JSON.parse(data);
            }catch(err){
                reject(err);
            }

            resolve(json);
        });
    });
}

function saveHistoricalIps(history){
    return () => {
        new Promise((resolve, reject) => {
            fs.writeFile("historical.json", JSON.stringify(history), "utf8", (err) => {
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    };
}

async function getFirewallEntries(encodedRange, encodedIp){
    let firewallIds
    try{
        firewallIds = await ovh.requestPromised("GET", `/ip/${encodedRange}/firewall/${encodedIp}/rule`);
    }catch(err){
        if(err.error == 404)
            throw new Error(`Could not configure firewall for ${encodedIp}: A firewall does not exist for this IP address. Please create one via the OVH manager.`);
    }
    
    let promises = [];
    for(const seq of firewallIds)
        promises.push(ovh.requestPromised("GET", `/ip/${encodedRange}/firewall/${encodedIp}/rule/${encodeURIComponent(seq)}`));

    return Promise.all(promises);
}

async function processIp(cfIps, history, range, ip){
    let encodedRange = encodeURIComponent(range);
    let encodedIp = encodeURIComponent(ip);
    const firewallData = await getFirewallEntries(encodedRange, encodedIp);
    
    const promises = [];
    const addRule = (data) => {
        promises.push(ovh.requestPromised("POST", `/ip/${encodedRange}/firewall/${encodedIp}/rule`, data));
    }
    const removeRule = (seq) => {
        promises.push(ovh.requestPromised("DELETE", `/ip/${encodedRange}/firewall/${encodedIp}/rule/${seq}`));
    }

    const eligibleIps = firewallData.map(rule => rule.source);
    for(const rule of eligibleIps)
        if(cfIps.includes(rule.source) && (rule.action !== "permit" || rule.protocol !== "ipv4"))
            throw new Error(`Could not configure firewall for ${encodedIp}: A rule exists for a Cloudflare IP, but is not a permit IPv4 rule.`);

    const usedIndices = firewallData.map(rule => rule.sequence);
    const indices = [...Array(19).keys()].filter(i => !usedIndices.includes(i));
    const toAdd = cfIps.filter(ip => !eligibleIps.includes(ip));
    const toRemove = firewallData
        .filter(rule => history.includes(rule.source) && !cfIps.includes(rule.source))
        .map(rule => rule.sequence)
        .forEach(removeRule);

    const lastRule = firewallData.find(rule => rule.sequence == 19);
    if(!lastRule){
        addRule({
            action: "deny",
            protocol: "ipv4",
            sequence: 19
        });
    }else if(lastRule.action !== "deny" || lastRule.source !== "any" || lastRule.protocol !== "ipv4")
        throw new Error(`Could not configure firewall for ${encodedIp}: Rule with sequence 19 exists, and is not a block IPv4 from all IPs.`);

    for(const [index, cfIp] of toAdd.entries()){
        addRule({
            action: "permit",
            protocol: "ipv4",
            sequence: indices.pop(),
            source: cfIp
        });
    }

    return await Promise.all(promises);
}

function configureIps([cfIps, history]){
    let promises = [];
    if(cfIps.length > 19)
        throw new Error("OVH only allows up to 20 rules per IP. There are too many Cloudflare IP ranges to configure.");
    for(const [range, ips] of Object.entries(config.ips))
        for(const ip of ips)
            promises.push(processIp(cfIps, history, range, ip));
    return Promise.all(promises)
        .then(saveHistoricalIps(cfIps));
}

process.on("unhandledRejection", (err) => {
    console.log("Error while executing the Firecove script:");
    console.error(err);
    process.exit(1);
});

Promise.all([fetchCfIps(), fetchHistoricalIps()]).then(configureIps);