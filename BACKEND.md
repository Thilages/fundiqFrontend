# Backend Configuration

This frontend application requires a Flask backend to be running for authentication and API calls.

## Backend Setup

The backend should be running on: `http://127.0.0.1:5005`

### Environment Variables

You can override the backend URL using environment variables:

- `NEXT_PUBLIC_API_BASE_URL` - Client-side API base URL
- `API_BASE_URL` - Server-side API base URL

### Common Issues

1. **"Sessions API did not return JSON response"** - This means the Flask backend is not running or not accessible
2. **Network connection errors** - Check if the backend is running on the correct port
3. **CORS issues** - Make sure the backend allows requests from the frontend domain

### Development

To start the backend:
```bash
# Navigate to your Flask backend directory
cd /path/to/flask/backend
python app.py
```

The backend should be accessible at `http://127.0.0.1:5005/auth/validate`
