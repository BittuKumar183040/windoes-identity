## Identity Microservice

The **Identity Microservice** is responsible for **authentication and user identity management** in a microservices architecture.
This service is designed to be **stateless**, **scalable**, and **independent**, making it suitable for API Gateway–based architectures.

It handles:
* User registration & authentication
* Secure password storage
* User status management
* Database schema migrations using **Knex**
---
<img width="941" height="658" alt="image" src="https://github.com/user-attachments/assets/62e98df1-11cd-452d-812a-4116cbdb0f1d" />

### Documentation and Swagger

#### Users

🔵 **GET** `/users` - Get all users

🟢 **POST** `/users`- Create a new user

🔵 **GET** `/users/keyword/{keyword}` - Get user information by **ID**, **username**, or **email**

🔵 **GET** `/users/id/{id}` - Get user by ID

🟠 **PUT** `/users/id/{id}/update-username` - Update username using user ID

#### Files

🟢 **POST** `/users/id/{id}/file/upload` - Upload user file *(profile picture / wallpaper)*

🔵 **GET** `/users/id/{id}/file/{fileTag}` - Get user files by **tag** and **status**

🔵 **GET** `/users/id/{id}/file/{fileTag}/download` - Download user file by tag - Defaults to `ACTIVE` if status is missing or invalid

🔵 **GET** `/users/id/{id}/file/fileId/{fileId}/download` - Download file using **fileId** and **userId**

#### Auth

🟢 **POST** `/auth/login` - Authenticate user using **username/email + password** - Issues **JWT auth token**

🟢 **POST** `/auth/login/pin` - Authenticate user using **username/email + PIN** - Issues **JWT auth token**

🟠 **PUT** `/auth/login/pin` - Update user PIN using **short-lived PIN update token**

🟢 **POST** `/auth/login/id/{id}/password/verify` - Verify password and issue **short-lived PIN update token** - Token validity: **5 minutes**

---

### Tech Stack

* **Node.js** (ESM)
* **Express.js**
* **PostgreSQL**
* **Knex.js** (Query Builder + Migrations)
* **bcrypt** (password hashing – upcoming)
* **JWT** (authentication tokens – upcoming)
* **S3/PVC** 
---
### Project Structure

```text
authservice/
├── bin/
│   └── www.js                 # App entry point
├── docs/
│   └── swagger.json
├── migrations/
│   └── hash_description.json 
├── routes/
│   ├── auth.js
│   ├── file.js  
│   ├── users.js 
├── service/
│   ├────── repo/  
│   └── implemenatation/
│   └── ...
├── utility/
│   └── db/
│   └── jwt/
│   └── logger/
│   └── multer/
│   └── helpers...
├── knexfile.cjs               # Knex configuration (CLI)
├── .env                       # Environment variables
├── .env.dummy   
├── .gitignore
├── Dockerfile                 
├── package.json
└── README.md
```

### Environment Variables (`.env`)

```env
PORT=8081
BASE_URL=http://localhost:8081

ROOT_FOLDER=/data

DB_HOST=localhost
DB_PORT=5432
DB_NAME=identity
DB_USER=postgres
DB_PASSWORD=123

PASSWORD_SECRET=hashPasswordSecret
PIN_TOKEN_SECRET_KEY=resetPinToken

JWT_SECRET_KEY=jwtSignSecretKey
JWT_EXPIRES_IN=7d

```

---

### Knex Configuration

#### Create a Migration

```bash
npx knex migrate:make create_users_table
```

####  Run Migrations

```bash
npx knex migrate:latest
```
---
