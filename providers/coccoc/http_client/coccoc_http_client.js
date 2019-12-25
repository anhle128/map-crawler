'use strict';

const axios = require('axios');
const delayAdapterEnhancer = require('axios-delay').delayAdapterEnhancer;

const baseUrl = "https://map.coccoc.com/map";

const api = axios.create({
    adapter: delayAdapterEnhancer(axios.defaults.adapter)
});

const getListAddress = function (category, borders) {
    const url = `${baseUrl}/search.json?category=${category}&borders=${borders}`;
    return new Promise(function (resolve, reject) {
        api.get(url)
            .then(response => {
                resolve(response.data.result.poi)
            })
            .catch(error => {
                reject(error);
            });
    });

}

const getDetailAddress = function (addressId) {
    const url = `${baseUrl}/poidata.json?id=${addressId}&full=false`;
    return new Promise(function (resolve, reject) {
        api.get(url, { delay: 200 })
            .then(response => {
                delete response.data.reviews;
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

module.exports = {
    getListAddress,
    getDetailAddress
}