const express = require('express');
const app = express();
const mdAutentificacion = require('../middlewares/autentificacion');
const Hospital = require('../models/hospital');


// Listar hospitales

app.get('/', (req, res, next) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
        .skip(desde).limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                })
            }
            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                })
            })
        })
});

// Crear un nuevo hospital

app.post('/', mdAutentificacion.verificaToken, (req, res) => {
    let body = req.body;
    let hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error hospital no creado!',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        })
    });
});

// Actualizar hospital

app.put('/:id', mdAutentificacion.verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital!',
                errors: err
            })
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con id:' + id + ' no existe!',
                errors: { message: 'no existe hospital con ese ID' }
            })
        }
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;
        hospital.save((err, hospitalActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error hospital no actualizado!',
                    errors: err
                })
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalActualizado
            })
        });
    });
});

// Borrar hospital

app.delete('/:id', mdAutentificacion.verificaToken, (req, res) => {
    let id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error hospital no eliminado!',
                errors: err
            })
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe hospital con ese ID'
            })
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        })
    });
});

module.exports = app;