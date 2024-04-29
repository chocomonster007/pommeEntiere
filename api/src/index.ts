import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use((req: Request, res: Response, next)=>{
  var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database: "pomme_entiere"
});

connection.connect(function(err: any) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});
console.log();

next()
})

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server prout");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});