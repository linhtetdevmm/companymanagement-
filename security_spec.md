# ClaretOS ERP — Security Specification & Dirty Dozen Audit

## 1. Data Invariants
1. **Workspace Ownership**: Every `/workspaces/{workspaceId}` document MUST have `ownerId == request.auth.uid` and verified email (`request.auth.token.email_verified == true`).
2. **Master Gate**: Every subcollection document under `/workspaces/{workspaceId}/...` MUST belong to a valid existing parent workspace whose `ownerId == request.auth.uid`, AND store `ownerId == request.auth.uid` on the record itself for cost-safe `allow list` filtering without `get()` lookups.
3. **Immutable Ownership & Creation Time**: `ownerId` and `createdAt` can NEVER be changed on update.
4. **Temporal Integrity**: `createdAt == request.time` on create; `updatedAt == request.time` on create and update.
5. **Strict Key & Size Bounds**: Every write validates `keys().hasAll(...) && keys().hasOnly(...)` on create, `affectedKeys().hasOnly(...)` on update, numeric bounds, enums, and `string.size()` limits matching `firebase-blueprint.json`.
6. **ID Poisoning Guard**: Every path variable `{workspaceId}` and `{recordId}` validates `id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')` on single-doc operations.

## 2. The "Dirty Dozen" Adversarial Payloads (All MUST return PERMISSION_DENIED)
1. **Unauthenticated Read/Write**: `request.auth == null` attempting `get` or `create` on `/workspaces/ws_123`.
2. **Unverified Email Spoof**: `request.auth.token.email == 'loveking20178@gmail.com'` with `email_verified == false`.
3. **Cross-Tenant Ownership Spoof**: User B creating `/workspaces/ws_B/employees/emp_1` with `ownerId: 'user_A'` or inside `/workspaces/ws_A/...`.
4. **Shadow Field Injection**: Creating an `Employee` with extra field `isAdmin: true` or `shadowRole: 'super'`.
5. **Timestamp Backdating**: Creating a `FinanceEntry` with a client-supplied `createdAt` instead of `request.time`.
6. **Immutable `ownerId` Mutation**: Updating an existing `Deal` to reassign `ownerId` to another UID.
7. **Immutable `createdAt` Mutation**: Updating an existing `Customer` and altering `createdAt`.
8. **ID Poisoning**: Creating `/workspaces/ws_1/deals/bad$id/../../../evil` or a 500-char document ID.
9. **Resource Exhaustion ("Denial of Wallet")**: Writing a 50KB string into `Employee.name` or `Deal.notes`.
10. **Invalid Enum Injection**: Setting `Deal.stage = 'SuperAdminHack'` or `FinanceEntry.kind = 'hack'`.
11. **Terminal State Bypass on Finalized Finance/HR**: Updating a `Settled` AR/AP or `Approved`/`Rejected` leave/claim without admin override or altering `ownerId`.
12. **Blanket List Scraping**: Executing a `collectionGroup` or unfiltered `list` query without `where('ownerId', '==', uid)`.
