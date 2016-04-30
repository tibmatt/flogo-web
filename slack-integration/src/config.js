require('dotenv').config();

process.env.FLOGO_PROTOCOL = process.env.FLOGO_PROTOCOL || 'http';
process.env.FLOGO_HOSTNAME = process.env.FLOGO_HOSTNAME || 'localhost';
process.env.FLOGO_PORT = process.env.FLOGO_PORT || 3010;
process.env.FLOGO_API_PATH = process.env.FLOGO_API_PATH || '/v1/api';
