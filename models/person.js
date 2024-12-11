const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

mongoose.connect(url)

    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        minLength: 8,
        required: true,
        validate: {
            validator: function (v) {
                return /^(\d{2,3})-(\d+)$/.test(v)
            },
            message: props => `${props.value} is not a valid phone number! It should be in the format XX-YYYYYYY or XXX-YYYYYYY.`
        },
    },
    id: Number
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})


module.exports = mongoose.model('Person', personSchema)