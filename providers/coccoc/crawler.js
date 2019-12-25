"use strict";

const axios = require('axios');
const fs = require('fs');
const Tree = require('avl');
const urlParser = require('url');

const coccocHTTPClient = require('./http_client/coccoc_http_client');
const coccocPoiRepository = require('./repositories/coccoc_poi_repository');
const coccocCache = require('./cache/coccoc_cache');

const categories = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const hanoiBorders = [
    "21.033240945663334%2C105.72214449880039%2C21.068085585144885%2C105.80153788564121",
    "21.004343473767065%2C105.7248194285437%2C21.039194871928895%2C105.80421281538452",
    "20.984962615839667%2C105.7180034329574%2C21.01981854192523%2C105.79739681979822",
    "20.95498802785606%2C105.74100605746912%2C20.989850949012872%2C105.82039944430994",
    "20.93502835333878%2C105.8061086346786%2C20.969895927129052%2C105.88550202151941",
    "20.961919283181196%2C105.83170998172591%2C20.996780587661412%2C105.91110336856673",
    "20.940637871274475%2C105.80789196567366%2C20.97550413790407%2C105.88728535251448",
    "20.980713341714853%2C105.752659917639%2C21.015570260019743%2C105.83205330447981",
    "20.95650904166971%2C105.80325710849593%2C20.99137160810224%2C105.88265049533675",
    "20.963321906442648%2C105.77222931461165%2C20.998182883706793%2C105.85162270145247",
    "21.002149306904307%2C105.72892773227522%2C21.037001217886484%2C105.80832111911604",
    "21.02041753132325%2C105.71086037235091%2C21.055265171100526%2C105.79025375919173",
    "21.027587999053946%2C105.74240315036604%2C21.062433961371116%2C105.82179653720686",
    "21.04505205230645%2C105.7423602350218%2C21.079893926798416%2C105.82175362186263",
    "21.06992277558753%2C105.74575054721663%2C21.104758822983595%2C105.82514393405745",
    "21.059974205651066%2C105.78651152154544%2C21.094812584738683%2C105.86590490838626",
    "21.05116320772193%2C105.83092890283206%2C21.086003651006447%2C105.91032228967288",
    "21.028292230067752%2C105.83693705102542%2C21.06313802760761%2C105.91633043786624",
    "21.044353948470157%2C105.85622616160106%2C21.079195986429937%2C105.93561954844188",
    "21.00637926242119%2C105.85865221520999%2C21.041230184733084%2C105.9380456020508",
    "21.019118820104055%2C105.86762152215579%2C21.05396676364362%2C105.94701490899661",
    "20.906803958214173%2C105.69731641996145%2C20.97654412813033%2C105.8561031936431",
    "21.063553441171447%2C105.72546888578177%2C21.133220350871024%2C105.8842556594634",
    "21.05065747738617%2C105.658692610147%2C21.12033043396791%2C105.81747938382864",
    "21.014286446095035%2C105.84683347928762%2C21.08397643795104%2C106.00562025296927",
    "20.903618380819154%2C105.72451557692045%2C20.97336003417676%2C105.8833023506021",
    "21.041306803403586%2C105.69955595456793%2C21.11098414228486%2C105.85834272824957",
    "20.94554743010712%2C105.66393621885015%2C21.015269540943105%2C105.8227229925318",
    "20.929434594672188%2C105.79350399845612%2C20.99916421988184%2C105.95229077213776",
    "21.021236917509054,105.76381733552705,21.092204945589646,106.08139088289033",
    "21.017871904877087,105.588207746904,21.088841537131,105.90578129426729",
    "20.95098811470806,105.62969108187838,21.021989581133155,105.94726462924166",
    "20.962049252203382,105.81680198275728,21.03304546061403,106.13437553012056",
    "20.8919815805471,105.73268790805025,20.963011051592915,106.05026145541353",
    "20.986055568389666%2C105.80806671086566%2C21.003804933020522%2C105.88746009770648",
    "20.96545885397378%2C105.80360351506488%2C20.98321066592842%2C105.8829969019057",
    "21.020599910638982%2C105.83902368672398%2C21.023994905567267%2C105.85887203343418",
    "21.014665114701554%2C105.8280196727494%2C21.01806024475655%2C105.84786801945961",
    "21.002598567337355%2C105.8121818613406%2C21.009389299436688%2C105.85187855476102"
];

const crawl = function () {

    loadTreeHash()
        .then((treeHash) => {
            const casesCrawl = generateCasesCrawl();
            crawlProcess(0, casesCrawl, treeHash);
        })
        .catch(err => console.log(err));
}

const crawlProcess = function (indexCaseCrawl, casesCrawl, treeHash) {

    console.log("------------------------------------------------")

    if (indexCaseCrawl >= casesCrawl.length) {
        console.log("crawl completed!");
        return;
    }

    console.log(`process: ${indexCaseCrawl}/${casesCrawl.length - 1}`);

    const caseCrawl = casesCrawl[indexCaseCrawl];

    coccocHTTPClient
        .getListAddress(caseCrawl.category, caseCrawl.borders)
        .then(pois => removeDuplicated(treeHash, pois))
        .then(pois => loadMissingDetail(treeHash, pois))
        .then(pois => {
            console.log("new pois: " + pois.length);
            if (pois.length > 0) {
                return coccocPoiRepository.insertMany(pois);
            }
            return Promise.resolve();
        })
        .then(() => coccocCache.setHash(treeHash.keys()))
        .then(() => {
            indexCaseCrawl++;
            crawlProcess(indexCaseCrawl, casesCrawl, treeHash);
        })
        .catch(err => console.log(err));
}

const generateCasesCrawl = function () {
    const cases = [];
    for (const category of categories) {
        for (const borders of hanoiBorders) {
            cases.push({
                category, borders
            });
        }
    }
    return cases;
}

const removeDuplicated = function (treeHash, pois) {
    const newPois = [];
    for (const poi of pois) {
        if (treeHash.contains(poi.hash)) {
            continue;
        }
        treeHash.insert(poi.hash);
        newPois.push(poi);
    }
    return Promise.resolve(newPois);
}

const loadTreeHash = function () {
    return new Promise((resolve, reject) => {
        coccocCache
            .getHash()
            .then(data => {
                if (!data) {
                    return coccocPoiRepository.getHash()
                }
                return Promise.resolve(data);
            })
            .then(allHash => {
                const tree = new Tree();
                tree.load(allHash);
                resolve(tree);
            })
            .catch(err => reject(err));
    });
}

const loadMissingDetail = function (treeHash, pois) {
    return new Promise((resolve, reject) => {

        if (pois.length === 0) {
            resolve(pois);
            return;
        }

        const poisDetail = pois.filter(a => a.hasOwnProperty('address'));
        const poisNoDetail = pois.filter(a => !a.hasOwnProperty('address'));

        Promise
            .all(poisNoDetail.map(a => coccocHTTPClient.getDetailAddress(a.hash)))
            .then(data => {
                poisDetail.push(...data)
                resolve(poisDetail)
            })
            .catch(error => {
                // remove from tree if can't get detail
                const hash = getHashFromUrl(error.config.url)
                console.log(error.config.url);
                console.log(hash);
                treeHash.remove(hash);
            });
    });
}

const getHashFromUrl = function (url) {
    const urlData = urlParser.parse(url, true);
    return urlData.query.id;
};

module.exports = { crawl }