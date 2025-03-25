# Inua Mkulima app

This project helps merchants manage subssidized farmer puchases

## Architechture

- Full stack Single-Page App typescript project
- Using react for frontend
- TailwindCSS for styling
- NodeJs on the back end
- PostgresSQL as the database, with Prisma as the ORM layer
- NextJs framework

## Directory structure

- File based routing, with each file in the `/pages` directory representing an application route
- The `/pages/api/*` directory contains a simple REST api to fetch and update records
- Each API route includes simple error handling
- Logs are stored at the root of the project, in `logs.txt`
- Database schema defined in using prisma in the `/prisma/schema.prisma` file
- Public folder contains static files that are directly accessible

## Getting Started

- Install dependencies: `npm install`
- Copy `.env.example` and rename it to `.env`
- Add your db connection string to .env `DATABASE_URL=postgres://<username>:<password>@host/<dbname>`.
- Initialize DB: `npx prisma db push`
- Start the development server `npm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
