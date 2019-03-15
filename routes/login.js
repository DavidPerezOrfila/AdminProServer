const express = require('express');
const bcrypt = require('bcryptjs');
const app = express();
const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');
let SEED = require('../config/config').SEED;
app.post('/', (req, res) => {

    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios!',
                errors: err
            })
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas!',
                errors: err
            })

        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas!',
                errors: err
            })

        }

        // Crear un token
        usuarioDB.password = ':)';
        let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // Expira en 4h.

        res.status(200).json({
            ok: true,
            mensaje: 'Login post correcto',
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        })
    })

})


module.exports = app;