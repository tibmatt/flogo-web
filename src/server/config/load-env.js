import findUp from 'find-up';
import dotenv from 'dotenv';

const pathToEnvFile = findUp.sync('.env');
if (pathToEnvFile) {
  dotenv.config({ path: pathToEnvFile });
}
