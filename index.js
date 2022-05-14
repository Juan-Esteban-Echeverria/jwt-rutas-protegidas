
const express = require("express")
const jwt = require("jsonwebtoken")

const {results} = require("./data/agentes.js")
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(express.static(__dirname + "/public"))


// RUTA DE AUTENTICACION DE AGENTE Y GENERACION DE TOKEN
app.post("/SignIn", (req, res) => { 
    const {email, password} = req.body

    // AUTENTICACION DE EMAIL
    const existeElAgente = results.find(user => {
        return user.email === email
    })
    if(existeElAgente === undefined){
        res.status(401).json({msg: 'credenciales no validas'})
    }

    // AUTENTICACION DE PASSWORD
    const esSuClave = existeElAgente.password
    if(esSuClave != password){
        res.status(401).json({msg: 'credenciales no validas'})
    }
    
    // GENERACION DE TOKEN (EXPIRACION 2 MINUTOS)
    const payload = {email}
    const token = jwt.sign(payload, "palabrasupersecreta", {expiresIn: 120})

    // RESPUESTA HTML // GUARDADO DE TOKEN EN LOCALSTORAGE // HIPERENLACE RUTA RESTRINGIDA
    res.send(` 
    <a href="/area51?token=${token}"> <p> Ir al Area 51 </p> </a> 
    Bienvenido, ${email}. 
     
    <script> 
    localStorage.setItem('token', JSON.stringify("${token}")) 
    </script> 
    `);
        
 })


// RUTA RESTRINGIDA // MENSAJE DE BIENVENIDA // AUTENTICACION POR TOKEN Y SUS DESCRIPCIONES
 app.get("/area51", (req, res) => {
    const {token} = req.query

    if(!token) return res.status(403).json({msg: 'no existe el token'})

    try {
        const payload = jwt.verify(token, "palabrasupersecreta");
        return res.send(` 
            Bienvenido al Area 51 ${payload.email} 
            `);

   } catch (error) {
       if(error.message === 'jwt expired'){
           return res.status(401).json({msg: 'token expirado'})
       }
       console.log(error)
       return res.status(401).json({msg: 'token no valido'})
   }
 })




app.listen(5000, console.log("Server ON"))