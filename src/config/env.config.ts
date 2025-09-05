import * as joi from 'joi';
import 'dotenv/config';

interface EnvVars {
    PORT_API                : number;
    DATABASE_URL            : string;
    NODE_ENV?               : 'development' | 'production' | 'test'; 
}

const envsSchema = joi.object({
    // Configurar las variables de entorno dentro del sistema
    PORT_API                : joi.number().required(),
    DATABASE_URL            : joi.string().uri().required(),
    NODE_ENV                : joi.string().valid('development', 'production', 'test').default('development') 
})
.unknown(true)

// Cargar los errores del esquema de validación
const {error , value} = envsSchema.validate(process.env) 

// Asignar las variables de entorno validadas al objeto global process.env
if ( error ) {
    throw new Error(`Error en las variables de entorno: ${error.message}`);
}

// En caso de que la validación sea exitosa, asignar las variables al objeto global
export const envs : EnvVars = {
    PORT_API                : value.PORT_API,
    DATABASE_URL            : value.DATABASE_URL,
    NODE_ENV                : value.NODE_ENV as 'development' | 'production' | 'test'
}