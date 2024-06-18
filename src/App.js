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
			const response = await fetch('https://31.128.40.24:3001/create-payment', {
				// Используйте HTTP URL
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					amount: totalAmount.toFixed(2), // Сумма в формате строки с двумя знаками после запятой
					currency: 'RUB',
				}),
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const payment = await response.json()

			if (payment.confirmation && payment.confirmation.confirmation_url) {
				window.location.href = payment.confirmation.confirmation_url
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
