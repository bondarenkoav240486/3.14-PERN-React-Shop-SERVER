const { Sequelize } = require('sequelize')

module.exports = new Sequelize(
    process.env.DB_NAME, // Название БД
    process.env.DB_USER, // Пользователь
    process.env.DB_PASSWORD, // ПАРОЛЬ
    {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT
    }
)

// const pool = new Pool({
//     connectionString: process.env.POSTGRES_URL ,
//   })

// module.exports = new Sequelize(

//     process.env.POSTGRES_URL,

//     {
//         dialect: 'postgres',
//     }
// )