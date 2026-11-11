# KidBuddy Backend

The REST API for the KidBuddy app: accounts, the Parent PIN, child profiles, story
personalisation, Read-Along topics, stars / progress and struggle words.

**Stack:** Node.js · Express 5 · MySQL / MariaDB (XAMPP) with `mysql2` · JWT · bcrypt · dotenv

- Full list of endpoints: **[docs/API.md](docs/API.md)**
- This backend lives in its own folder with its own `package.json`. It does not change the React Native app.

---

## 1. What you need

| Tool | Version | Check with |
|---|---|---|
| Node.js | 18 or newer (tested on 24) | `node -v` |
| XAMPP | any recent version (MySQL / MariaDB 10.4+ or MySQL 8) | XAMPP Control Panel |

---

## 2. XAMPP and the database

### 2.1 Start MySQL
1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **MySQL**. It turns green and shows port **3306**.
   *(Apache is only needed if you want phpMyAdmin.)*

### 2.2 Create the database (only the first time)
If the `kidbuddy` database already exists with its tables, **skip this step**.

1. Start **Apache** too, then open <http://localhost/phpmyadmin>.
2. Click **Import**, choose `database/01_schema.sql`, and click **Go**.
3. Click **Import** again, choose `database/02_seed.sql`, and click **Go**.

> ⚠️ **Warning:** `01_schema.sql` starts with `DROP TABLE IF EXISTS ...`. Importing it again
> **deletes every table and all data** in `kidbuddy`. Import it only once, on an empty database.

### 2.3 Run the migration (once)
The backend needs one small extra column (explained in
[`database/migrations/001_add_relation_text_to_story_answers.sql`](database/migrations/001_add_relation_text_to_story_answers.sql)).
It only **adds** a column and deletes nothing. Run it after `npm install` (step 3):

```bash
npm run migrate
```

The script remembers what it has already run (in a table `schema_migrations`), so running it
twice is safe. A new migration added later is run the same way.

> Without this migration, saving a child's **story** fails. Everything else works.

---

## 3. Install and start the backend

```bash
cd backend
npm install                # installs the packages listed in package.json
copy .env.example .env     # Windows   (macOS / Linux: cp .env.example .env)
```

Open `.env` and check the values:

| Setting | What it is | XAMPP default |
|---|---|---|
| `DB_HOST`, `DB_PORT` | where MySQL runs | `127.0.0.1`, `3306` |
| `DB_USER`, `DB_PASSWORD` | MySQL login | `root` and empty |
| `DB_NAME` | your database | `kidbuddy` |
| `TEST_DB_NAME` | the database used by the tests | `kidbuddy_test` |
| `JWT_SECRET` | the secret that signs login tokens (**at least 32 random characters**) | make one ⬇ |
| `EMAIL_MODE` | `console` = print emails in the terminal, `smtp` = really send them | `console` |

Make a JWT secret like this:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Then:
```bash
npm run migrate   # once (see 2.3)
npm start         # or: npm run dev   (restarts automatically when you save a file)
```

You should see:
```
KidBuddy API running on http://localhost:4000  (database: kidbuddy)
```

Check it in a browser: <http://localhost:4000/health> → `{"status":"ok"}`

### Common problems
| Message | Fix |
|---|---|
| `Could not connect to MySQL database "kidbuddy"` | Start MySQL in XAMPP. Check `DB_USER` / `DB_PASSWORD` in `.env`. |
| `Missing setting JWT_SECRET` | You have no `.env` yet, or `JWT_SECRET` is empty. |
| `Unknown column 'relation_text'` | Run `npm run migrate`. |
| `EADDRINUSE :4000` | Another program uses port 4000. Change `PORT` in `.env`. |

### Emails (the 6-digit codes)
- `EMAIL_MODE=console` (development): the email, with its code, is **printed in the terminal**
  where the backend runs. This is the same idea as `DEMO_MODE` in the app.
- `EMAIL_MODE=smtp`: real emails. Fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`,
  `SMTP_PASS` and `EMAIL_FROM` (for example from Mailtrap, Brevo, or a Gmail app password).

---

## 4. Calling the API from the phone

- **Android emulator:** `http://10.0.2.2:4000`
- **iOS simulator / Expo web:** `http://localhost:4000`
- **A real phone with Expo Go:** your computer's Wi-Fi IP address, for example `http://192.168.1.20:4000`
  (find it with `ipconfig`). The phone must be on the same Wi-Fi. Windows Firewall may ask to allow Node.js.

Every protected request sends the login token:
```
Authorization: Bearer <token from /api/auth/login>
```

---

## 5. Automated tests

```bash
npm test
```

- The tests use a **separate database, `kidbuddy_test`**. Each run deletes and rebuilds it
  from `database/01_schema.sql`, `database/02_seed.sql` and the migrations.
- **Your real `kidbuddy` database is never touched.** There are four safety checks:
  the test database name must end with `_test`, it must differ from `DB_NAME`, the
  `CREATE DATABASE` / `USE kidbuddy` lines are removed from the SQL before it runs, and the
  connection is checked with `SELECT DATABASE()` before anything runs.
- Emails are not sent during tests. They are kept in memory so the tests can read the codes.
- XAMPP MySQL must be running.

---

## 6. Folder structure

```
backend/
├── .env.example            settings template (copy to .env)
├── database/
│   ├── 01_schema.sql       your schema (unchanged copy)
│   ├── 02_seed.sql         your seed data (unchanged copy)
│   ├── migrations/         additive changes, run by `npm run migrate`
│   └── migrate.js
├── docs/API.md             every endpoint
├── src/
│   ├── server.js           starts the server (checks the database first)
│   ├── app.js              the Express app: middleware + routes + error handler
│   ├── config/             reads .env once
│   ├── db/connection.js    the MySQL pool: query() and withTransaction()
│   ├── routes/             URL -> checks -> controller
│   ├── middleware/         auth (JWT), childAccess (own children only), validate, errors
│   ├── validation/         checks for every request body
│   ├── controllers/        read the request, call a service, send the answer
│   ├── services/           the real work + all SQL
│   └── utils/HttpError.js  an error with an HTTP status code
└── tests/                  Jest + Supertest
```

**How a request flows** (example: `PATCH /api/children/12`):
`routes/childRoutes.js` → `middleware/auth.js` (who is it?) → `middleware/childAccess.js`
(is child 12 theirs?) → `middleware/validate.js` + `validation/childValidation.js` (is the
data OK?) → `controllers/childController.js` → `services/childService.js` (SQL) → JSON answer.
Any error goes to `middleware/errorHandler.js`.

---

## 7. Security, in short

- Passwords and the Parent PIN are stored as **bcrypt hashes**, using `bcryptjs`, the same
  algorithm in plain JavaScript, so no C++ build tools are needed on Windows.
- Old password hashes are kept, so a parent cannot reuse an old password.
- Email codes are stored as **SHA-256 hashes**. Each code works for 10 minutes and allows 5
  wrong tries, and a new code can be requested once a minute.
- **JWT login tokens** are checked against the `user_sessions` table, so logging out or
  changing the password really ends a login.
- The PIN locks for **5 minutes after 5 wrong tries**.
- Every child route checks that the child belongs to the logged-in parent. Otherwise it
  answers **404**, so nobody can discover other children's ids.
- Every SQL value uses a `?` placeholder (parameterised queries).
- Answers never contain password hashes, PIN hashes, codes, or SQL errors.
- "Forgot password" and "resend code" give the **same answer** whether or not the email exists.
