# eCvite-inspired — Guest & Event Manager (Neon PostgreSQL)

A starter application inspired by eCvite's guest-table workflow, using **React + Vite**, **Java 21 + Spring Boot**, **Spring Data JPA**, and **Neon PostgreSQL**.

## Requirements
- Java 21+
- Maven 3.9+
- Node.js 20+
- A Neon account and PostgreSQL database

## 1. Create/connect your Neon database
1. Create a project at https://neon.tech/ (or open your existing project).
2. In the Neon dashboard, open **Connect** and select your database and branch.
3. Copy the host, database name, username, and password from the connection details.
4. Build a JDBC URL in this format:
   `jdbc:postgresql://YOUR-HOST.neon.tech/YOUR_DATABASE?sslmode=require`
   Replace the host and database with the actual values from Neon. Do not include angle brackets.

## 2. Configure environment variables (Windows PowerShell)
Open PowerShell in the `backend` directory and set the values for the current terminal session:

```powershell
$env:DB_URL="jdbc:postgresql://YOUR-HOST.neon.tech/neondb?sslmode=require"
$env:DB_USERNAME="YOUR_NEON_USERNAME"
$env:DB_PASSWORD="YOUR_NEON_PASSWORD"
```

Replace all example values with the credentials shown in Neon. Keep the password private and never commit it to Git. `backend/.env.example` is only a template; Spring Boot does not automatically load that file.

## 3. Run the backend
In the same PowerShell window, from `backend`:

```powershell
mvn spring-boot:run
```

API: `http://localhost:8080/api/guests`

## 4. Run the frontend
Open a second terminal in `frontend`:

```powershell
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

## Included
- Hebrew RTL interface
- Guest table with search and RSVP filter
- Add, edit, and delete guests
- Autosave edits through the Java REST API
- Print-friendly guest list
- Neon PostgreSQL storage (no local H2 database)

## Notes
- The backend connects to Neon over SSL using `sslmode=require`.
- Hibernate uses `ddl-auto=update` to create/update the entity schema automatically. For production, prefer managed database migrations such as Flyway and review schema changes before deploying.
- This is a starter implementation, not a copy of eCvite's source code. Event-level management, authentication, import/export and version history can be added next.
