require('dotenv').config()
const person = require('./models/person')

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan('tiny'))
app.use(express.static('dist'))

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}


let persons = [];

const date = new Date();

const Person = mongoose.model('Person', person.personSchema)

morgan.token('post-data', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : '';
});
const customFormat = ':method :url :status :response-time ms - :post-data';

app.use(
    morgan(customFormat, {
        skip: (req) => req.method !== 'POST', // Log only POST requests
    })
);

app.get('/info', (request, response) => {
    response.send(`<h3>Phonebook has info for ${persons.length} people </h3> <br>
        <h3>
        ${date}
        </h3>`)
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        this.persons = persons;
        response.json(persons);
    })
})


app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body;
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'The name or number is missing'
        })
    }

    if (persons.filter(x => x.name === body.name).length > 0) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    const person = new Person({
        name: body.name,
        number: body.number,
        id: getRandomInt(10000),
    });

    person.save().then(savedPerson => {
        response.json(savedPerson)
    }).catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body
    const person = {
        name: name,
        number: number
    };

    Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        }).catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
