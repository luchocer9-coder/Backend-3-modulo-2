import dotenv from 'dotenv';

dotenv.config();

const requiredVars = ['PORT', 'MONGODB_URI', 'NODE_ENV'];


const missingVars = requiredVars.filter((variable) => !process.env[variable]);


if (missingVars.length > 0) {
  throw new Error(`Faltan variables de entorno: ${missingVars.join(', ')}`);
}
export const config = Object.freeze({
  port: Number(process.env.PORT),
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV,
});