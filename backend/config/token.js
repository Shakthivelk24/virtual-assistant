import jwt from 'jsonwebtoken';
// Function to generate JWT token
const generateToken = async(userId) => {
    try{
        const token = await  jwt.sign(
            {id: userId}, //payload
            process.env.JWT_SECRET, //secret key
            {expiresIn: '10d'} //options
        );
        return token;
    }catch(error){
        console.log("Error generating token", error);
    }
}

export default generateToken;