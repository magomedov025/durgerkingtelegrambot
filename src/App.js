import { useEffect, useState } from 'react'
import './App.css'
import Card from './Components/Card/Card'
import Cart from './Components/Cart/Cart'
const { getData } = require('./db/db')
const foods = getData()

const tele = window.Telegram.WebApp

function App() {
	const [cartItems, setCartItems] = useState([])
	const [isCheckoutSuccessful, setIsCheckoutSuccessful] = useState(false)

	useEffect(() => {
		tele.ready()
		console.log('Telegram Web App initialized:', tele) // Логирование инициализации
		console.log('Telegram User Data:', tele.initDataUnsafe.user) // Логирование данных пользователя

		// Проверка параметров URL после возврата пользователя
		const urlParams = new URLSearchParams(window.location.search)
		const paymentStatus = urlParams.get('status')

		if (paymentStatus === 'success') {
			setIsCheckoutSuccessful(true)
		}
	}, [])

	const onAdd = food => {
		const exist = cartItems.find(x => x.id === food.id)
		if (exist) {
			setCartItems(
				cartItems.map(x =>
					x.id === food.id ? { ...exist, quantity: exist.quantity + 1 } : x
				)
			)
		} else {
			setCartItems([...cartItems, { ...food, quantity: 1 }])
		}
	}

	const onRemove = food => {
		const exist = cartItems.find(x => x.id === food.id)
		if (exist.quantity === 1) {
			setCartItems(cartItems.filter(x => x.id !== food.id))
		} else {
			setCartItems(
				cartItems.map(x =>
					x.id === food.id ? { ...exist, quantity: exist.quantity - 1 } : x
				)
			)
		}
	}

	const onCheckout = async () => {
		const totalAmount = cartItems.reduce(
			(total, item) => total + item.price * item.quantity,
			0
		)

		try {
			const chatId = tele.initDataUnsafe.user?.id
			if (!chatId) {
				throw new Error('User ID not found')
			}

			const response = await fetch('http://87.228.9.67:3001/create-payment', {
				// Обновите URL
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					amount: totalAmount.toFixed(2), // Сумма в формате строки с двумя знаками после запятой
					currency: 'RUB',
					chatId: chatId, // Получение chatId из Telegram Web App
				}),
			})

			const payment = await response.json()
			console.log('Payment response:', payment) // Логирование ответа платежа

			if (payment.ok) {
				tele.MainButton.setText('Оплатить')
				tele.MainButton.show()
				tele.MainButton.onClick(() => {
					console.log('MainButton clicked') // Логирование клика по кнопке
					tele.openInvoice(payment.result.invoice_link)
				})
			}
		} catch (error) {
			console.error('Ошибка при создании платежа:', error)
		}
	}

	return (
		<>
			<h1 className='heading'>Order Food</h1>
			{!isCheckoutSuccessful ? (
				<>
					<Cart cartItems={cartItems} onCheckout={onCheckout} />
					<div className='cards__container'>
						{foods.map(food => {
							return (
								<Card
									food={food}
									key={food.id}
									onAdd={onAdd}
									onRemove={onRemove}
								/>
							)
						})}
					</div>
				</>
			) : (
				<div style={{ color: 'green' }}>Оплата прошла успешно!</div>
			)}
		</>
	)
}

export default App
