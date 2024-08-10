const Router = require('express')
const router = new Router()
const deviceController = require('../controllers/deviceController')


// router.get('/search-goods', deviceController.getSearchGoods)
// router.get('/filter-price', deviceController.getFilterPriceDevices)
// router.get('/sort-price', deviceController.getSortPriceDevices)
// router.get('/sort-rating', deviceController.getSortRatingDevices)
// router.get('/filter', deviceController.getFilteredDevices);

router.post('/', deviceController.create)
// router.get('/', deviceController.getAll)
router.get('/', deviceController.getAll2)
router.get('/:id', deviceController.getOne)
// router.get('/search-goods', deviceController.getSearchGoods)


module.exports = router
