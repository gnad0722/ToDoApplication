# Error Response Format

This document defines how the ToDo Management backend should return errors so that the frontend can display them correctly.
It describes the expected **format and behaviour** only; the backend implementation is up to the backend.

---

## 1. General rules

1. Every response, success or error, uses the same envelope: `success`, `data`, `message`.
2. Errors are returned with the **correct HTTP status code** (4xx / 5xx), never `200` with `success: false`.
3. `message` is shown **directly to the user**, so it must be short, human-readable and free of technical details (no class names, SQL, or stack traces).
4. Errors raised **inside Spring Security** (before a controller is reached) must use the same envelope as errors raised in controllers and services.
5. The response `Content-Type` is `application/json`.

---

## 2. Envelope

### 2.1 Success (for reference)

```json
{
  "success": true,
  "data": { },
  "message": "To Do List retrieved successfully"
}
```

### 2.2 Error

```json
{
  "success": false,
  "data": null,
  "message": "To-do list not found"
}
```

| Field     | Type             | Required | Description |
|-----------|------------------|----------|-------------|
| `success` | boolean          | yes      | Always `false` for errors. |
| `data`    | object \| null   | yes      | `null` for most errors. For validation errors, a map of field → message (see 2.3). |
| `message` | string           | yes      | User-facing description of the error. |

### 2.3 Validation error (`400`)

When request body validation fails, `data` contains one entry per invalid field, and `message` contains the **first** field error.

```json
{
  "success": false,
  "data": {
    "topic": "Topic must be at least 10 characters",
    "startTime": "Start time must be a valid date-time"
  },
  "message": "Topic must be at least 10 characters"
}
```

- Keys in `data` are the request field names exactly as sent in JSON (`topic`, `expectEnd`, `newPassword`, …).
- `message` must repeat a real field error (not a generic "Validation failed"), because the frontend currently displays only `message`.

---

## 3. Status codes and messages

| # | Situation | HTTP status | Example `message` |
|---|-----------|-------------|-------------------|
| 1 | Request body validation failed | `400 Bad Request` | `Topic must be at least 10 characters` |
| 2 | Malformed JSON / wrong data type (e.g. invalid date) | `400 Bad Request` | `Invalid request format` |
| 3 | Invalid sort field or query parameter | `400 Bad Request` | `Invalid sort field: xyz` |
| 4 | Invalid filter syntax | `400 Bad Request` | `Invalid filter: topic=abc` |
| 5 | End time before start time (task / project) | `400 Bad Request` | `End time must be after start time` |
| 6 | Wrong or expired OTP | `400 Bad Request` | `Invalid or expired verification code` |
| 7 | Invalid or expired reset-password token | `400 Bad Request` | `Reset link has expired, please request a new code` |
| 8 | Wrong email or password at login | `401 Unauthorized` | `Email or password is incorrect` |
| 9 | Missing, invalid or expired access token | `401 Unauthorized` | `Unauthorized` |
| 10 | Invalid, expired or revoked refresh token (`/api/auth/refresh`) | `401 Unauthorized` | `Session expired, please log in again` |
| 11 | Authenticated user accesses another user's resource | `403 Forbidden` | `You do not have permission to access this resource` |
| 12 | Non-admin calls an admin-only endpoint | `403 Forbidden` | `You do not have permission to access this resource` |
| 13 | To-do list / task / project not found | `404 Not Found` | `To-do list not found` / `Task not found` / `Project not found` |
| 14 | Task has no note (`GET /api/note/{taskId}`) | `404 Not Found` | `Note not found` |
| 15 | Email not registered (`/api/auth/forgot-password`) | `404 Not Found` | `No account found with this email` |
| 16 | Email already registered | `409 Conflict` | `Email is already registered` |
| 17 | Username already taken | `409 Conflict` | `Username is already taken` |
| 18 | Note already exists for the task (`POST /api/note/`) | `409 Conflict` | `This task already has a note` |
| 19 | Any unexpected server error | `500 Internal Server Error` | `Something went wrong, please try again later` |

> Row 15: returning `200` for unknown emails is also acceptable if you prefer not to reveal which emails are registered. In that case the frontend simply moves to the OTP step.

---

## 4. Errors from Spring Security

Errors in rows **9, 11 and 12** usually happen in the security filter chain, where `@RestControllerAdvice` is not invoked. Without extra configuration Spring returns its default body:

```json
{
  "timestamp": "2026-11-17T10:00:00.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "path": "/api/todo/me"
}
```

This body is **not** compatible with the frontend. The security configuration's **authentication entry point** (401) and **access-denied handler** (403) must write the envelope from section 2.2 instead.

An expired or invalid JWT must produce **401**, not 403 and not 500.

---

## 5. How the frontend uses error responses

Reference: `src/utils/errors.ts`, `src/services/http.ts`.

| Status | Frontend behaviour |
|--------|--------------------|
| `400`  | Shows `message` in a toast or under the related form field. |
| `401` on a protected endpoint | Calls `POST /api/auth/refresh` once and retries the request. If the refresh fails, the session is cleared and the user is sent to the login page. |
| `401` on `/api/auth/login` | Shows `message` in the login form (no refresh attempt). |
| `403`  | Tries one token refresh (to cover backends that send 403 for expired tokens), then shows `message`. |
| `404` on `GET /api/note/{taskId}` | Treated as "task has no note", so the UI shows **Add a note** and no error. |
| `404` elsewhere | Shows an error card with `message` and a **Try again** button. |
| `409`  | Shows `message` in a toast or in the register form. |
| `5xx`  | Shows `message` in a toast. |
| No response (backend down / network) | Shows `Cannot reach the server…`. |

Message priority used by the frontend: `message` → `error` → a default text based on the status code.

---

## 6. Checklist

- [ ] All error responses use `{ success: false, data, message }`.
- [ ] Correct HTTP status for every case in section 3.
- [ ] Validation errors: `data` = field map, `message` = first field error.
- [ ] Authentication entry point returns the envelope with **401**.
- [ ] Access-denied handler returns the envelope with **403**.
- [ ] Expired / invalid JWT → 401 (not 403, not 500).
- [ ] `GET /api/note/{taskId}` with no note → 404.
- [ ] `POST /api/note/` when a note exists → 409.
- [ ] Duplicate email / username on register → 409.
- [ ] Wrong credentials on login → 401 with a friendly message.
- [ ] Unknown exceptions → 500 with a generic message, no stack trace.
