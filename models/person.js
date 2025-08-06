const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

//Esto define los campos del schema
/*
const personSchema = new mongoose.Schema({
    id: Number,
    name: String,
    number: String,
})
*/
//Esto define los campos del schema con mas restricciones
const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 5,
        required: [true, 'El nómbre es obligatorio']
    },
    number: {
        type: String,
        required: [true, 'El número es obligatorio'],
        minlength: [9, 'El número debe tener al menos 9 caracteres']
    }

})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        //El _id que es un objeto con el id del registro, lo pasamos a String. //- Muy importante para luego no tener fallos en las querys
        returnedObject.id = returnedObject._id.toString()
        //Elimino los registros generados por mongo,//- Pero solo para cuando lo transforme en JSON en la lectura
        delete returnedObject._id
        delete returnedObject.__v
    }
})


//Este caso es particular porque mongo por defecto llama persons a people
module.exports = mongoose.model('Person', personSchema, 'persons')