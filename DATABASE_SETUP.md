# PostgreSQL Database Setup

## Prerequisites

Pastikan PostgreSQL sudah terinstall dan berjalan di sistem Anda.

### Download PostgreSQL

- Windows: [PostgreSQL Official Download](https://www.postgresql.org/download/windows/)
- Pilih versi terbaru (minimal 12+)

## Setup Database

### 1. Create Database dan User

Buka PostgreSQL Command Line (psql) atau pgAdmin dan jalankan:

```sql
-- Create database
CREATE DATABASE powerspolnep;

-- Create user
CREATE USER postgres WITH PASSWORD 'delapandelapan';

-- Grant privileges
ALTER ROLE postgres SET client_encoding TO 'utf8';
ALTER ROLE postgres SET default_transaction_isolation TO 'read committed';
ALTER ROLE postgres SET default_transaction_deferrable TO on;
ALTER ROLE postgres SET default_time_zone TO 'UTC';

GRANT ALL PRIVILEGES ON DATABASE powerspolnep TO postgres;
```

### 2. Verify Connection

Test koneksi menggunakan psql:

```bash
psql -h localhost -U postgres -d powerspolnep -W
```

Masukkan password: `delapandelapan`

## Prisma Setup

### 1. Check .env DATABASE_URL

File `.env` harus berisi:

```env
DATABASE_URL="postgresql://postgres:delapandelapan@localhost:5432/powerspolnep?schema=public"
```

### 2. Run Prisma Migrations

```bash
# Create tables
npx prisma migrate dev --name init

# Open Prisma Studio to view data
npx prisma studio
```

### 3. Verify Database

Periksa database sudah siap:

```bash
npx prisma db push
```

## Connection String Format

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

- **USERNAME**: postgres
- **PASSWORD**: delapandelapan
- **HOST**: localhost
- **PORT**: 5432 (default)
- **DATABASE**: powerspolnep
- **SCHEMA**: public (default)

## Troubleshooting

### Error: "Authentication failed"

**Solution:**

1. Pastikan PostgreSQL berjalan
2. Cek username dan password
3. Cek host dan port

Verifikasi dengan:

```bash
psql -h localhost -U postgres -W
```

### Error: "Database does not exist"

**Solution:**
Jalankan SQL create database seperti di atas:

```sql
CREATE DATABASE powerspolnep;
```

### Error: "Port 5432 is already in use"

**Solution:**
PostgreSQL sudah berjalan, atau ada service lain yang menggunakan port 5432.

Cek process:

```bash
lsof -i :5432  # Mac/Linux
netstat -ano | findstr :5432  # Windows
```

## Development Commands

```bash
# Apply migrations
npx prisma migrate dev

# View database in UI
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Reset database (delete all data)
npx prisma migrate reset

# Check schema status
npx prisma db push --dry-run
```

## Production Setup

Untuk production, gunakan managed PostgreSQL service seperti:

- AWS RDS
- Google Cloud SQL
- Azure Database for PostgreSQL
- DigitalOcean Managed Databases

Update `DATABASE_URL` di environment production dengan connection string dari provider tersebut.

---

**Last Updated:** October 29, 2024
