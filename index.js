require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
//para agregar elementos estaticos como HTML,CSS o JavaScript
app.use(express.static('dist'))
app.use(cors())



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
//************************************************************************ENDPOINTS LOCALES************************************************************************

app.get('/', (request, response) => {
    response.send('<h1>Agenda telefonica</h1>')
})
/*
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
/*
app.post('/api/persons', morgan((tokens, req, res) => {
    return [
        tokens.url(req, res),
        tokens.status(req, res),
        JSON.stringify(req.body) // Muestra el body en el log
    ].join(' | ')
}),
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
*/
//************************************************************************ENDPOINTS LOCALES************************************************************************
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ENDPOINTS MongoDB++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Como debo hacer la consulta a la base de datos, debo usar async para reflejar que esta funcion es asincrona
app.get('/info', async (request, response) => {
    const now = new Date()
    try {
        //Uso await para definir que debe esperara a que resuelta la consulta .estimatedDocumentCount()
        const count = await Person.estimatedDocumentCount();
        response.send(`<p>Hay ${count} contactos en la agenda<br>Consulta realizada ${new Date()}</p>`);
    } catch {
        response.status(500).send('Error al contar los contactos');
    }
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(person => {
        response.json(person)
    })
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    if (body.name === undefined || body.number === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }
    const person = new Person({
        name: body.name,
        number: body.number
    })
    console.log('person', person)
    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})
/*
En Express, next es una función que permite:
    Ir al siguiente middleware si lo llamas sin argumentos.
    Ir directamente al middleware de manejo de errores si lo llamas con un argumento (normalmente un objeto de error).
*/
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        console.log('person', person)
        if (person) {
            response.json(person)
        } else {
            console.log('no encontrado')
            response.status(404).end()
        }
    })
        /*El manejo de error lo hago en el propio endpoint
            .catch(error => {
                console.log(error)
                response.status(400).send({ error: 'malformatted id' })
            })
                */
        //Recomendable para centralizar los manejos de errores si luego por ejemplo lo queremos monitorizar con sentry
        //Ahora, Express busca un error handler, es decir, un middleware que acepte 4 argumentos (error, request, response, next).
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    console.log('body', request.body)
    /*
    const body = request.body
    const person = {
        name: body.name,
        number: body.number
    }*/
    const { name, number } = request.body

    //new: true: Devuelve el documento actualizado (por defecto devuelve el original antes de la actualización)
    //runValidators: true — Hace que se apliquen las validaciones definidas en el esquema durante la actualización.
    //context: 'query' — Útil para ciertas validaciones que dependen del contexto de la consulta.
    Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    console.log('delete', request.params.id)
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ENDPOINTS MongoDB++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
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
const errorHandler = (error, request, response, next) => {
    console.error("Error: ", error.message)

    if (error.name === 'CastError') {
        console.log('CastError')
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        console.log('ValidationError')
        return response.status(400).json({ error: 'No es un número válido: Debe ser de la forma 12-34567'})
    }
    next(error)
}

// este debe ser el último middleware cargado, ¡también todas las rutas deben ser registrada antes que esto!
app.use(errorHandler)
//Ahora estamos utilizando el puerto definido en la variable de entorno PORT o el puerto 3001 si la variable de entorno PORT no está definida. Fly.io y Render configuran el puerto de la aplicación en función de esa variable de entorno
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})