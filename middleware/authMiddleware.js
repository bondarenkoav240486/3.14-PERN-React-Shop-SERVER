const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        const token = req.headers.authorization.split(' ')[1] // Bearer asfasnfkajsfnjk
        // return res.json({token})

        if (!token) {
            return res.status(401).json({message: "Не авторизован"})
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        // return res.json({decoded})
        // console.log(decoded)

        req.user = decoded
        next()
    } catch (e) {
        // console.log(e)

        res.status(401).json({message: "Не авторизован!"})
        // res.status(403).json({message: "Не авторизован"})
    }
};
