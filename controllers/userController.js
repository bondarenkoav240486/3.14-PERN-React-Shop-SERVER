const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Basket, BasketDevice, Device, Rating } = require('../models/models');

const generateJwt = (id, email, role) => {
    return jwt.sign(
        { id, email, role },
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    );
};

class UserController {
    async registration(req, res, next) {
        try {
            const { email, password, role } = req.body;
            if (!email || !password) {
                return next(ApiError.badRequest('Некоректний email або пароль'));
            }
            const candidate = await User.findOne({ where: { email } });
            if (candidate) {
                return next(ApiError.badRequest('Користувач з таким email вже існує'));
            }
            const hashPassword = await bcrypt.hash(password, 5);
            const user = await User.create({ email, role, password: hashPassword });
            const basket = await Basket.create({ userId: user.id });
            const token = generateJwt(user.id, user.email, user.role);
            return res.json({ token });
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

    async login(req, res, next) {
        try {

            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return next(ApiError.internal('Користувача не знайдено'));
            }
            let comparePassword = bcrypt.compareSync(password, user.password);
            if (!comparePassword) {
                return next(ApiError.internal('Невірний пароль'));
            }
            const token = generateJwt(user.id, user.email, user.role);
            return res.json({ token });
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

    async check(req, res, next) {
        try {

            const token = generateJwt(req.user.id, req.user.email, req.user.role);
            return res.json({ token });
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

    async addToBasket(req, res, next) {
        try {

            const { idUser, idDevice } = req.body;
            const basket = await Basket.findOne({ where: { userId: idUser } });
            console.log(basket.dataValues.id);
            let result = basket.dataValues.id;
            const device = await BasketDevice.create({ deviceId: idDevice, basketId: basket.dataValues.id });
            console.log(device);
            return res.json(device);
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

    async minusFromBasket(req, res, next) {
        try {

            const { idUser, idDevice } = req.body;
            const basket = await Basket.findOne({ where: { userId: idUser } });
            const buferDevices = await BasketDevice.findAll({
                where: { deviceId: idDevice, basketId: basket.dataValues.id }
            });
            let buferDevicesIdsArr = buferDevices.map(elem => elem.dataValues.id);
            let device = await BasketDevice.destroy({ where: { id: buferDevicesIdsArr[0] } });
            return res.json(device);
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

    async clearBasket(req, res, next) {
        try {

            const { idUser } = req.body;
            const basket = await Basket.findOne({ where: { userId: idUser } });
            const buferDevices = await BasketDevice.destroy({ where: { basketId: basket.dataValues.id } });
            return res.json(basket);
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

    async fetchDevicesFromBasket(req, res, next) {
        try {
            const { idUser } = req.params;
            const basket = await Basket.findOne({ where: { userId: idUser } });
            const devicesInBasketDevice = await BasketDevice.findAll({ where: { basketId: basket.dataValues.id } });
            let devicesIdsDevice = devicesInBasketDevice.map(elem => elem.deviceId);
            const devices = await Device.findAll({ where: { id: devicesIdsDevice } });
            let items = [];
            devicesIdsDevice.forEach(id => {
                const findDevice = devices.find(obj => obj.id === id);
                items.push(findDevice);
            });
            return res.json(items);
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

    async addRate(req, res, next) {
        try {


            const { idUser, idDevice, rateValue } = req.body;
            console.log(idUser, idDevice, rateValue);

            const rating = await Rating.findOne({
                where: { userId: idUser, deviceId: idDevice }
            });
            if (rating === null && rateValue != null) {
                try {
                    await Rating.create({ rate: rateValue, userId: idUser, deviceId: idDevice });
                } catch (error) {
                    console.log(error.message);
                }
            }
            if (rateValue != null) {
                try {
                    await Rating.update(
                        { rate: rateValue },
                        { where: { userId: idUser, deviceId: idDevice } }
                    );
                } catch (error) {
                    console.log(error.message);
                }
            }
            const devices = await Rating.findAll({ where: { deviceId: idDevice } });
            let ratesSum = devices.reduce((acc, elem) => acc + elem.rate, 0);
            let ratingMiddle = Math.round(ratesSum / devices.length);

            try {
                await Device.update(
                    { rating: ratingMiddle },
                    { where: { id: idDevice } }
                );
            } catch (error) {
                console.log(error.message);
            }
            const device = await Device.findOne({ where: { id: idDevice } });

            return res.json(device);
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

    async getSearchGoods(req, res, next) {
        try {

            // const { idUser } = req.params
            const idUser = 7;
            let basket;
            try {
                basket = await Basket.findOne({ where: { userId: idUser } });
            } catch (error) {
                console.log(error.message);
            }

            return res.json(basket);
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

}

module.exports = new UserController();
