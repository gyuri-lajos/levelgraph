// https://theusualstuff.com/handle-form-data-express-get-post-method/
const https = require("https"),

    fs = require("fs");


//import the express module
var express = require('express');

//import body-parser
var bodyParser = require('body-parser');

//store the express in a variable 
var app = express();

app.use(express.static('public'));

var origin1 = "https://gyuri.opidox.com"
var origin2 = "http://localhost:8080"
var origin3 = "https://hub.opidox.com"
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', origin2);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'content-Type,x-requested-with');
    next();
});
//configure body-parser for express
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '6mb' }));


//route the GET request to the specified path, "/user". 
//This sends the user information to the path  
app.get('/user', function (req, res) {
    response = {
        first_name: req.query.first_name,
        last_name: req.query.last_name,
        gender: req.query.gender
    };

    //this line is optional and will print the response on the command prompt
    //It's useful so that we know what infomration is being transferred 
    //using the server
    console.log(response);

    //convert the response in JSON format
    res.end(JSON.stringify(response));
});


//route the POST request to the specified path, "/user". 
//This sends the user information to the path  
app.post('/user', function (req, res) {
    response = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        gender: req.body.gender
    };

    //this line is optional and will print the response on the command prompt
    //It's useful so that we know what infomration is being transferred 
    //using the server
    response = req.body
    //const main = async () {
    db.put(req.body.id, JSON.stringify(req.body))
    x = db.get(req.body.id, function (err, value) {

        //convert the response in JSON format

        if (err) {
            res.end(err)
        }
        else {
            console.log("x", value)
            res.end(JSON.stringify(value));
        }
    }
    )



});

// setup db
var level = require("level-browserify");

var db = level("test4")

app.post('/dots',
    async function (req, res) {
        console.log(req.body.length)
        let successCount = 0
        let failureCount = 0

        const callback = (results, failureCount, successCount) => {
            results = results.reduce((a, b) => { return a + b })
            let response = "<br>saved: " + successCount + " failed:" + failureCount + '<br>' +
                results
            console.log(response)
            res.send(response)
        }
        async function main(callback) {
            let count = 0;
            let max = req.body.length - 1
            const results = []
            req.body.forEach(dot => {
                let result
                db.put(dot.a, JSON.stringify(dot), function (error, value) {

                    if (error) {
                        console.log(error, dot)
                        failureCount = failureCount + 1
                        result = error + dot.t
                    }
                    else {
                        console.log(dot.t)
                        successCount = successCount + 1
                        result = dot.t
                    }
                    results.push(result + '<br>')
                    if (results.length === max) {
                        callback(results, failureCount, successCount)
                    }

                })

            })
            return results
        }
        main(callback)


    }
)

app.get('/dots/', (req, res) => {
    let result = {}
    count = 0;
    stream = db.createReadStream()
    query = req.query
    if (query) {
        if (query.as) {
        dots = query.as.split(',')
        result = []
     //   result = dots.reduce(function (a,b) {
         count = dots.length
         while(dots.length>0) {
            db.get(dots[0],function (err,value){
                result.push(JSON.parse(value))
                count = count-1
                if (count===0) {
                    res.end(JSON.stringify(result));
                }
            })
            dots.shift()
           
         }
        } else {
            res.end("Error: expect query string ?as=<comma separated list of anchor dot ids")
        }
        return
    } else {
    stream.on('data', function (entry) {
        console.log(entry.value);

        result[entry.key] = JSON.parse(entry.value)

        count = count + 1
    })
    stream.on('end', () => {
    res.jsonp( result)
    })
    }
})

//This piece of code creates the server  
//and listens to the request at port 8888
//we are also generating a message once the 
//server is created
var server = app.listen(8888, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port);
});

const options = {
    key: fs.readFileSync("./key.pem"),
    cert: fs.readFileSync("./cert.pem")
};

https.createServer(options, app).listen(448);