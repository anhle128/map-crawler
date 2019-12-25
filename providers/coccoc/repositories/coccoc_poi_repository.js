'use strict';

const MongoClient = require('mongodb').MongoClient;

const config = require("../../../config/config.json").mongodb;

const collectionName = "coccoc_pois";
const databaseName = config.database;
const url = `mongodb://${config.username}:${config.password}@${config.url}:${config.port}`;

var collection = null;
const client = new MongoClient(url, { useUnifiedTopology: true });

const getCollection = function () {
    return new Promise((resolve, reject) => {
        if (collection) {
            resolve(collection);
            return;
        }
        client.connect(function (err) {
            if (err) {
                reject(err);
                return;
            }
            console.log("Connected successfully to server");
            const db = client.db(databaseName);
            collection = db.collection(collectionName);
            resolve(collection);
        });
    });
}

const insertMany = function (pois) {
    return new Promise((resolve, reject) => {
        for (const poi of pois) {
            poi.created_at = new Date();
            poi.updated_at = new Date();
        }
        getCollection()
            .then(collection => {
                collection.insertMany(pois, function (err, result) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            })
            .catch(err => reject(err));
    });
};

const getHash = function () {
    return new Promise((resolve, reject) => {
        getCollection()
            .then(collection => {
                collection.find({}, { _id: 1, hash: 1 }).toArray(function (err, docs) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(docs.map(a => a.hash));
                });
            })
            .catch(err => resolve(err));
    });
};

module.exports = { insertMany, getHash }
