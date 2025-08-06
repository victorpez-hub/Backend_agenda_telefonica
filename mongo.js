const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
} else {

    const password = process.argv[2]
    const id = Number(process.argv[3])
    const name = process.argv[4]
    const number = process.argv[5]

    const url =
        `mongodb+srv://victorpez007:${password}@cluster0.atv7dnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

    mongoose.set('strictQuery', false)

    mongoose.connect(url)

    //Defino el Schema MongoDB
    const personSchema = new mongoose.Schema({
        id: Number,
        name: String,
        number: String,
    })
    //Creo un objeto con ese schema
    const Persons = mongoose.model('Persons', personSchema)

    const person = new Persons({
        id,
        name,
        number
    })
    
    if (process.argv.length == 6) {
        person.save().then(result => {
            console.log('note saved!')
            mongoose.connection.close()
        })
    } else if (process.argv.length == 3) {
        Persons.find({}).then(result => {
            result.forEach(person => {
                console.log(person)
            })
            mongoose.connection.close()
        })
    }
}