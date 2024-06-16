const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')
const { v4: uuidv4 } = require('uuid') // Импортируем функцию для генерации UUID

const app = express()
const port = 3001

const shopId = '506751' // Замените на ваш shopId
const shopArticleId = '538350' // Замените на ваш shopArticleId
const telegramBotToken = '7287053876:AAHA67oKvVDzNxPZZbsHgL873GyrmJA_Tg0' // Замените на ваш токен бота

app.use(bodyParser.json())
app.use(cors()) // Включение CORS

app.get('/', (req, res) => {
	res.send('Server is running')
})

app.get('/create-payment', (req, res) => {
	res.send('This endpoint is for POST requests only')
})

app.post('/create-payment', async (req, res) => {
	const { amount, currency, chatId } = req.body

	try {
		const idempotenceKey = uuidv4() // Генерация уникального ключа идемпотентности
		console.log('Idempotence Key:', idempotenceKey) // Логирование ключа идемпотентности

		const response = await axios.post(
			`https://api.telegram.org/bot${telegramBotToken}/sendInvoice`,
			{
				chat_id: chatId,
				title: 'Order Payment',
				description: 'Payment for your order',
				payload: idempotenceKey,
				provider_token: shopId, // Используйте ваш shopId как provider_token
				start_parameter: 'get_access',
				currency: currency,
				prices: [{ label: 'Total', amount: amount * 100 }], // Сумма в копейках
				provider_data: {
					shop_article_id: shopArticleId, // Используйте ваш shopArticleId
					return_url: 'http://localhost:3000/success', // URL для возврата после оплаты
				},
			}
		)

		console.log('Telegram API response:', response.data) // Логирование ответа Telegram API
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
