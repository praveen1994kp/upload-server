import express from 'express'

const server = express()


server.get('/', (req, res) => {
    res.send('OK')
})

server.listen(8080, () => console.log('Listening on 8080'))