const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')
const { v4: uuidv4 } = require('uuid') // Импортируем функцию для генерации UUID

const app = express()
const port = 3001

const shopId = '403923' // Замените на ваш shopId
const secretKey = 'test_K2mdBjETILiwpOiyKIazHeovNGGPeMevcXPUIa4VjsM' // Замените на ваш secretKey

app.use(bodyParser.json())
app.use(cors()) // Включение CORS

app.get('/', (req, res) => {
	res.send('Server is running')
})

app.get('/create-payment', (req, res) => {
	res.send('This endpoint is for POST requests only')
})

app.post('/create-payment', async (req, res) => {
	const { amount, currency } = req.body

	try {
		const authHeader =
			'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64')
		const idempotenceKey = uuidv4() // Генерация уникального ключа идемпотентности
		console.log('Authorization Header:', authHeader) // Логирование заголовка авторизации
		console.log('Idempotence Key:', idempotenceKey) // Логирование ключа идемпотентности

		const response = await axios.post(
			'https://api.yookassa.ru/v3/payments',
			{
				amount: {
					value: amount,
					currency: currency,
				},
				confirmation: {
					type: 'redirect',
					return_url: 'http://localhost:3000/success', // URL для возврата после оплаты
				},
				capture: true,
				description: 'Order payment',
			},
			{
				headers: {
					Authorization: authHeader,
					'Content-Type': 'application/json',
					'Idempotence-Key': idempotenceKey, // Добавление ключа идемпотентности
				},
			}
		)

		res.json(response.data)
	} catch (error) {
		console.error(
			'Ошибка при создании платежа:',
			error.response ? error.response.data : error.message
		) // Логирование ошибки
		res
			.status(500)
			.json({ error: error.response ? error.response.data : error.message })
	}
})

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`)
})
