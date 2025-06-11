const express = require('express')
const app = express()

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

app.get('/', (request, response) => {
    response.send('<h1>Agenda telefonica</h1>')
})

app.get('/agenda', (request, response) => {
    response.json(agenda)
})

app.get('/info', (request, response) => {
    const now = new Date()
    let text = `<p>Hay ${agenda.length} contactos en la agenda</br>Consulta realizada ${now}</p>`
    response.send(text)
})

app.get('/agenda/:id', (request, response) => {
    const id = Number(request.params.id)
    const contacto = agenda.find(contacto => contacto.id === id)
    if (contacto) {
        response.json(contacto)
    } else {
        response.status(404).end()
    }
})

app.delete('/agenda/:id', (request, response) => {
    const id = Number(request.params.id)
    //A la agenda la añadiremos los valores de la agenda menos el que queremos elimninar
    agenda = agenda.filter(contacto => contacto.id !== id)
    response.status(204).end()
})


app.use(express.json())
app.post('/agenda/contacto', (request, response) => {
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

/*
if (!body.content) {
  return response.status(400).json({ 
    error: 'content missing' 
  })
}
*/
const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})