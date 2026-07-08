# CRUD Web Application

Simple web application built for technical assessment (3rd July 2026).

## Technologies Used

- **Frontend:** React
- **Backend:** Python (Flask)
- **Database:** MongoDB
- **API:** REST APIs

## Project Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env` file:

```
MONGO_URI=mongodb://localhost:27017
DB_NAME=assessment_db
SECRET_KEY=your-secret-key-here
PORT=5000
```

Start backend:

```bash
python app.py
```

Backend runs at `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

## API Endpoints

| Method | Endpoint         | Description        | Auth Required |
|--------|------------------|--------------------|---------------|
| POST   | `/api/register`  | Register new user  | No            |
| POST   | `/api/login`     | Login user         | No            |
| POST   | `/api/logout`    | Logout user        | No            |
| GET    | `/api/items`     | Get all items      | Yes           |
| POST   | `/api/items`     | Create new item    | Yes           |
| PUT    | `/api/items/:id` | Update an item     | Yes           |
| DELETE | `/api/items/:id` | Delete an item     | Yes           |

### Register

```
POST /api/register
Body: { "name": "John", "email": "john@mail.com", "password": "123456" }
```

### Login

```
POST /api/login
Body: { "email": "john@mail.com", "password": "123456" }
```

### Create Item

```
POST /api/items
Body: { "title": "My Item", "description": "Some text" }
```

## Database Configuration

- **Database Name:** `assessment_db`
- **Collections:**
  - `users` - name, email, password
  - `items` - title, description, user_id

Set `MONGO_URI` in environment variables. Do not commit credentials to git.

For MongoDB Atlas:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
```

## Application Flow

1. User registers
2. User logs in
3. User is redirected to Dashboard
4. User can Create, Read, Update, Delete items
5. User can logout

## Form Validations

- Name: required, min 2 characters
- Email: required, must have @
- Password: required, min 6 characters
- Confirm Password: must match password
- Item Title: required, max 100 characters

## Deploy on Render

### Backend

1. Create Web Service on Render
2. Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `python app.py`
5. Environment variables: `MONGO_URI`, `SECRET_KEY`, `DB_NAME`

### Frontend

1. Create Static Site on Render
2. Root Directory: `frontend`
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`

### MongoDB Atlas

1. Create free cluster at mongodb.com/atlas
2. Create database user
3. Allow access from anywhere (0.0.0.0/0)
4. Use connection string as `MONGO_URI`
