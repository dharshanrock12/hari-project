# Free Deployment Guide (Render + MongoDB Atlas)

Deploy this project for free using:
- MongoDB Atlas (free database)
- Render (free backend + free frontend)

## Step 1: MongoDB Atlas (Free Database)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account and sign in
3. Click **Build a Cluster** / **Create**
4. Choose **M0 Free** cluster
5. Pick any region close to you → click **Create Deployment**
6. Create a database user:
   - Username: example `admin`
   - Password: create a strong password (save it)
7. Network Access:
   - Click **Network Access** → **Add IP Address**
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`)
   - Confirm
8. Click **Database** → **Connect** → **Drivers**
9. Copy the connection string. It looks like:
   `mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
10. Replace `<password>` with your real password

## Step 2: Deploy Backend on Render

1. Go to https://render.com and sign up (use GitHub login)
2. Click **New +** → **Web Service**
3. Connect GitHub and select repo: `dharshanrock12/hari-project`
4. Fill these settings:

| Setting | Value |
|---------|-------|
| Name | `hari-backend` |
| Root Directory | `backend` |
| Runtime | Python |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn app:app` |
| Instance Type | **Free** |

5. Click **Advanced** → **Add Environment Variable** and add:

| Key | Value |
|-----|-------|
| `MONGO_URI` | your Atlas connection string |
| `DB_NAME` | `assessment_db` |
| `SECRET_KEY` | any random text like `mysecret123` |
| `FRONTEND_URL` | leave blank for now, update after frontend deploy |

6. Click **Create Web Service**
7. Wait until status is **Live**
8. Copy your backend URL, example:
   `https://hari-backend.onrender.com`

9. Test in browser:
   `https://hari-backend.onrender.com/api/register`
   (You may see Method Not Allowed — that means backend is live)

## Step 3: Deploy Frontend on Render

1. In Render, click **New +** → **Static Site**
2. Select the same GitHub repo
3. Fill these settings:

| Setting | Value |
|---------|-------|
| Name | `hari-frontend` |
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

4. Add Environment Variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://YOUR-BACKEND-URL.onrender.com/api` |

Example:
`VITE_API_URL=https://hari-backend.onrender.com/api`

5. Click **Create Static Site**
6. Wait until it is live
7. Copy frontend URL, example:
   `https://hari-frontend.onrender.com`

## Step 4: Connect Frontend URL to Backend

1. Open your backend service on Render
2. Go to **Environment**
3. Set:
   `FRONTEND_URL=https://hari-frontend.onrender.com`
4. Save (it will redeploy)

## Step 5: Test the Live App

1. Open frontend URL in browser
2. Click **Register here**
3. Create account
4. Login
5. Add / edit / delete items

## Important Notes

- Free Render services **sleep after ~15 minutes** of no use
- First open after sleep can take **30–60 seconds**
- If login fails after waiting, refresh once and try again
- Never put passwords in GitHub — only in Render Environment Variables

## What to Share for Assessment

1. GitHub repo: https://github.com/dharshanrock12/hari-project
2. Live app link: your frontend Render URL
3. README already has setup + API docs
