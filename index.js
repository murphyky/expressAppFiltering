const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');

MongoClient.connect('mongodb://resFilterUser:km890889@localhost:27017/', (err,
    client) => {

	if (err) 
		return console.log(err);

	db = client.db('reseteraFilters');

    app.use(cors())

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.set('view engine', 'ejs');

    app.get('/', (req, res) => {

    	db.collection('filters').find().toArray((err, result) => {
    			if (err) return console.log(err);
    			res.render('index.ejs', {quotes: result});
    		})
    });

    app.post('/filters', (req, res) => {

    	db.collection('filters').save(req.body, (err,
    		result) => {
    		if (err) return console.log(err)

    		console.log("saved to database")
    	})
    });

    app.listen(3330, () => console.log('Example app listening on port 3330!'));

});
