# Custom Table Component

A fully-featured dynamic table component for displaying and managing custom records with approval workflows, file uploads, and role-based access control.

## Features

- **Dynamic Columns**: Displays columns based on model keys from the backend table metadata
- **Add/Create Records**: Modal form to add new records with dynamic fields
- **File & Image Uploads**: Automatic detection of file/image fields with upload handling
- **Employees Dropdown**: Conditionally show employee assignment (if `onlyShowToUsers` is true)
- **Participants & Voting**: Support for approval workflows (if `requireApproval` is true)
  - Participants array with vote and comment fields
  - Pending votes tab showing votes awaiting current user
- **Delete Permission**: Only record creators can delete their records
- **Tabs Interface**: 
  - "All" tab: Shows all records with employee/participant info
  - "Pending" tab: Shows records pending current user's vote (if approval required)
- **Change Detection**: Uses OnPush strategy with proper ChangeDetectorRef for optimal performance
- **Translations**: Full i18n support with English and Arabic

## Route Setup

The component is mapped to `/custom-table/:tableId` in `app.routes.ts`:

```typescript
{ path: 'custom-table/:tableId', canActivate: [AuthGuard], 
  loadComponent: () => import('./components/custom-table/custom-table').then(m => m.CustomTableComponent) }
```

## API Endpoints Used

### 1. Get Table Metadata
```
GET /api/v1/custom-tables/{tableId}
Response: { data: ICustomTables }
```

### 2. Get Records
```
GET /api/v1/custom-tables/{tableId}/records?[limit]=100000
Response: { data: Array<Record> }
```

### 3. Create Record
```
POST /api/v1/custom-tables/{tableId}/rows
Payload: {
  tenant: "string",
  data: { title: "test", ... },
  employees: [Employee, ...],
  participants: [{ id: "string", vote: null, comment: null }, ...]
}
Response: { id, ... }
```

### 4. Delete Record
```
DELETE /api/v1/custom-tables/{tableId}/records/{recordId}
```

### 5. Vote on Record
```
POST /api/v1/custom-tables/{tableId}/records/{recordId}/vote
Payload: { vote: "approve" | "reject", comment: "..." }
```

### 6. Upload File
```
POST /api/v1/upload
Form Data: { file: File }
Response: { url: "https://..." }
```

## Data Structure

### Table Metadata (ICustomTables)
```typescript
{
  id: string
  title: string
  description: string
  model: string[]  // Column keys
  requireApproval: boolean
  onlyShowToUsers: boolean
  createdAt: string
  updatedAt: string
}
```

### Record Structure
```typescript
{
  id: string
  tenant: string
  data: { [key: string]: any }  // Dynamic fields
  employees: Employee[]  // Only if onlyShowToUsers=true
  participants: [
    { id: string, vote: "approve"|"reject"|null, comment: string }
  ]  // Only if requireApproval=true
  createdBy: string  // Current employee ID
}
```

## Usage Examples

### Navigate to Custom Table
```typescript
// In your component
constructor(private router: Router) {}

viewTable(tableId: string) {
  this.router.navigate(['/custom-table', tableId]);
}
```

### Check if Field is File/Image
The component automatically detects file fields by checking if the field name includes "file" or "image" (case-insensitive).

```typescript
// If model has: ["title", "document_file", "profile_image"]
// The component will render:
// - title: text input
// - document_file: file upload
// - profile_image: file upload
```

### Participants & Voting
1. Create a record with participants: select employees in the modal
2. Go to "Pending" tab to see records awaiting your vote
3. Select vote (Approve/Reject) and add optional comment
4. Click Submit

## Customization

### Add New Translation Keys
Edit `public/i18n/en.json` and `public/i18n/ar.json`:
```json
{
  "common": {
    "customKey": "Custom Label"
  }
}
```

Then use in template: `{{ 'common.customKey' | translate }}`

### Modify Styles
Edit `custom-table.scss` to customize:
- Colors
- Spacing
- Responsive breakpoints
- Modal styling

### Extend Functionality
Extend the component in your own service:

```typescript
// In your service or component
this.customTablesService.getRecords(tableId).subscribe(records => {
  // Custom processing
});
```

## Security & Permissions

- **Authentication**: All API calls are guarded by AuthGuard
- **Authorization**: Delete only works if user is record creator
- **Token Management**: Auth service handles JWT tokens automatically

## Performance Optimizations

- **ChangeDetectionStrategy.OnPush**: Manual change detection for better performance
- **trackBy Function**: Table rows tracked by ID for efficient re-rendering
- **Lazy Loading**: Component lazy-loads with the route

## Translation Keys Required

The component uses these translation keys (all pre-configured):

```json
{
  "common": {
    "loading", "add", "cancel", "save", "saving", "delete",
    "all", "pending", "employees", "participants",
    "actions", "vote", "submit", "select", "addRecord",
    "noRecords", "file", "uploading", "fileUploaded"
  }
}
```

## Known Limitations

1. File uploads require an `/api/v1/upload` endpoint returning `{ url: string }`
2. Participants must be employees (uses employee ID/name)
3. Single vote per user per record (no update votes)
4. No bulk operations (delete, vote) in current version

## Future Enhancements

- [ ] Edit existing records
- [ ] Bulk delete/vote operations
- [ ] Export to CSV/Excel
- [ ] Advanced filtering
- [ ] Search functionality
- [ ] Pagination
- [ ] Sorting by columns
