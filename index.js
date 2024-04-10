// 5)!!!!!!
require('dotenv').config()

// 1)!!!!!!
const express = require('express')

// 6)!!!!!!
const sequelize = require('./db')
const models = require('./models/models')

// 10)!!!!!!
const cors = require('cors')

// 17)
const fileUpload = require('express-fileupload')

// 14)!!!!!!
const router = require('./routes/index')

// 16)!!!!!!
const errorHandler = require('./middleware/ErrorHandlingMiddleware')

// 18)!!!
const path = require('path')

// 3)!!!!!!
const PORT = process.env.PORT || 5000

// 2)!!!!!!
const app = express()

// 4)!!!!!!
// app.listen(
//     PORT,
//     // callback
//     ()=>console.log( `Server started on port ${PORT}` )
// )


// 11)!!!!!!
// for requests from brauser to server
app.use(cors())

// 12)!!!!!!
// we do this so that our application can parse json format
app.use(express.json())

// 13)!!!!!!
// TEST
// app.get(
//     '/', 
//     (req, res) => {
//         res.status(200).json({message: 'WORKING!!!'})
//         // res.send('aaaaaa')

//     }   
// )

// 19)!!!
// for razdacha statiki
app.use(express.static(path.resolve(__dirname, 'static')))

// 18)!!!!!!
// for work with files
app.use(fileUpload({}))

// 15)!!!!!!
app.use('/api', router)

// // Обработка ошибок, последний Middleware
app.use(errorHandler)

// 7)!!!!!!
const start = async () => {
    try {

        // 10)!!!!!!
        await sequelize.authenticate()

        // 11)!!!!!!
        await sequelize.sync()

        // 8)!!!!!!
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

// 9)!!!!!!
start()
