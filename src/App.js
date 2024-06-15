import { useEffect, useState } from 'react'
import './App.css'
import Card from './Components/Card/Card'
import Cart from './Components/Cart/Cart'
const { getData } = require('./db/db')
const foods = getData()

const tele = window.Telegram.WebApp

function App() {
	const [cartItems, setCartItems] = useState([])

	useEffect(() => {
		tele.ready()
	})

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

	const onCheckout = () => {
		// Подготовка данных для оплаты, например, суммы заказа
		const totalAmount = cartItems.reduce(
			(total, item) => total + item.price * item.quantity,
			0
		)

		// Вызов API для обработки оплаты (пример использования setTimeout вместо реального вызова API)
		console.log('Обработка оплаты...')
		setTimeout(() => {
			// Предположим, что оплата прошла успешно
			console.log('Оплата прошла успешно!')
			// Очистка корзины после успешной оплаты
			cartItems = []

			// Обновление интерфейса: скрыть корзину и показать сообщение об успешной оплате
			document.getElementById('cart').style.display = 'none'
			document.getElementById('success-message').style.display = 'block'
		}, 2000) // Здесь мы эмулируем задержку в 2 секунды для имитации обработки оплаты

		// tele.MainButton.text = "Pay :)";
		// tele.MainButton.show();
	}

	return (
		<>
			<h1 className='heading'>Order Food</h1>
			<Cart cartItems={cartItems} onCheckout={onCheckout} />
			<div className='cards__container'>
				{foods.map(food => {
					return (
						<Card food={food} key={food.id} onAdd={onAdd} onRemove={onRemove} />
					)
				})}
			</div>
		</>
	)
}

export default App
