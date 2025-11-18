# PIFAT Setup Guide

## Initial Admin User Creation

To get started with PIFAT, you need to create an initial admin user. You can do this by calling the `create_admin_user` edge function:

### Using cURL

```bash
curl -X POST https://your-supabase-project-url/functions/v1/create_admin_user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@forensics.local",
    "password": "your-secure-password",
    "name": "Administrator"
  }'
```

### Using the provided setup script

Create a file called `setup-admin.js`:

```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

async function setupAdmin() {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/create_admin_user`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@forensics.local',
        password: 'your-secure-password',
        name: 'Administrator',
      }),
    }
  );

  const data = await response.json();
  console.log(data);
}

setupAdmin();
```

## Access Levels

### Admin Role
- Create and manage users
- Full access to all cases and evidence
- View audit logs
- Configure system settings
- Access to all forensic analysis tools

### Field Officer Role
- Upload evidence from the field
- View assigned cases
- Limited to their own evidence uploads
- No user management capabilities

### Analyst Role
- Review evidence and cases
- Run AI analysis
- Generate reports
- No case creation or user management

### Reviewer Role
- Read-only access to cases and evidence
- View analysis results
- Generate compliance reports
- Cannot modify any data

## Security Considerations

1. **Admin-Only Login**: Only users with the admin role can log in to the system
2. **Hash Chaining**: All evidence and logs use SHA-256 hash chaining for tamper-proofing
3. **Row Level Security**: All database tables have RLS policies enabled
4. **Chain of Custody**: Every action on evidence creates an immutable CoC entry

## Features by Role

### Admin Dashboard
- Dashboard with system statistics
- Case management
- Evidence upload
- User management (create, view, delete)
- Audit logs
- System settings

### User Dashboard
- Dashboard with assigned cases
- Case viewing
- Evidence upload for assigned cases
- Evidence viewing

## First Time Setup

1. Create the initial admin user using the edge function
2. Log in with admin credentials
3. Create additional users as needed
4. Assign cases to field officers and analysts
5. Configure evidence capture settings

## API Endpoints

### Create Admin User
- **Endpoint**: `/functions/v1/create_admin_user`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "admin@forensics.local",
    "password": "secure-password",
    "name": "Admin Name"
  }
  ```

## Troubleshooting

### Unable to Log In
- Ensure you created the admin user successfully
- Check that the email matches exactly
- Verify the password is correct
- Only admins can log in to the system

### Permission Denied Errors
- Verify your user role has access to the resource
- Check Row Level Security policies in the database
- Ensure you're authenticated before attempting actions

### Evidence Upload Issues
- Verify the case ID exists and you have access
- Ensure the device category is selected
- Check file permissions and size limits
- Verify SHA-256 hash calculation is working
