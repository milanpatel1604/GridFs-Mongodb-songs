const express = require("express");
const morgan = require("morgan");
const meditationTrackRoute = require("./routes/meditationTrackRoutes");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use("/api", meditationTrackRoute);



module.exports = app;