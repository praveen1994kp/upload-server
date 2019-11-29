import express from 'express'
import multer from 'multer'
import fs from 'fs'
import cors from 'cors'

const uploadPath = './uploads'


const server = express()
server.use(cors())

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, uploadPath)
    },
    filename: function (req, file, callback) {
        console.log(file)
        callback(null, file.originalname)
    }
})

const upload = multer({ storage: storage });


server.get('/', (req, res) => {
    res.send('OK')
})

server.get('/files', async (req, res) => {
    let files = []
    fs.readdirSync(uploadPath).forEach(file => {
        console.log(file);
        files.push(file)
      });

      res.json(files)
})

server.post('/file', upload.single('testFile'), (req, res) => {
    const file = req.file
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }

    res.send(file)
})

server.listen(8080, () => console.log('Listening on 8080'))