import bcrypt from 'bcrypt'

const saltRounds = 10
const password = 's0/\/\P4$$w0rD'
const wrongPassword = 'not_bacon'

console.log("password:", password);

(async () => {
    const hash = await bcrypt.hash(password, saltRounds)   // to db
    const hash1 = bcrypt.hashSync(password, saltRounds)   // to db
    
    console.log("hash:", hash)
    console.log("hash:", hash1)
    
    // Load hash from your password DB.
    const compare0 = await bcrypt.compare(password, hash)
    const compare1 = await bcrypt.compare(password, hash)

    console.log("compare0:", compare0);
    console.log("compare1:", compare1);
    
    const compare2 = await bcrypt.compare(wrongPassword, hash)
    
    console.log("compare2:", compare2);
 

})()




