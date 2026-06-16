# CampusCare Database Setup

CampusCare uses PostgreSQL. These steps are intended for local development only.

## 1. Create the database

Create a PostgreSQL database named `campuscare`.

## 2. Configure the backend

Copy the example file and set your local PostgreSQL connection:

```bash
cp backend/.env.example backend/.env
```

On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Set `DATABASE_URL` and a secure `JWT_SECRET` in `backend/.env`. Never commit this file.

## 3. Run schema migrations

From the backend folder, run:

```bash
npm run migrate
```

The migration command runs the required schema files in this order:

1. `001_init_users.sql`
2. `002_init_modules.sql`
3. `004_user_profiles_and_engagement.sql`
4. `006_notifications.sql`

The files `003_seed_demo_data.sql` and `005_configure_approved_admin.sql` are older data setup files, not schema migrations. The recommended local setup uses the TypeScript seed command below instead.

The same SQL files can also be executed manually with `psql` or the pgAdmin Query Tool if needed.

## 4. Seed local demo data

From the backend folder:

```bash
npm install
npm run seed
```

The seed is idempotent, hashes demo passwords with bcrypt, and creates Student, Mentor, and approved Admin accounts with a small set of module records and notifications.

Local demo accounts:

| Role | Email |
| --- | --- |
| Student | `student@campuscare.local` |
| Mentor | `mentor@campuscare.local` |
| Admin | `fluturahysenni@gmail.com` |

The default local demo password is `12345678`. It is hashed with bcrypt before database insertion and must not be used in production.

Override the local demo password when needed:

```bash
DEMO_SEED_PASSWORD=your_local_demo_password npm run seed
```

On Windows PowerShell:

```powershell
$env:DEMO_SEED_PASSWORD="your_local_demo_password"
npm run seed
```

The current project does not require a password-reset table. Its forgot-password endpoint only returns a privacy-safe acknowledgement.

## Render + Neon setup

For the deployed Render backend, set the Neon connection string as `DATABASE_URL` in Render environment variables. Do not commit it.

After deployment, run these commands in the Render shell or as a one-time job from the backend service:

```bash
npm run migrate
npm run seed
```

If the Render service is configured from the repository root instead of the `backend` folder, use:

```bash
npm run migrate --workspace backend
npm run seed --workspace backend
```

Then verify:

```text
GET https://campus-care-backend-i27p.onrender.com/api/health
```

If health is connected but login returns `503`, the deployed database usually has not received the migrations yet or Render is pointing to a different `DATABASE_URL` than the one migrated locally.

## Production demo-user cleanup

To reset the deployed Neon database back to only the approved Admin, demo Student, and demo Mentor accounts, run this from the Render shell after the latest backend deployment:

```bash
npm run cleanup:demo-users
```

If Render is configured from the repository root instead of the `backend` folder, use:

```bash
npm run cleanup:demo-users --workspace backend
```

This command keeps only:

- `fluturahysenni@gmail.com` as `admin`
- `student@campuscare.local` as `student`
- `mentor@campuscare.local` as `mentor`

It hashes the required demo passwords with bcrypt and removes related rows for deleted temporary users. It does not drop tables or print database credentials.
