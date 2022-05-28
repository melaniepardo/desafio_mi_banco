const { Pool } = require('pg')
const Cursor = require('pg-cursor')

const config = {
    user: 'postgres',
    password: 'espinoza',
    host: 'localhost',
    database: 'banco_db'
}
const pool = new Pool(config)

const argumentos = process.argv

const funcion = argumentos[2]
const registroTransaccion = argumentos[3]
const cuenta = argumentos[4]
const fecha = argumentos[5]
const descripcion = argumentos[6]
const monto = argumentos[7]


// Crear una función asíncrona que registre una nueva transacción utilizando valores
// ingresados como argumentos en la línea de comando.Debe mostrar por consola la
// última transacción realizada.
pool.connect(async (err, cliente, release) => {
    if (err) {
        return console.error(err.code)
    }
    if (registroTransaccion === 'transaccion') {
        await transaccion(cliente)
    }
    if (registroTransaccion === 'transacciones') {
        await transacciones(cliente)
    }
    release()
    pool.end()
})
const transaccion = async (cliente) => {
    const transaccion = {
        text: 'UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2',
        values: [monto, cuenta]
    }
    const registrar = {
        text: 'INSERT INTO transacciones (descripcion, fecha, monto, cuenta) VALUES ($1, $2, $3, $4) RETURNING *',
        values: [descripcion, fecha, monto, cuenta]
    }
    try {
        await cliente.query('BEGIN')
        await cliente.query(transaccion)
        console.log('Operación registrada con éxito')
        const results = await cliente.query(registrar)
        await cliente.query('COMMIT')
        console.log('Operación realizada con éxito')
    } catch (error) {
        await cliente.query('ROLLBACK')
        console.error(error)
    }
}

// Realizar una función asíncrona que consulte el saldo de una cuenta y que sea
// ejecutada con valores ingresados como argumentos en la línea de comando. Debes
// usar cursores para esto.

pool.connect((error_conexion, client, release) => {
    const consulta = new Cursor("select * from cuentas");
    const cursor = client.query(consulta);
    cursor.read(20, (err, rows) => {
        console.log(rows);
        cursor.close();
        // release();
        // pool.end();
    });
});
