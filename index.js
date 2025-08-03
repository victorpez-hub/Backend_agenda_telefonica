const express = require('express')
const morgan = require('morgan')
const app = express()

const cors = require('cors')
app.use(cors())


let agenda = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

//Un middleware en Express es una función que se ejecuta durante el ciclo de vida de una petición HTTP antes de que la petición llegue a la ruta final o después de salir de ella. //* Sirve para procesar datos, modificar la petición o respuesta, registrar información, manejar errores, etc.

//Imprime por pantalla informacion de la peticion, en formato tiny, hay mas, segun a conveniencia
////app.use(morgan('dev'))
//Si en base al morgan por defecto, quiero personalizarlo un poco, lo que puedo hacer es lo siguiente
/*
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    JSON.stringify(req.body)
  ].join(' ')
}))
*/

// Permite leer JSON en el body
app.use(express.json())

//Lo mismo que morgan pero personalizado, combinado con app.use(requestLogger)
/*
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---------------')
  next()
}
app.use(requestLogger)
*/
//************************************************************************ENDPOINTS************************************************************************

app.get('/', (request, response) => {
    response.send('<h1>Agenda telefonica</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(agenda)
})

app.get('/info', (request, response) => {
    const now = new Date()
    let text = `<p>Hay ${agenda.length} contactos en la agenda</br>Consulta realizada ${now}</p>`
    response.send(text)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const contacto = agenda.find(contacto => contacto.id === id)
    if (contacto) {
        response.json(contacto)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    //A la agenda la añadiremos los valores de la agenda menos el que queremos elimninar
    agenda = agenda.filter(contacto => contacto.id !== id)
    response.status(204).end()
})

/*
El middelware Morgan sirve para imprimir por consola informacion sobre la peticion, por el simple hecho de tenerlo ya nos lo imprime, puede usarse para todas las llamadas por defecto usando:
    app.use(morgan('dev'))
Declarandolo antes de todos los enpoints para que se aplique a todos, en este caso el formato es un preconfigurado. O como en el caso de abajo que lo usamos solo para la llamada POST. 
En este caso junto al controlador del evento POST (app.post) definimos
    *La ruta
    *Morgan personalizado con tokens y JSON.stringify(JSON > Sting). .join(' | ') añade una barra a cada elemento imprimido del return
    *Los 2 argumentos req y res para poder hacer la logica de la llamada


*/
app.post('/api/persons', morgan((tokens, req, res) => {
    return [
        tokens.url(req, res),
        tokens.status(req, res),
        JSON.stringify(req.body) // Muestra el body en el log
    ].join(' | ')}),
    (request, response) => {
        const maxId = agenda.length > 0
            ? Math.max(...agenda.map(n => n.id))
            : 0
        if (request.body.name == null || request.body.number == null) {
            return response.status(400).json({
                error: 'content missing'
            })
        } else {
            const exist = agenda.some(contacto => contacto.name === request.body.name)
            if (exist) {
                return response.status(400).json({
                    error: 'name already exist'
                })
            } else {
                const contacto = request.body
                contacto.id = maxId + 1

                agenda = agenda.concat(contacto)

                response.json(agenda)
            }

        }
    })

const unknownEndpoint = (request, response) => {
    response.status(404).json({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)
/*
const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
*/

//Ahora estamos utilizando el puerto definido en la variable de entorno PORT o el puerto 3001 si la variable de entorno PORT no está definida. Fly.io y Render configuran el puerto de la aplicación en función de esa variable de entorno
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})