import tape from 'tape';
import { appsTests } from './apps';

appsTests();

tape.onFinish(() => process.exit(0));
