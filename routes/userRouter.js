const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get(
    '/auth', 
    authMiddleware, 
    userController.check
)
// router.get('/basket/:id', userController.basket)
router.post('/add-to-basket', userController.addToBasket)
router.post('/minus-from-basket', userController.minusFromBasket)
router.post('/clear-basket', userController.clearBasket)
router.get('/devicesinbasket/:idUser', userController.fetchDevicesFromBasket)
router.post('/add-rate', userController.addRate)
router.get('/search-goods', userController.getSearchGoods)

// router.get(
//     '/auth',
//     (req, res) => {
//         res.json({message: 'ALL WORKING!!!'})
//     }    
// )

module.exports = router
