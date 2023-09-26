const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Configuração do Multer para salvar os arquivos no diretório 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // O diretório onde os arquivos serão salvos
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Nome do arquivo no formato: timestamp.extensao
  },
});

const upload = multer({ storage });

// Rota para exibir um formulário HTML para fazer o upload de um arquivo
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Rota para lidar com o envio do arquivo
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nenhum arquivo foi enviado.');
  }

  res.send('Arquivo enviado com sucesso.');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
