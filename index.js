require('dotenv').config()
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
const Person = require('./person')
app.use(express.json())
app.use(requestLogger)
app.use(cors())
app.use(express.static('build'))
morgan.token('data', function (req) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.get('/', (request, response) => {
    return response.send('<h1>Hello World!</h1>')
})
/*if (process.argv.length > 3) {
    const person = new Person({
        name: process.argv[2],
        number: process.argv[3]
    })
    person.save().then(result => {
        console.log('person saved!')
        mongoose.connection.close()
    })
}*/
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        return response.json(persons)
    })
})
app.get('/api/info', (request, response) => {
    Person.find({}).then(persons => {
        const length = `Phonebook has ${persons.length} entries`
        const now = new Date()
        const time = now.toUTCString()
        const info = [
            length,
            time]
        return response.json(info)
    })
})
app.get('/api/persons/:id', (request, response,next) => {
    Person.findById(request.params.id).then(person => {
        return response.json(person)
    }).catch(error => next(error))
    return
})
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
app.put('/api/persons/:id', (request, response,next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            return response.json(updatedPerson)
        })
        .catch(error => next(error))
    return
})
app.delete('/api/persons/:id', (request, response,next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(()=>{
            console.log('delete')
            return response.status(204).end()
        })
        .catch(error => next(error))
    return
})
app.post('/api/persons', (request, response,next) => {
    console.log('post called')
    const body = request.body
    console.log(body)
    //console.log(persons.findIndex(person => person.name === body.name))
    /*if (!body.name) {
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
    }*/

    const person = new Person ({
        name: body.name,
        number: body.number
    })
    console.log(person)
    person.save().then(() => {
        console.log('added', person.name, 'number', person.number, 'to phonebook')
    }).catch(error => next(error))
    return response.json(person)
})
const unknownEndpoint = (request, response) => {
    console.log('unknown')
    return response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)
const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        console.log('cast')
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)