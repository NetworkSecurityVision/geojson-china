const https = require("https");
const fs = require("fs");
const region = require("./region.json");
const ProgressBar = require("progress");

const URL = "https://geo.datav.aliyun.com/areas/bound/geojson?code=";

function write(name, data) {
    return new Promise((resolve) => {
        fs.writeFile(`./data/${name}.json`, data, resolve);
    });
}

async function download(code, withChildren) {
    return new Promise((resolve) => {
        let data = "",
            name = code + (withChildren ? "_full" : "");
        let url = URL + name;
        https.get(url, (res) => {
            res.on("data", (d) => (data += d));
            res.on("end", () => {
                write(name, data).then(resolve);
            });
        });
    });
}

async function run() {
    let codes = [];
    Object.keys(region).map((i) => {
        if (i.length <= 4) {
            codes.push({
                code: i.padEnd(6, "0"),
                withChildren: true,
            });
        }
        if (i.length <= 4) {
            codes.push({
                code: i.padEnd(6, "0"),
                withChildren: false,
            });
        }
    });
    let bar = new ProgressBar(
        "downloading :current/:total [:bar] :rate/bps :percent ",
        { total: codes.length }
    );

    for (let i = 0; i < codes.length; i++) {
        let { code, withChildren } = codes[i];

        bar.tick();
        await download(code, withChildren);
    }
}

run();
