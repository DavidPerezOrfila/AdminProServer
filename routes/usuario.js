const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');
const mdAutentificacion = require('../middlewares/autentificacion');
// Rutas

// Mostrar listado de usuarios
app.get('/', (req, res, next) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    // Muestra únicamente los campos incluidos dentro del find
    Usuario.find({}, 'nombre email img role')
        .skip(desde).limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    })
                }
                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });
                });
            })
});

// Introducir usuario mdAutentificacion.verificaToken,
app.post('/', mdAutentificacion.verificaToken, (req, res) => {
    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        img: body.img,
        role: body.role,
        password: bcrypt.hashSync(body.password, 10)
    });
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error usuario no creado!',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        })
    });
});

// Actualizar usuario
app.put('/:id', mdAutentificacion.verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario!',
                errors: err
            })
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con id:' + id + ' no existe!',
                errors: { message: 'no existe usuario con ese ID' }
            })
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
        usuario.save((err, usuarioActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error usuario no actualizado!',
                    errors: err
                })
            }
            usuarioActualizado.password = ':)';
            res.status(200).json({
                ok: true,
                usuario: usuarioActualizado
            })
        });
    });
});

// Eliminar usuario por id
app.delete('/:id', mdAutentificacion.verificaToken, (req, res) => {
    let id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error usuario no eliminado!',
                errors: err
            })
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe usuario con ese ID'
            })
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        })
    });
});


module.exports = app;