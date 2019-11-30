import express from 'express'
import Multer from 'multer'
import fs from 'fs'
import { format } from 'util'
import { Storage } from '@google-cloud/storage'
import cors from 'cors'

const storage = new Storage({
    projectId: "upload-cd948",
    keyFilename: './keys/upload-cd948-firebase-adminsdk-nb7xp-39ecd79354.json'
});

const bucket = storage.bucket('upload-cd948.appspot.com', {
    userProject: 'upload-cd948'
});


const server = express()
server.use(cors())

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // no larger than 5mb
    }
});


server.get('/', (req, res) => {
    res.send('OK')
})


server.post('/file', multer.single('testFile'), (req, res) => {
    let file = req.file;
    if (file) {
        uploadToStorage(file).then((url) => {
            res.status(200).send({
                status: 'OK',
                url
            })
        }
        ).catch((error) => {
            res.status(500).send({
                status: 'failed',
                error
            })
        })
    }
    else {
        res.status(400).send({
            status: 'Invalid input'
        })
    }
})


server.get('/files', async (req, res) => {

    let resFiles = { images: [] }
    
    let [files] = await bucket.getFiles()

    let mappedFiles = await Promise.all(files.map(async file => {
        const [metadata] = await file.getMetadata()

        return metadata
    }))

    resFiles = {images: mappedFiles}

    res.json(resFiles)
})

const uploadToStorage = (file) => {
    console.log('Uploading...')

    return new Promise((resolve, reject) => {
        if (!file) {
            reject('No file')
        }

        let newFileName = `${file.originalname}_${Date.now()}`;
        let fileUpload = bucket.file(newFileName);
        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });
        blobStream.on('error', (error) => {
            console.log('error', error)
            reject('Something is wrong! Unable to upload at the moment.');
        });
        blobStream.on('finish', () => {
            console.log('finished')
            const url = format(`https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`);
            resolve(url);
        });

        blobStream.end(file.buffer);
    })
}

server.listen(8080, () => console.log('Listening on 8080'))