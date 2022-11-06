const app = require("./app");
const dotenv = require("dotenv");
const connectToDB = require("./config/db");
const bodyParser = require("body-parser");

process.on("uncaughtException",(err) => {
    console.log(err.message);
    console.log("Shutting down the server due to uncaught rejection");
    process.exit(1);
})

dotenv.config({path:"backend/config/config.env"});

// connecting to database
connectToDB();

app.use(bodyParser.urlencoded({ extended: false }));

const server = app.listen(process.env.PORT,() => {
    console.log("Server is running...");
});

process.on("unhandledRejection",(err) => {
    console.log(err);
    console.log("Shutting down the server due to unhandled rejection");
    server.close(()=>{
        process.exit(1);
    })
})