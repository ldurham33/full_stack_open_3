const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}
app.use(express.json())
app.use(requestLogger)
app.use(cors())
morgan.token('data', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
let persons = [
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
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})
app.get('/api/info', (request, response) => {
    const length = `Phonebook has ${persons.length} entries`
    const now = new Date()
    const time = now.toUTCString()
    info = [
        length,
        time]
    response.json(info)
})
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    console.log(id)
    const person = persons.find(person => {
        console.log(person.id, typeof person.id, id, typeof id, person.id === id)
        return person.id === id
    })
    console.log(person)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})
const generateId = () => {
    return Math.floor(1000*Math.random())
}

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(body)
    console.log(persons.findIndex(person => person.name === body.name))
    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    } else if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    } else if (persons.findIndex(person => person.name === body.name) > -1) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }
    persons = persons.concat(person)

    response.json(person)
})