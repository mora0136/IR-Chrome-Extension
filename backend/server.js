const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const app = express();

const url = 'mongodb://localhost:27017';

const dbName = 'myproject';
const client = new MongoClient(url);
// Use connect method to connect to the server
client.connect(function(err) {
    console.log('Connected successfully to server');

    const db = client.db(dbName);
    app.get('/', function (req, res) {
        const insertDocuments = function(db, callback) {
            // Get the documents collection
            const collection = db.collection('documents');
            // Insert some documents
            collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }], function(err, result) {
                assert.equal(err, null);
                assert.equal(3, result.result.n);
                assert.equal(3, result.ops.length);
                console.log('Inserted 3 documents into the collection');
                callback(result);
            });
        };
        insertDocuments(db, data=>{console.log(data)})

        const findDocuments = function(db, callback) {
            // Get the documents collection
            const collection = db.collection('documents');
            // Find some documents
            collection.find({}).toArray(function(err, docs) {
                assert.equal(err, null);
                console.log('Found the following records');
                console.log(docs);
                callback(docs);
            });
        };
        findDocuments(db, ()=>{})

        return res.send('Hello world');
    });
    app.listen(process.env.PORT || 8080);
    // client.close();
});

