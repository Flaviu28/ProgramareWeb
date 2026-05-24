const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

async function seedDB() {
    try {
        const stringConectareMortal = 'mongodb+srv://flaviu:flaviupemongo28@programareweb.5usdkds.mongodb.net/?appName=ProgramareWeb';
        console.log("Se incearca conectarea directa la MongoDB Atlas");
        await mongoose.connect(stringConectareMortal);
        console.log("Conexiune DB initiata cu succes pentru seeding");
        await User.deleteMany({});
        await Product.deleteMany({});
        console.log("Datele vechi au fost sterse din colectii");
        const admin = await User.create({ 
            username: 'admin', 
            email: 'admin@test.com', 
            password: 'password123', 
            role: 'admin' 
        });
        const simpleUser = await User.create({ 
            username: 'mihai_popescu', 
            email: 'mihai@test.com', 
            password: 'password123', 
            role: 'user' 
        });
        console.log("Utilizatorii de test (admin si user) au fost creati.");
        await Product.create([
            { name: 'Casti Wireless', price: 299, category: 'Electronice', createdBy: simpleUser._id },
            { name: 'Tastatura Mecanica', price: 450, category: 'Electronice', createdBy: admin._id },
            { name: 'Hanorac Oversized', price: 180, category: 'Haine', createdBy: simpleUser._id },
            { name: 'Tratat de Istorie', price: 90, category: 'Carti', createdBy: admin._id },
            { name: 'Mouse Gaming', price: 220, category: 'Electronice', createdBy: simpleUser._id }
        ]);
        console.log("Baza de date a fost populata cu succes cu cele 5 entitati principale");
    } catch (err) {
        console.error("Eroare critica in timpul rularii scriptului de seed:", err);
    } finally {
        await mongoose.connection.close();
        console.log("Conexiunea cu MongoDB a fost inchisa securizat");
    }
}
seedDB();