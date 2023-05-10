const http = require('http')
const PORT = process.env.PORT || 3000

let i = 1

const sendUserData = (req, res) => {
    // статус ответа - 200 ок
    // соединение должно оставаться открытым
    // тип содержимого - поток событий
    // не кэшировать
    res.writeHead(200, {
        Connection: 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache'
    })

    // данные будут отправляться каждые 2 секунды
    const timer = setInterval(async () => {
        // если отправлено 10 пользователей
        if (i > 5) {
            // останавливаем таймер
            clearInterval(timer)
            // сообщаем о том, что было отправлено 10 пользователей
            console.log('5 сообщений отправлены.')
            // отправляем клиенту идентификатор со значением -1
            // для того, чтобы клиент закрыл соединение
            res.write('id: -1\ndata:\n\n')
            // закрываем соединение
            i = 1
            res.end()
            return
        }

        // записываем данные в ответ
        // event - название события
        // id - идентификатор события; используется при повторном подключении
        // retry - время повторного подключения
        // data - данные
        res.write(`event: count\nretry: 5000\ndata: ${JSON.stringify({ count: i })}\n\n`)

        // сообщаем о том, что данные отправлены
        console.log('Данные были отправлены')

        // увеличиваем значение счетчика
        i++
    }, 1000)

    // обрабатываем закрытие соединения клиентом
    req.on('close', () => {
        clearInterval(timer)
        i = 1
        res.end()
        console.log('Соединение закрыто')
    })
}

http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    sendUserData(req, res)

}).listen(PORT, () => console.log('Сервер запущен.'))