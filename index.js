const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const uuid = require('uuid/v5');
const NAMESPACE = "9f264d74-96cd-46e3-9547-9618fc3ac247";
const lodash = require('lodash');

MongoClient.connect('mongodb://filterUser:km890889@localhost:27017/', (err,
    client) => {

	if (err) 
		return console.log(err);

	db = client.db('filters');

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

        var userName = req.body.user;

        getFilters(id, (err, data) => {
            if (err) {
                return errCallback(res, err);
            } else {

                //filters are array where elements are filter-value and userId
                req.body.blockList = req.body.blockList || "[]";
                req.body.unblockList = req.body.unblockList || "[]";
                var createDate = req.body.createDate ? new Date(req.body.createDate) : new Date();

                var payload = {
                    userName: userName,
                    blockList: JSON.parse(req.body.blockList),
                    unblockList: JSON.parse(req.body.unblockList),
                    createDate: createDate
                };

                //merge data object before saving
                updateFilters((err, resolvedData) => {
                    if (err) {
                        return errCallback(res, err);
                    } else {
                        return successCallback(res, resolvedData);
                    }
                }, payload);
            }
        });
    });


    /*****
    {
        data: {
            username: String,
            blockList: Array: [{value: String, created: Date}],
            unblockList: Array: [{value: String, created: Date}]
        }
    }
    *****/
    function updateFilters(cb, data) {
        console.log("Updating filters...", data);

        db.collections.remove({"username": data.username, "filters": {
            "$and": [{
                "$in": data.unblockList
            }, {
                "created": {
                    "$lt": data.createDate
                }
            }]
        }} (err, responseData) => {

            data.blockList.forEach(function(datum){
                datum._id = uuid(datum.value||null, NAMESPACE);
            });

            db.collection('filters').update({"username": data.username, 
                "$addToSet": {
                    "filters": {"$each": data.blockList}
                }
            }, (err, result) => {
                //get latest state in case concurrent update happening elsewhere
                return getFilters(data.username, cb);
            })
        });

    }

    function getFilters(userName, cb) {
        //get filters
        return db.collection("filters").find({users: userName})
        .then(function(data){
            console.log("Getting latest filter collection...", data);
            cb(err, data);
        }, function(err){
            cb(err, null);
        });
    }

    app.listen(3330, () => console.log('Example app listening on port 3330!'));

});
