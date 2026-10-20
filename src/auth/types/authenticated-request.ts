import type { Request } from 'express';
import { UserPayload } from './UserPayload.js';

export interface AuthenticatedRequest extends Request {
    user: UserPayload;
}