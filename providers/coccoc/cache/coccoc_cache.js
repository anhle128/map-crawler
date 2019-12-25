'use strict';

const redis = require("redis");

const config = require("../../../config/config.json").redis;

const key = "cococ_all_hashes";

const client = redis.createClient({
    host: config.url,
    port: config.port,
    password: config.password
});

client.on("error", function (err) {
    console.log("Error " + err);
});

const setHash = function (hashes) {
    return new Promise((resolve, reject) => {
        client.set(key, JSON.stringify(hashes), (err, resp) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(resp);
        });
    });
};

const getHash = function () {
    return new Promise((resolve, reject) => {
        client.get(key, function (err, resp) {
            if (err) {
                reject(err);
                return;
            }
            if (resp) {
                resolve(JSON.parse(resp));
                return;
            }
            resolve(null);
        });
    });
}

module.exports = { setHash, getHash }