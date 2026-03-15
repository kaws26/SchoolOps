# SchoolOPS

SchoolOps is a modern school management system to automate and streamline school administration processes.

## Technical Information

- **Language**: Java 21
- **Framework**: Spring Boot 4.0.1
- **Database**: MySQL 5.5+
- **Build Tool**: Maven 3.6+
- **Key Dependencies**:
  - Spring Boot Starter Web (for REST APIs)
  - Spring Boot Starter Data JPA (for database operations with Hibernate)
  - Spring Boot Starter Security (for authentication and authorization)
  - Spring Boot Starter Validation (for input validation)
  - Spring Boot Starter Mail (for email functionality)
  - MySQL Connector/J (database driver)
  - Razorpay Java SDK (for payment integration)
  - Lombok (for reducing boilerplate code)
  - JJWT (for JSON Web Tokens)
  - Cloudinary (for image/file storage)

## Prerequisites

Before running the application locally, ensure you have the following installed:

- Java 21 (JDK)
- Maven 3.6 or higher
- MySQL 5.5 or higher
- Git (for cloning the repository)

## Local Setup Instructions

1. **Clone the Repository**:
   ```
   git clone <repository-url>
   cd SchoolOPS
   ```

2. **Set Up MySQL Database**:
   - Install and start MySQL server.
   - Create a database named `schoolops`:
     ```sql
     CREATE DATABASE schoolops;
     ```

3. **Configure Environment Variables**:
   Set the following environment variables in your system (or create a `.env` file and load it):
   - `SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/schoolops`
   - `SPRING_DATASOURCE_USERNAME=root` (or your MySQL username)
   - `SPRING_DATASOURCE_PASSWORD=your_mysql_password`
   - `SPRING_MAIL_USERNAME=your_email@gmail.com`
   - `SPRING_MAIL_PASSWORD=your_app_password` (Gmail app password for SMTP)
   - `CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name`
   - `CLOUDINARY_API_KEY=your_cloudinary_api_key`
   - `CLOUDINARY_API_SECRET=your_cloudinary_api_secret`
   - `RAZORPAY_KEY_ID=your_razorpay_key_id`
   - `RAZORPAY_KEY_SECRET=your_razorpay_key_secret`
   - `APP_FRONTEND_RESET_PASSWORD_URL=http://localhost:5173/reset-password` (adjust if frontend runs on different port)

4. **Update Application Properties** (Optional but Recommended):
   Modify `src/main/resources/application.properties` to use environment variables for sensitive data:
   ```properties
   spring.application.name=SchoolOPS

   # Database
   spring.datasource.url=${SPRING_DATASOURCE_URL}
   spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
   spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   spring.jpa.properties.dialect=org.hibernate.dialect.MySQL55Dialect
   spring.jpa.hibernate.ddl-auto=update

   # File Upload
   spring.servlet.multipart.max-file-size=10MB
   spring.servlet.multipart.file-size-threshold=10MB

   # Mail
   spring.mail.host=smtp.gmail.com
   spring.mail.port=465
   spring.mail.username=${SPRING_MAIL_USERNAME}
   spring.mail.password=${SPRING_MAIL_PASSWORD}
   spring.mail.properties.auth=true
   spring.mail.properties.mail.smtp.starttls.enable=true
   spring.mail.properties.mail.smtp.socketFactory.class=javax.net.ssl.SSLSocketFactory
   spring.mail.properties.mail.smtp.socketFactory.fallback=false

   # Cloudinary
   cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
   cloudinary.api-key=${CLOUDINARY_API_KEY}
   cloudinary.api-secret=${CLOUDINARY_API_SECRET}

   # URLs
   app.frontend.reset-password-url=${APP_FRONTEND_RESET_PASSWORD_URL}

   # Razorpay
   razorpay.key.id=${RAZORPAY_KEY_ID}
   razorpay.key.secret=${RAZORPAY_KEY_SECRET}
   ```

5. **Build the Application**:
   ```
   mvn clean install
   ```

6. **Run the Application**:
   ```
   mvn spring-boot:run
   ```
   The application will start on `http://localhost:8080` by default.

## Docker Setup (Alternative)

If you prefer using Docker:

1. Ensure Docker and Docker Compose are installed.
2. Build the Docker image:
   ```
   docker build -t schoolops .
   ```
3. Run the container with environment variables:
   ```
   docker run -p 8080:8080 --env-file .env schoolops
   ```

## API Documentation

Once the application is running, you can access the API endpoints. (Add Swagger/OpenAPI if available)

## Contributing

- Follow standard Java coding conventions.
- Use Lombok annotations for boilerplate code.
- Ensure all tests pass before committing.

## Troubleshooting

- **Database Connection Issues**: Verify MySQL is running and credentials are correct.
- **Mail Sending Fails**: Check Gmail app password and less secure app access.
- **File Upload Errors**: Ensure Cloudinary credentials are valid.

For more help, refer to the Spring Boot documentation or check the logs in the `logs/` directory.</content>
<parameter name="filePath">C:\Users\lenovo\Desktop\SchoolOps\SchoolOps\Backend\SchoolOPS\SchoolOPS\README.md
