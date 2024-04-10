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

    async getAll(req, res) {
        let { brandId, typeId, limit, page } = req.query
        // let {brandId, typeId} = req.query
        page = page || 1
        limit = limit || 9
        let offset = page * limit - limit
        let devices;
        if (!brandId && !typeId) {
            devices = await Device.findAndCountAll({ limit, offset })
            // devices = await Device.findAll()
        }
        if (brandId && !typeId) {
            devices = await Device.findAndCountAll({ where: { brandId }, limit, offset })
            // devices = await Device.findAll( {where:{brandId}} )
        }
        if (!brandId && typeId) {
            devices = await Device.findAndCountAll({ where: { typeId }, limit, offset })
            // devices = await Device.findAll( {where:{typeId}} )
        }
        if (brandId && typeId) {
            devices = await Device.findAndCountAll({ where: { typeId, brandId }, limit, offset })
            // devices = await Device.findAll( {where:{typeId, brandId}} )
            // res.send( devices )
        }
        return res.json(devices)
    }

    async getOne(req, res) {
        const { id } = req.params
        const device = await Device.findOne(
            {
                where: { id },
                include: [{ model: DeviceInfo, as: 'info' }]
            },
        )
        return res.json(device)
    }

    async getSearchGoods(req, res, next) {
        try {
            const { searchTerm } = req.query;
            const products = await Device.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${searchTerm}%` // Використовуємо iLike для ігнорування регістру
                    }
                }
            });
            res.json(products);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Помилка сервера' });
        }
    }

    async getFilterPriceDevices(req, res, next) {
        const { minPrice, maxPrice } = req.query;

        try {
            const products = await Device.findAll({
                where: {
                    price: {
                        [Op.between]: [minPrice, maxPrice] // Пошук у діапазоні цін
                    }
                }
            });
            res.json(products);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Помилка сервера' });
        }
    }

    async getSortPriceDevices(req, res, next) {
        const { sortBy } = req.query;

        try {
            let products;
            if (sortBy === 'asc') {
                products = await Device.findAll({
                    order: [['price', 'ASC']]
                });
            } else if (sortBy === 'desc') {
                products = await Device.findAll({
                    order: [['price', 'DESC']]
                });
            } else {
                // Якщо sortBy не визначено, просто повертаємо всі товари
                products = await Device.findAll();
            }
            res.json(products);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Помилка сервера' });
        }
    }

    async getSortRatingDevices(req, res, next) {
        const { sortBy } = req.query;

        try {
            let products;
            if (sortBy === 'asc') {
                products = await Device.findAll({
                    order: [['rating', 'ASC']]
                });
            } else if (sortBy === 'desc') {
                products = await Device.findAll({
                    order: [['rating', 'DESC']]
                });
            } else {
                // Якщо sortBy не визначено, просто повертаємо всі товари
                products = await Device.findAll();
            }
            res.json(products);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Помилка сервера' });
        }
    }

}

module.exports = new DeviceController()

