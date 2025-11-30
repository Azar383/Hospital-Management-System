import { UserRole } from './types';

export const MOCK_PERMISSIONS: Record<UserRole, string[]> = {
    [UserRole.SuperAdmin]: ['*'],
    [UserRole.Admin]: [
        'DASHBOARD:READ',
        'PATIENT:READ',
        'STAFF:CREATE', 'STAFF:READ', 'STAFF:UPDATE', 'STAFF:DELETE',
        'APPOINTMENT:READ',
    ],
    [UserRole.Doctor]: [
        'DASHBOARD:READ',
        'PATIENT:READ',
        'MEDICAL_RECORD:CREATE', 'MEDICAL_RECORD:READ',
        'PRESCRIPTION:CREATE', 'PRESCRIPTION:READ',
        'APPOINTMENT:READ', 'APPOINTMENT:UPDATE',
    ],
    [UserRole.Nurse]: [
        'DASHBOARD:READ',
        'PATIENT:READ',
        'VITALS:CREATE', 'VITALS:READ',
    ],
    [UserRole.Receptionist]: [
        'DASHBOARD:READ',
        'PATIENT:CREATE', 'PATIENT:READ', 'PATIENT:UPDATE',
        'APPOINTMENT:CREATE', 'APPOINTMENT:READ', 'APPOINTMENT:UPDATE', 'APPOINTMENT:DELETE',
    ],
    [UserRole.Pharmacist]: [
        'DASHBOARD:READ',
        'PRESCRIPTION:READ', 'PRESCRIPTION:UPDATE',
    ]
}