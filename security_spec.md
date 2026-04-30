# Security Specification for Campus TV Booking System

## Data Invariants
1. A reservation must belong to a user with email ending in `@lstlkkc.edu.hk`.
2. A reservation's `teacherEmail` must match the authenticated user's email.
3. The `date` must be a valid YYYY-MM-DD string.
4. The `duration` must be a number > 0 for restricted days (Tue, Wed, Fri) and <= current limits.
5. The `type` must be one of the predefined categories.

## The "Dirty Dozen" Payloads (Denial Tests)
1. **Unauthenticated Write**: Creating a reservation without being logged in.
2. **Domain Spoofing**: Creating a reservation with a non-`@lstlkkc.edu.hk` email.
3. **Identity Spoofing**: Creating a reservation with someone else's email in `teacherEmail`.
4. **Invalid Date Format**: Using an invalid string for `date`.
5. **Invalid Type**: Using a type not in the enum.
6. **Missing Custom Type**: Type is "其他" but `customType` is empty.
7. **Negative Duration**: Setting `duration` to -5.
8. **Resource Exhaustion**: Setting `duration` to a massive number (e.g., 1000).
9. **Shadow Field Injection**: Adding extra fields not in the schema.
10. **Unauthorized Deletion**: Deleting someone else's reservation.
11. **Malicious ID**: Creating a doc with an extremely long or illegal ID.
12. **Timestamp Forgery**: Providing a client-side `createdAt` that doesn't match `request.time`.

## Test Scenarios
- `PERMISSION_DENIED` for all above payloads.
- `ALLOW` for valid payload with matching auth email.
