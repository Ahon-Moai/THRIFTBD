# Security Specification for RETRORACK

## Data Invariants
1. A Product must have a valid name, price, and category.
2. An Order must be linked to a valid User ID.
3. Only Admins can create, update, or delete Products.
4. Users can only read their own Orders.
5. Users can only update their own User profile (mainly wishlist).
6. Stock cannot be negative.
7. Orders are immutable once completed (except for status changes by admin).

## The Dirty Dozen Payloads (Rejection Targets)
1. **Unauthorized Product Creation**: A non-admin user trying to create a product.
2. **Price Poisoning**: Setting a product price to a negative value or a string.
3. **ID Injection**: Trying to create a document with an extremely long or invalid ID string.
4. **Role Escalation**: A user trying to set their own role to 'admin' during profile creation.
5. **Shadow Fields**: Adding an `isVerified: true` field to a product to bypass some hypothetical frontend check.
6. **Order Spoofing**: Creating an order for another user.
7. **Negative Stock**: Updating a product to have -10 stock.
8. **PII Leak**: A user attempting to list all user profiles.
9. **Timestamp Manipulation**: Providing a client-side `createdAt` timestamp instead of using `request.time`.
10. **Empty Order**: Creating an order with an empty items array (if defined as required).
11. **Cross-User Wishlist**: User A trying to update User B's wishlist.
12. **Admin Lockdown**: Deleting the admin collection/document (if applicable).

## Test Cases (Overview)
- `products`:
  - `list/get`: allow if public.
  - `write`: deny if not admin.
- `users`:
  - `get`: allow if `auth.uid == userId`.
  - `list`: deny always.
  - `write`: allow if `auth.uid == userId` and only specific fields.
- `orders`:
  - `list/get`: allow if `auth.uid == resource.data.userId`.
  - `create`: allow if `auth.uid == request.resource.data.userId`.
