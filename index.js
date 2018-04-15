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

    app.get('/filters/:username', (req, res) => {

        var id = uuid(req.params.username, NAMESPACE);

        getFilters(id, (err, data) => {
            if (err) {
                return errCallback(res, err);
            } else {
                return successCallback(res, data);
            }
        });
    });

    app.post('/filters', (req, res) => {

        var id = uuid(req.body.user||null, NAMESPACE);

        getFilters(id, (err, data) => {
            if (err) {
                return errCallback(res, err);
            } else {

                data.filters = data.filters || [];

                req.body.blockList = req.body.blockList || "[]";

                console.log("payload filters", JSON.parse(req.body.blockList), "old filters", data.filters)
                var joinedFilters = lodash.union(data.filters, JSON.parse(req.body.blockList));

                var mergedPayload = {
                    _id: id,
                    filters: joinedFilters,
                    username: req.body.user
                };
                console.log("merged payload", mergedPayload);
                //merge data object before saving
                updateFilters((err, resolvedData) => {
                    if (err) {
                        return errCallback(res, err);
                    } else {
                        return successCallback(res, resolvedData);
                    }
                }, mergedPayload);
            }
        });
    });

    function updateFilters(cb, data) {
        console.log("Updating filters...", data);
        db.collection('filters').save(data, (err, result) => {
            //get latest state in case concurrent update happening elsewhere
            return getFilters(data._id, cb);
        });
    }

    function getFilters(id, cb) {
        //get filters

        var data = db.collection('filters').findOne({_id:id});
        console.log("Getting latest filter collection...", data)
        db(err, data);

    }

    app.listen(3330, () => console.log('Example app listening on port 3330!'));

});
