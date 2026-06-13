# Security Specification - Synthetic Intelligence Repository

## Data Invariants
- A prompt must have a valid title, category (from enum), content, and model.
- Every prompt must be associated with an `authorId` that matches the creator's UID.
- Timestamps must be valid.
- Prompts can only be edited or deleted by their author.

## The Dirty Dozen Payloads

1.  **Identity Spoofing**: Create a prompt with `authorId` set to another user's UID.
    -   `{ "title": "Hack", "authorId": "victim_uid", ... }`
2.  **Anonymous Write**: Attempt to create a prompt without being logged in.
3.  **Invalid Category**: Create a prompt with a category not in the enum (e.g., "Exploit").
    -   `{ "category": "Exploit", ... }`
4.  **Malicious Prompt Content**: Create a prompt with extremely large content (e.g., 2MB string) to cause resource exhaustion.
5.  **Ghost Field Update**: Update a prompt and try to inject an `isVerified` field.
    -   `{ "isVerified": true }`
6.  **Author Stealing**: Update a prompt's `authorId` to the current user's UID to take ownership of someone else's prompt.
7.  **Unauthorized Update**: Attempt to update a prompt owned by another user.
8.  **Unauthorized Delete**: Attempt to delete a prompt owned by another user.
9.  **Id Poisoning**: Use a 2KB string as a document ID for a prompt.
10. **State Shortcutting**: If we had a 'status' field, trying to set it to 'certified' without proper role.
11. **Client Timestamp Spoofing**: Providing a `updatedAt` value from 10 years ago instead of using server time.
12. **Blanket Read Attack**: Attempting to list all prompts without any collection-level filters (if rules were open).

## Test Runner (Draft)

```typescript
// firestore.rules.test.ts (Drafting logic)
// - Assert fail: create prompt with wrong authorId
// - Assert fail: update prompt content if not owner
// - Assert fail: delete prompt if not owner
// - Assert success: create prompt with correct authorId
```
