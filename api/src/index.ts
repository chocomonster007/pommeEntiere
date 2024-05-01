import express, { Express, NextFunction, Request, Response } from "express";
import mysql from 'mysql2/promise'
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use('/newUser',(req: Request, res: Response, next: NextFunction)=>{
  if(req.body.username && req.body.mail && req.body.password) next()
  else res.send('Vous n\'avez pas remplit tous les champs')
})

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server prout");
});

app.post("/newUser",async (req: Request, res: Response) =>{

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'pomme_entiere',
    password:"root"
  });
  try {
    const [usernameInBd,]: any = await connection.execute({sql:"SELECT * FROM user WHERE username = ? OR mail = ?",values:[req.body.username, req.body.mail]})
    if (usernameInBd.length === 0){
      
      const passHash = await bcrypt.hash(req.body.password,10)

      await connection.execute(
        'INSERT INTO user (mail,username,password) VALUES (?, ?, ?)',
        [req.body.mail,req.body.username, passHash]
      );
      
      res.send('Nouvelle utilisateur confirmé')
    } else{
      res.send('Pseudo ou mail déjà utilisé')
    }
    }
    catch (err) {
      console.log(err);
      res.send('fail')
    }
    
  connection.end()
 
})

app.post("/auth", async (req : Request, res: Response)=>{

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'pomme_entiere',
    password:"root"
  });

  try {
    const userOrMail = req.body.username ?? req.body.mail
    console.log(userOrMail);
    
    const [results,]:any = await connection.execute(
      'SELECT * FROM user WHERE username = ? OR mail = ?',
      [userOrMail, userOrMail]
    );
    
    if(results.length !== 0){
      const match = await bcrypt.compare(req.body.password, results[0].password)
      if(match){
        res.json({user: results[0].username, id :results[0].id})
      }else{
        res.send("mauvais login/mdp")
      }
    }else{
      res.send("mauvais login/mdp")
    }
    
  } catch (err) {
    console.log(err);
    res.send("fail")
  }
  connection.end() 
})

app.post("/newCommande", async (req : Request, res: Response)=>{

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'pomme_entiere',
    password:"root"
  });
  try {
      console.log(req.body);
      
      await connection.execute(
        'INSERT INTO commandes (id_account,produits) VALUES (?, ?)',
        [req.body.id,req.body.produits]
      );
      
      res.send('Commande enregistré')
  }
    catch (err) {
      console.log(err);
      res.send('fail')
    }
    
  connection.end()
})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});