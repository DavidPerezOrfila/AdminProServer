const express = require('express');
const app = express();
const Medico = require('../models/medico');
const mdAutentificacion = require('../middlewares/autentificacion');


app.get('/', (req, res, next) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .skip(desde).limit(5)
        .populate('hospital')
        .populate('usuario', 'nombre email')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando médicos',
                    errors: err
                })
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });
        })
});
app.post('/', mdAutentificacion.verificaToken, (req, res) => {
    let body = req.body;
    let medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error medico no creado!',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            usuario: medicoGuardado
        })
    });
});
app.put('/:id', mdAutentificacion.verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico!',
                errors: err
            })
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con id:' + id + ' no existe!',
                errors: { message: 'no existe medico con ese ID' }
            })
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;
        medico.save((err, medicoActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error medico no actualizado!',
                    errors: err
                })
            }
            res.status(200).json({
                ok: true,
                usuario: medicoActualizado
            })
        });
    });
});
app.delete('/:id', (req, res) => {
    let id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error medico no eliminado!',
                errors: err
            })
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe medico con ese ID'
            })
        }
        res.status(200).json({
            ok: true,
            usuario: medicoBorrado
        })
    });
});

module.exports = app;