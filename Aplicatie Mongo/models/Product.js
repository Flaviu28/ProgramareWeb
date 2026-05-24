const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Numele produsului este obligatoriu'], 
        trim: true 
    },
    price: { 
        type: Number, 
        required: [true, 'Pretul este obligatoriu'], 
        min: [1, 'Pretul trebuie sa fie de cel putin 1 RON'] 
    },
    inStock: { 
        type: Boolean, 
        default: true 
    },
    category: { 
        type: String, 
        enum: ['Electronice', 'Haine', 'Carti', 'Altele'], 
        default: 'Altele' 
    },
    releaseDate: { 
        type: Date, 
        default: Date.now 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Product', productSchema);