# 🚀 Dewanshu Portfolio — Backend Setup Guide

## Stack
- **Runtime**: Node.js + Express.js
- **Database**: PostgreSQL
- **Email**: Nodemailer (Gmail)
- **GitHub**: GitHub REST API v3

---

## 📦 Step 1 — Install Node.js & PostgreSQL

### Node.js
Download from: https://nodejs.org (LTS version)

### PostgreSQL
Download from: https://www.postgresql.org/download/

---

## 📁 Step 2 — Setup Project

```bash
# Open terminal in this folder
cd portfolio-backend

# Install all dependencies
npm install

# Copy environment file
cp .env.example .env
```

---

## 🗄️ Step 3 — Setup Database (Supabase — FREE, no install needed!)

### Why Supabase?
Cloud-hosted PostgreSQL, completely free, no local install needed. Perfect for resume projects.

### Setup Steps:

1. Go to **supabase.com** → Sign up with GitHub (free)
2. Click **"New Project"**
   - Name: `dewanshu-portfolio`
   - Database Password: (set a strong one, save it somewhere safe)
   - Region: `Mumbai` (closest to India, fastest)
3. Wait ~2 minutes for project to spin up
4. Go to **SQL Editor** (left sidebar) → **New Query**
5. Open `sql/schema.sql` from this folder, copy ALL its content
6. Paste into the SQL Editor → click **Run**
   - This creates all 5 tables (projects, certifications, skills, contact_messages, page_views) + inserts sample data
7. Go to **Settings → Database** → scroll to **Connection string**
8. Copy the connection details — you'll need these for `.env`:
   - Host
   - Port (usually 5432, or 6543 for pooled connection)
   - Database name
   - User
   - Password (the one you set in step 2)

### Alternative (local install):
```bash
psql -U postgres
CREATE DATABASE portfolio_db;
\q
psql -U postgres -d portfolio_db -f sql/schema.sql
```

---

## ⚙️ Step 4 — Configure .env

Open `.env` file and fill in:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portfolio_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

PORT=5000
FRONTEND_URL=http://localhost:5500

EMAIL_USER=youremail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx   ← Gmail App Password (NOT your main password)
EMAIL_TO=youremail@gmail.com

GITHUB_USERNAME=yourgithubusername
GITHUB_TOKEN=ghp_yourtoken        ← Optional but recommended
```

### Gmail App Password kaise banayein:
1. Gmail → Settings → Security
2. "2-Step Verification" ON karo
3. "App passwords" → "Mail" select karo → Generate
4. Woh 16-character password `.env` mein daalo

### GitHub Token (optional):
1. github.com → Settings → Developer Settings
2. Personal access tokens → Tokens (classic)
3. New token → `public_repo` scope select karo → Generate

---

## ▶️ Step 5 — Run Server

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server chalega: http://localhost:5000

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | All projects from DB |
| GET | `/api/projects/featured` | Featured projects only |
| GET | `/api/projects/github` | Live GitHub repos |
| GET | `/api/certifications` | All certifications with links |
| POST | `/api/certifications` | Add new certification |
| PUT | `/api/certifications/:id` | Update certification |
| DELETE | `/api/certifications/:id` | Delete certification |
| GET | `/api/skills` | All skills |
| GET | `/api/skills/grouped` | Skills grouped by category |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/contact/messages` | View all messages |
| GET | `/api/health` | Server + DB health check |

---

## 🌍 Free Deployment Options

### Backend Deploy (Railway — Free):
1. railway.app → New Project → Deploy from GitHub
2. Add environment variables in Railway dashboard
3. URL milega: `yourapp.railway.app`

### Database (Supabase — Free PostgreSQL):
1. supabase.com → New Project
2. SQL Editor mein `schema.sql` paste karke run karo
3. Connection string copy karke Railway mein daalo

### Frontend Deploy (GitHub Pages — Free):
1. HTML file ko `index.html` naam se GitHub repo mein daalo
2. Settings → Pages → main branch → Save
3. URL: `yourusername.github.io`

---

## 🔗 Frontend se Connect karna

Apni portfolio HTML file mein yeh add karo:

```javascript
const API = 'http://localhost:5000'; // Development
// const API = 'https://yourapp.railway.app'; // Production

// Projects fetch karo
fetch(`${API}/api/projects`)
  .then(r => r.json())
  .then(data => console.log(data.data));

// GitHub repos fetch karo
fetch(`${API}/api/projects/github`)
  .then(r => r.json())
  .then(data => console.log(data.data));

// Contact form submit karo
fetch(`${API}/api/contact`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, message })
})
  .then(r => r.json())
  .then(data => alert(data.message));
```
