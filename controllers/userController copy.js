const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User, Basket, BasketDevice, Device, Rating } = require('../models/models')


const generateJwt = (id, email, role) => {
    return jwt.sign(
        { id, email, role },
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    )
}

class UserController {
    async registration(req, res, next) {
        const { email, password, role } = req.body
        if (!email || !password) {
            return next(ApiError.badRequest('Некоректний email або пароль'))
        }
        const candidate = await User.findOne({ where: { email } })
        if (candidate) {
            return next(ApiError.badRequest('Пользователь с таким email уже существует'))
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({ email, role, password: hashPassword })
        const basket = await Basket.create({ userId: user.id })
        const token = generateJwt(user.id, user.email, user.role)
        // const token = jwt.sign(
        //     {id:user.id, email:user.email, role:user.role},
        //     process.env.SECRET_KEY,
        //     {expiresIn: '24h'}
        // )
        return res.json({ token })
    }

    async login(req, res, next) {
        const { email, password } = req.body
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return next(ApiError.internal('Користувача не знайдено'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.internal('Невірний пароль'))
        }
        const token = generateJwt(user.id, user.email, user.role)
        return res.json({ token })
    }

    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.email, req.user.role)
        return res.json({ token })
    }

    async addToBasket(req, res, next) {
        const { idUser, idDevice } = req.body
        const basket = await Basket.findOne(
            {
                where: { userId: idUser }
            }
        )
        console.log(basket.dataValues.id)
        let result = basket.dataValues.id
        const device = await BasketDevice.create(
            {
                deviceId: idDevice,
                basketId: basket.dataValues.id
            }
        );
        console.log(device)
        return res.json(device)
    }

    async minusFromBasket(req, res, next) {
        const { idUser, idDevice } = req.body
        const basket = await Basket.findOne(
            {
                where: { userId: idUser }
            }
        )
        const buferDevices = await BasketDevice.findAll(
            {
                where: {
                    deviceId: idDevice,
                    basketId: basket.dataValues.id
                }
            }
        )
        let buferDevicesIdsArr = buferDevices.map(
            (elem) => {
                return elem.dataValues.id;
            }
        )
        let device = await BasketDevice.destroy(
            {
                where: {
                    id: buferDevicesIdsArr[0],
                },
            }
        );

        return res.json(device)
    }

    async clearBasket(req, res, next) {
        const { idUser } = req.body
        const basket = await Basket.findOne(
            {
                where: { userId: idUser }
            }
        )
        const buferDevices = await BasketDevice.destroy(
            {
                where: {
                    basketId: basket.dataValues.id
                }
            }
        )

        return res.json(basket)
    }

    async fetchDevicesFromBasket(req, res, next) {
        const { idUser } = req.params
        const basket = await Basket.findOne(
            {
                where: { userId: idUser }
            }
        )
        const devicesInBasketDevice = await BasketDevice.findAll(
            {
                where: { basketId: basket.dataValues.id }
            }
        );
        let devicesIdsDevice = devicesInBasketDevice.map(
            elem => elem.deviceId
        )
        const devices = await Device.findAll(
            {
                where: { id: devicesIdsDevice }
            }
        );
        let items = [];
        devicesIdsDevice.forEach(
            (id) => {
                const findDevice = devices.find((obj) => obj.id === id);
                items.push(findDevice)
            }
        )

        return res.json(items)
    }

    async addRate(req, res, next) {
        const { idUser, idDevice, rateValue } = req.body
        console.log(idUser, idDevice, rateValue)

        const rating = await Rating.findOne(
            {
                where: {
                    userId: idUser,
                    deviceId: idDevice
                }
            }
        )
        if (rating === null && rateValue != null) {
            console.log(222222)
            try {
                await Rating.create(
                    {
                        rate: rateValue,
                        userId: idUser,
                        deviceId: idDevice
                    }
                )
            } catch (error) {
                console.log(111111111111111, error.message)
            }
        }
        if (rateValue != null) {
            try {
                await Rating.update(
                    {
                        rate: rateValue,
                    },
                    {
                        where: {
                            userId: idUser,
                            deviceId: idDevice
                        },
                    }
                )
            } catch (error) {
                console.log(error.message)
            }
        }
        const devices = await Rating.findAll(
            {
                where: { deviceId: idDevice }
            }
        )
        let ratesSum = devices.reduce((acc, elem) => {
            return acc + elem.rate;
        }, 0);
        let ratingMiddle = Math.round(
            ratesSum / devices.length
        )

        try {
            await Device.update(
                {
                    rating: ratingMiddle,
                },
                {
                    where: {
                        id: idDevice,
                    },
                }
            )
        } catch (error) {
            console.log(error.message)
        }
        const device = await Device.findOne(
            {
                where: { id: idDevice }
            }
        )

        return res.json(device)
    }

    async getSearchGoods(req, res, next) {
        // const { idUser } = req.params
        const idUser = 7;
       let basket;
        try {
             basket = await Basket.findOne(
                {
                    where: { userId: idUser }
                }
            )
        } catch (error) {
            console.log(error.message)
        }


        return res.json(basket)
    }


}

module.exports = new UserController()
