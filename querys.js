// const { ingresar, consulta, consultaRut, actualizar, eliminar } = require('./querys') cambiar
const { Pool } = require('pg')
const Cursor = require('pg-cursor')

const argumentos = process.argv

const funcion = argumentos[2]
const registroTransaccion = argumentos[3]
const cuenta = argumentos[4]
const fecha = argumentos[5]
const descripcion = argumentos[6]
const monto = argumentos[7]

const config = {
    user: 'postgres',
    password: 'espinoza',
    host: 'localhost',
    database: 'banco_db',
    port: 5432,
}
const pool = new Pool(config)

pool.connect(async (err, cliente, release) => {
    if (err) {
        return console.error(err.code)
    }
    if (registroTransaccion === 'nueva_transaccion') {
        await nuevaTransaccion(cliente)
    }
    if (registroTransaccion === 'transacciones') {
        await transacciones(cliente)
    }
    if (registroTransaccion === '10_registros') {
            await consultarRegistros(cliente)
    }
    release()
    pool.end()
})

// 1. Crear una función asíncrona que registre una nueva transacción utilizando valores
// ingresados como argumentos en la línea de comando. Mostrar por consola la última transacción realizada.
const nuevaTransaccion = async (cliente) => {
    const operacion = {
        text: 'UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2',
        values: [monto, cuenta]
    }
    const registrar = {
        text: 'INSERT INTO transacciones (descripcion, fecha, monto, cuenta) VALUES ($1, $2, $3, $4) RETURNING *',
        values: [descripcion, fecha, monto, cuenta]
    }
    try {
        await cliente.query('BEGIN')
        await cliente.query(operacion)
        console.log('Operación realizada con éxito')
        const results = await cliente.query(registrar)
        await cliente.query('COMMIT')
        console.log('Operación registrada con éxito')
    } catch (error) {
        await cliente.query('ROLLBACK')
        console.error(error)
    }
}

// Realizar una función asíncrona que consulte la tabla de transacciones y retorne
// máximo 10 registros de una cuenta en específico.Debes usar cursores para esto.
const transacciones = async (cliente) => {
    const cursor = await cliente.query(new Cursor(`SELECT * FROM transacciones WHERE cuenta = ${cuenta}`))
    cursor.read(10, (err) => {
        if (err) {
            return console.error(err)
        } else {
            console.log(`${cuenta}`)
        }
    })
}