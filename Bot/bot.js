const { Telegraf } = require('telegraf')
const TOKEN = '7287053876:AAHA67oKvVDzNxPZZbsHgL873GyrmJA_Tg0'
const bot = new Telegraf(TOKEN)

// const web_link = 'https://menybot.netlify.app/'
const web_link = 'https://www.profident05.ru/auth'

bot.start(ctx =>
	ctx.reply('Добро пожаловать)))', {
		reply_markup: {
			keyboard: [[{ text: 'web app', web_app: { url: web_link } }]],
		},
	})
)

bot.launch()
