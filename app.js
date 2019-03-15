// Requires
const express = require('express');
const mongoose = require('mongoose');
require('./config/config');

// Inicializar variables
const app = express();
const appRoutes = require('./routes/app');
const loginRoutes = require('./routes/login');
const usuarioRoutes = require('./routes/usuario');
const hospitalRoutes = require('./routes/hospital');
const medicoRoutes = require('./routes/medico');
const busquedaRoutes = require('./routes/busqueda.js');
const uploadRoutes = require('./routes/upload.js');
const imagenesRoutes = require('./routes/imagenes.js');

// Conexión a la base de datos
mongoose.connection.openUri(process.env.URLDB, { useNewUrlParser: true }, (err, resp) => {
        if (err) throw err;
        console.log('Base de datos puerto 27017: \x1b[32m%s\x1b[0m', 'online');
    })
    // .connect('mongodb://localhost/hospitalDB');

// Body-parser
app.use(express.json());
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))

// Rutas
app.use('/busqueda', busquedaRoutes);
app.use('/medico', medicoRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(process.env.PORT, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});