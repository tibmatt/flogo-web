import { apps as appsDb } from '../../common/db';
import { HandlersService } from './handlers-service';

// Acting as a bridge between old static implementation and new injectable implementation
// TODO: remove
export const HandlersManager = new HandlersService(appsDb);
