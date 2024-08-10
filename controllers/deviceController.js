const uuid = require('uuid')
const path = require('path');
const { Device, DeviceInfo } = require('../models/models')
const ApiError = require('../error/ApiError');
const { Op } = require('sequelize');

class DeviceController {
    async create(req, res, next) {
        try {
            let { name, price, brandId, typeId, info } = req.body
            const { img } = req.files
            let fileName = uuid.v4() + ".jpg"
            // move file to directiry STATIC
            img.mv(path.resolve(__dirname, '..', 'static', fileName))
            const device = await Device.create({ name, price, brandId, typeId, img: fileName });
            if (info) {
                info = JSON.parse(info)
                info.forEach(i =>
                    DeviceInfo.create({
                        title: i.title,
                        description: i.description,
                        deviceId: device.id
                    })
                )
            }

            return res.json(device)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    // async getAll(req, res) {
    //     try {
    //         let { brandId, typeId, limit, page } = req.query
    //         // let {brandId, typeId} = req.query
    //         page = page || 1
    //         limit = limit || 9
    //         let offset = page * limit - limit
    //         let devices;
    //         if (!brandId && !typeId) {
    //             devices = await Device.findAndCountAll({ limit, offset })
    //             // devices = await Device.findAll()
    //         }
    //         if (brandId && !typeId) {
    //             devices = await Device.findAndCountAll({ where: { brandId }, limit, offset })
    //             // devices = await Device.findAll( {where:{brandId}} )
    //         }
    //         if (!brandId && typeId) {
    //             devices = await Device.findAndCountAll({ where: { typeId }, limit, offset })
    //             // devices = await Device.findAll( {where:{typeId}} )
    //         }
    //         if (brandId && typeId) {
    //             devices = await Device.findAndCountAll({ where: { typeId, brandId }, limit, offset })
    //             // devices = await Device.findAll( {where:{typeId, brandId}} )
    //             // res.send( devices )
    //         }
    //         return res.json(devices)
    //     } catch (e) {
    //         console.log(e.message)
    //         return res.json(e.message)
    //     }
    // }

    async getOne(req, res) {
        try {
            const { id } = req.params
            const device = await Device.findOne(
                {
                    where: { id },
                    include: [{ model: DeviceInfo, as: 'info' }]
                },
            )
            return res.json(device)
        } catch (e) {
            console.log(e.message)
        }
    }

    // async getSearchGoods(req, res, next) {
    //     try {
    //         const { searchTerm } = req.query;
    //         const products = await Device.findAll({
    //             where: {
    //                 name: {
    //                     [Op.iLike]: `%${searchTerm}%` // Використовуємо iLike для ігнорування регістру
    //                 }
    //             }
    //         });
    //         res.json(products);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).json({ message: 'Помилка сервера' });
    //     }
    // }

    // async getFilterPriceDevices(req, res, next) {
    //     const { minPrice, maxPrice } = req.query;

    //     try {
    //         const products = await Device.findAll({
    //             where: {
    //                 price: {
    //                     [Op.between]: [minPrice, maxPrice] // Пошук у діапазоні цін
    //                 }
    //             }
    //         });
    //         res.json(products);
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json({ message: 'Помилка сервера' });
    //     }
    // }

    // async getSortPriceDevices(req, res, next) {
    //     const { sortBy } = req.query;

    //     try {
    //         let products;
    //         if (sortBy === 'asc') {
    //             products = await Device.findAll({
    //                 order: [['price', 'ASC']]
    //             });
    //         } else if (sortBy === 'desc') {
    //             products = await Device.findAll({
    //                 order: [['price', 'DESC']]
    //             });
    //         } else {
    //             // Якщо sortBy не визначено, просто повертаємо всі товари
    //             products = await Device.findAll();
    //         }
    //         res.json(products);
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json({ message: 'Помилка сервера' });
    //     }
    // }

    // async getSortRatingDevices(req, res, next) {
    //     const { sortBy } = req.query;

    //     try {
    //         let products;
    //         if (sortBy === 'asc') {
    //             products = await Device.findAll({
    //                 order: [['rating', 'ASC']]
    //             });
    //         } else if (sortBy === 'desc') {
    //             products = await Device.findAll({
    //                 order: [['rating', 'DESC']]
    //             });
    //         } else {
    //             // Якщо sortBy не визначено, просто повертаємо всі товари
    //             products = await Device.findAll();
    //         }
    //         res.json(products);
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json({ message: 'Помилка сервера' });
    //     }
    // }


    // async getFilteredDevices(req, res) {
    //     const { typeId, brandIds, priceRange, page, limit } = req.query;
    //     console.log('Params:', { typeId, brandIds, priceRange, page, limit });

    //     const offset = (parseInt(page || 1) - 1) * parseInt(limit || 5);
    //     const brandsArray = brandIds ? brandIds.split(',').map(id => parseInt(id)) : [];
    //     const [minPrice, maxPrice] = priceRange ? priceRange.split(',').map(price => parseInt(price)) : [0, 100000];

    //     const whereClause = {
    //         ...(typeId && { typeId: parseInt(typeId) }),
    //         ...(brandsArray.length && { brandId: { [Op.in]: brandsArray } }),
    //         ...(priceRange && { price: { [Op.between]: [minPrice, maxPrice] } })
    //     };

    //     try {
    //         const devices = await Device.findAndCountAll({
    //             where: whereClause,
    //             limit: parseInt(limit),
    //             offset: offset
    //         });
    //         return res.json(devices);
    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).json({ message: 'Помилка сервера' });
    //     }
    // }



    async getAll2(req, res, next) {
        try {
            let { typeId, brandIds, priceRange, sortBy, order, searchQuery, page, limit } = req.query;
            page = page || 1;
            limit = limit || 5;
            let offset = (page - 1) * limit;

            let where = {};
            // if (typeId) where.typeId = typeId;
            if (typeId && typeId !== '0') where.typeId = typeId; // Додаємо умову для обробки '0'

            if (brandIds) where.brandId = { [Op.in]: brandIds.split(',') };
            // if (minPrice) where.price = { [Op.gte]: parseFloat(minPrice) };
            // if (maxPrice) {
            //     where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };
            // }
            // Додаємо обробку priceRange
            console.log(
                1111111, `priceRange  :  `, priceRange
            )
            // Додаємо обробку priceRange
            if (priceRange) {
                let [minPrice, maxPrice] = priceRange.split(',').map(price => parseFloat(price));
                if (!isNaN(minPrice) && !isNaN(maxPrice)) {
                    where.price = { [Op.between]: [minPrice, maxPrice] };
                } else if (!isNaN(minPrice)) {
                    where.price = { [Op.gte]: minPrice };
                } else if (!isNaN(maxPrice)) {
                    where.price = { [Op.lte]: maxPrice };
                }
            }
            console.log(
                3333333333333333,
                `priceRange  :  `, priceRange,
                ` where.price  :  `, where.price,
            )
            if (searchQuery) {
                where.name = { [Op.iLike]: `%${searchQuery}%` };
            }

            let orderClause = [];
            if (sortBy && order) {
                orderClause.push([sortBy, order]);
            }
            // Додаємо сортування за id для уникнення повторення товарів
            orderClause.push(['id', 'ASC']);

            // Отримати загальну кількість записів
            const count = await Device.count({ where });

            // Отримати сторінкові записи
            const devices = await Device.findAll({
                where,
                order: orderClause,

                limit,
                offset,
                // order: orderClause,
                include: [{ model: DeviceInfo, as: 'info' }]
            });

            return res.json({ count, rows: devices });
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }






    // інші методи...
}







module.exports = new DeviceController()

