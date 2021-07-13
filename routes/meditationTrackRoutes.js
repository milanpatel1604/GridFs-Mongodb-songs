const express = require('express');
const meditationTrackRoute = express.Router()

const fs = require('fs');
const path = require('path');
var staticFilesPath = path.join(__dirname, '../static');

const mongodb = require('mongodb');
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';


// connecting to database url
var result = mongodb.MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, (error, dbs) => {
    if (error) {
        return res.status(503).json({ status: "error", error: `${error}` });
    }
    console.log("connected to the database server");
    result = dbs;
})


// testing purpose web page
meditationTrackRoute.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})


//GET  /api/meditationTracks --fetching all tracks of meditation
meditationTrackRoute.get('/meditationTracks', (req, res)=>{
    const trackDB = result.db('breathing-app-trackdb')
    console.log("connected to the track Database ");
    trackDB.collection('fs.files').find({}).toArray(function(err, docs){
        if(err){
            return res.json({status: "error", error:`${err}`});
        }
        for(let i=0;i<docs.length; i++){
            console.log(docs[i].filename);
        }
    })
})



// GET  /api/ULiveStream --uploading to db (Testing)
meditationTrackRoute.get('/ULiveStream', (req, res) => {

    // connecting to particular database in url
    const trackDB = result.db('breathing-app-trackdb')
    console.log("connected to the track Database ");
    const bucket = new mongodb.GridFSBucket(trackDB);
    const videoUploadStream = bucket.openUploadStream("audio_03");
    const videoReadStream = fs.createReadStream(staticFilesPath + "/music_meditation.mp3");
    videoReadStream.pipe(videoUploadStream);


});


// GET  /api/DLiveStream/:trackName  --fetching perticular audio file from db
meditationTrackRoute.get('/DLiveStream/:trackName', (req, res) => {

    // pass the unique track name through params
    const trackName = req.params.trackName;
    console.log("got downloading request")

    // range headers are requested from frontend
    const range = req.headers.range;
    if (!range) {
        return res.json({ status: "400", message: "Require range header" });
    }

    // connecting to particular database in url
    const trackDB = result.db('breathing-app-trackdb')
    console.log("connected to the track Database ");
    trackDB.collection('fs.files').findOne({ filename: `${trackName}` }, (err, audio) => {
        if (!audio) {
            return res.json({ status: '404', error: 'Track is not available' })
        }else if(err){
            return res.json({status: "error", error:`${err}`});
        }

        const trackSize = audio.length;
        const start = Number(range.replace(/\D/g, ""))
        const end = trackSize - 1;

        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${trackSize}`,
            "Accept-Range": `bytes`,
            "Content-Length": contentLength,
            "Content-Type": "audio/mp3"
        };

        res.writeHead(206, headers);

        const bucket = new mongodb.GridFSBucket(trackDB);
        const downloadStream = bucket.openDownloadStreamByName(`${trackName}`, {
            start
        });

        downloadStream.pipe(res);
    })
});


module.exports = meditationTrackRoute;