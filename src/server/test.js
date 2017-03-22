import path from 'path';

process.env.FLOGO_WEB_DISABLE_WS = process.env.FLOGO_WEB_DISABLE_WS || true;
process.env.FLOGO_WEB_DBDIR = process.env.FLOGO_WEB_DBDIR || path.resolve('./dist/local/test_db');

require('./tests');
