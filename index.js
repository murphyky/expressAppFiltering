const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const uuid = require('uuid/v5');
const NAMESPACE = "9f264d74-96cd-46e3-9547-9618fc3ac247";

MongoClient.connect('mongodb://resFilterUser:km890889@localhost:27017/', (err,
    client) => {

	if (err) 
		return console.log(err);

	db = client.db('reseteraFilters');

    app.use(cors())

    app.use(bodyParser.json({
        type: "application/json"
    }))

    /*
    app.use(bodyParser.urlencoded({
        extended: true
    }));*/

    app.set('view engine', 'ejs');

    app.get('/', (req, res) => {

    	db.collection('filters').find().toArray((err, result) => {
    			if (err) return console.log(err);
    			res.render('index.ejs', {quotes: result});
    		})
    });

    app.post('/filters', (req, res) => {
        console.log("saved this to mongo",req.body, typeof req.body);

        var data = {
            _id: uuid(req.body.username||null, NAMESPACE),
            filters: req.body
        };
        console.log("data", data)
    	db.collection('filters').save(req.body, (err,
    		result) => {
    		if (err) {
                res.status(500).end({message:"Error occurred",err:err});
            } else {
                res.status(200).send({message: "Saved successfully", result: result})
            }

            });
    });

    app.listen(3330, () => console.log('Example app listening on port 3330!'));

});
