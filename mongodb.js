const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}
const username = encodeURIComponent(process.argv[2])
const password = encodeURIComponent(process.argv[3])

const url =
    `mongodb+srv://${username}:${password}@cluster0.ypco2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
    id: Number
})

const Person = mongoose.model('Person', personSchema)

if (process.argv[4] && process.argv[5]) {
    const person = new Person({
        name: process.argv[4],
        number: process.argv[5],
        id: getRandomInt(1000)
    })
    console.log('Save')
    person.save().then(() => {
        //console.log('persons saved!')
    })
}


console.log('phonebook:')
Person.find({}).then(result => {
    result.forEach(note => {
        console.log(`${note.name}  ${note.number}`)
    })
    mongoose.connection.close()
})

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}