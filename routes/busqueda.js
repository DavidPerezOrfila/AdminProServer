const express = require('express');
const app = express();
const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');


// Búsqueda Global
app.get('/todo/:busqueda', (req, res, next) => {

    let busqueda = req.params.busqueda;
    // Convertimos lo que recibimos por el request en una
    // expresión regular para realizar correctamente la búsqueda
    let regEx = new RegExp(busqueda, 'i') // 'i' Busca cualquier coincidencia

    Promise.all([
            buscarHospitales(busqueda, regEx),
            buscarMedicos(busqueda, regEx),
            buscarUsuarios(busqueda, regEx)
        ])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});

function buscarHospitales(busqueda, regEx) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regEx })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar Hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });

}

function buscarMedicos(busqueda, regEx) {

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regEx })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar Médicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regEx) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regEx }, { 'email': regEx }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}


// Búsqueda específica por colección
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    let busqueda = req.params.busqueda;
    let regEx = new RegExp(busqueda, 'i') // 'i' Busca cualquier coincidencia
    let tabla = req.params.tabla;
    let promesa;
    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regEx);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regEx);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regEx);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda son solo médicos, usuarios y hospitales',
                error: { messaje: 'Tipo de tabla/colección no válido' }
            });
    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data //Muestra el resultado de esa tabla
        });

    })
});

module.exports = app;