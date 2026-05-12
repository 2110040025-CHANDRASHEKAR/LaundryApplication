# LaundryApplication
A full-stack Laundry Service Web Application built with HTML, CSS, JavaScript (Frontend) and Node.js, Express, MySQL (Backend).


## Installation & Setup

### 1. Clone the repository
git clone https://github.com/2110040025-CHANDRASHEKAR/LaundryApplication.git

### 2. Install backend dependencies
cd backend
npm install

### 3. Setup Database
- Open MySQL Workbench
- Run the file `backend/database/laundry_db.sql`

### 4. Configure Environment Variables
Create a `.env` file inside the `backend` folder:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=laundry_db
JWT_SECRET=your_secret_key

### 5. Run the application
cd backend
node server.js

## Project Structure
LaundryApplication/
├── backend/
│   ├── config/
│   ├── database/
│   │   └── laundry_db.sql
│   ├── middleware/
│   ├── routes/
│   ├── .env
│   └── server.js
└── frontend/
    ├── Controllers/
    ├── Htmls/
    ├── Module/
    ├── Services/
    └── Styles/
