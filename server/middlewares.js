const jwt = require('jsonwebtoken')
require('dotenv').config();

const jwtAuth = (req, res, next) => {
    try{
        const Authorization = req.header("Authorization")
        const token = Authorization.split(' ')[1]
        if(!token){
            return res.status(401).json({message: "Token is missing"})
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = decodedToken
        next()
    } catch(e) {
        console.log("Ошибка верификации " + e.message)
        return res.status(401).json({message: "Token is missing"})
    }
}

module.exports = { jwtAuth };