# SchoolOps Authentication Setup

## Frontend Authentication

### Pages Created:
- `/login` - User login page
- `/signup` - User registration page

### API Integration:
- **Login Endpoint**: `POST http://localhost:8080/api/auth/login`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt-token-here"
  }
  ```

- **Signup Endpoint**: `POST http://localhost:8080/api/public/signup`
- **Request Body** (Updated to match backend API):
  ```json
  {
    "email": "string (used as username, required)",
    "password": "string (required)",
    "name": "string (required)",
    "role": "string (STUDENT/TEACHER/ADMIN, required)",
    "dob": "string (YYYY-MM-DD format, optional)"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully"
  }
  ```

### Authentication Flow:
1. User submits login form
2. Frontend sends POST request to `/api/auth/login`
3. On success, JWT token is stored in localStorage
4. User is redirected to home page
5. Navbar shows logout button when authenticated

### Signup Flow:
1. User fills registration form with required fields
2. Frontend validates form data
3. Frontend sends POST request to `/api/auth/signup`
4. On success, user is redirected to login page
5. User can then login with their credentials

### Auth Utility (`src/utils/auth.js`):
- `auth.getToken()` - Get stored token
- `auth.setToken(token)` - Store token
- `auth.removeToken()` - Remove token
- `auth.isAuthenticated()` - Check if user is logged in
- `auth.getAuthHeaders()` - Get headers for API requests
- `auth.logout()` - Logout and redirect to login

### Backend Implementation:

The signup endpoint is already implemented in `PublicApiController.java`:

```java
@PostMapping("/signup")
public ResponseEntity<?> signup(@RequestBody Map<String, String> payload) {
    try {
        User user = new User();
        user.setUsername(payload.get("email"));  // Email used as username
        user.setPassword(payload.get("password"));
        user.setName(payload.get("name"));
        user.setEnabled(true);
        user.setRole(payload.get("role"));

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        user.setDob(sdf.parse(payload.get("dob")));

        userService.addNewUser(user);

        return ResponseEntity.ok(
                Map.of("message", "User registered successfully")
        );

    } catch (Exception e) {
        return ResponseEntity.badRequest().body(
                Map.of("error", "Invalid data")
        );
    }
}
```

### Required Backend Dependencies:
- `UserService.addNewUser(User user)` method
- `UserRepository` with save functionality
- Password encoding should be handled in UserService

### Security Notes:
- JWT tokens are stored in localStorage
- Consider implementing token refresh logic
- Add proper error handling for expired tokens
- Consider using httpOnly cookies for better security

### Backend Requirements:
The provided Spring Boot controller expects:
- Spring Security with JWT authentication
- UserDetailsService implementation
- AuthenticationManager bean
- JwtUtil for token generation
- PasswordEncoder for password hashing
- UserRepository for database operations

Make sure your backend is running on `http://localhost:8080` for the API calls to work.