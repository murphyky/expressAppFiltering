const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const uuid = require('uuid/v5');
const NAMESPACE = "9f264d74-96cd-46e3-9547-9618fc3ac247";
const lodash = require('lodash');

MongoClient.connect('mongodb://resFilterUser:km890889@localhost:27017/', (err,
    client) => {

	if (err) 
		return console.log(err);

	db = client.db('reseteraFilters');

    app.use(cors())

    app.use(bodyParser.json({
        type: "application/json"
    }))


    function errCallback(res, err) {
        return res.status(500).end({message: "Error occurred", err: err});
    }

    function successCallback(res, data) {
        return res.status(200).send({message: "Saved successfully",
            data: data});
    }

    app.get('/filters', (req, res) => {

        getFilters((err, data) => {
            if (err) {
                return errCallback(res, err);
            } else {
                return successCallback(res, data);
            }
        });
    });

    app.post('/filters', (req, res) => {

        getFilters((err, data) => {
            if (err) {
                return errCallback(res, err);
            } else {

                req.body.blockList = req.body.blockList || "[]";
                var joinedFilters = lodash.union(data.filters, JSON.parse(req.body.blockList));

                var _data = {
                    _id: uuid(req.body.user||null, NAMESPACE),
                    filters: joinedFilters,
                    username: req.body.user
                };
                //merge data object before saving
                updateFilters((err, data) => {
                    if (err) {
                        return errCallback(res, err);
                    } else {
                        return successCallback(res, data);
                    }
                }, data);
            }
        });
    });

    function updateFilters(cb, data) {
        console.log("Updating filters...", data);
        db.collection('filters').save(data, (err, result) => {
            //get latest state in case concurrent update happening elsewhere
            return getFilters(cb);
        });
    }

    function getFilters(cb) {
        //get filters
        db.collection('filters').find().toArray((err, data) => {
            console.log("Getting latest filter collection...", data)
            cb(err, data);
        });
    }

    app.listen(3330, () => console.log('Example app listening on port 3330!'));

});
