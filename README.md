# DevLens - AI Project Understanding Platform

DevLens is an AI-inspired project understanding platform that helps developers understand unfamiliar codebases faster. It scans a project folder and generates useful insights about files, components, API calls, backend routes, imports, database models, security warnings, unused files, duplicate files, code complexity, and project structure.

## Problem Statement

Developers often spend a lot of time understanding unfamiliar projects. When joining a company, contributing to open source, or taking over an existing codebase, it can be difficult to find where features are implemented, how frontend and backend are connected, where APIs are called, which routes exist, and which files are important.

DevLens solves this problem by automatically analyzing a project and presenting the codebase in a structured, understandable way.

## Key Features

- Project folder scanning
- File type classification
- Important file detection
- React component detection
- API call detection
- Backend route detection
- API flow mapping
- Route health checker
- Import map
- Database model detector
- Folder structure visualizer
- Technology stack detector
- Unused file detector
- Duplicate file detector
- Security warnings
- Code health score
- Complexity detector
- Large file detector
- Ask DevLens assistant
- Project explanation generator
- Downloadable Markdown project report

## Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- Express.js
- CORS
- Dotenv
- File System module

## How DevLens Works

1. User enters a local project path.
2. React sends the path to the Express backend.
3. Backend scans files recursively.
4. Analyzer detects patterns such as imports, API calls, routes, models, and warnings.
5. Backend returns structured project insights.
6. React displays the results in an interactive dashboard.

## Example Use Case

A developer wants to understand authentication in a MERN project. Instead of manually searching many files, they can scan the project with DevLens and ask:

```txt
Where is authentication implemented?

# DevLens - Backend Suite

The backend service for **DevLens** (AI Project Understanding Platform), built with Node.js, Express, MongoDB (Mongoose), JWT Authentication, and static code analysis utilities.

---

## 🌟 Features

* **User Authentication:** Registration, Login, Profile lookup, Password Hashing (`bcryptjs`), and JWT Token Authorization.
* **Scan & Persistence Engine:** Scans local project paths, extracts API calls, routes, and Mongoose models, and saves scan reports to MongoDB per user.
* **Security & Health Audit:** Automatically calculates a Code Health Rating (0–100%) and scans for hardcoded API keys or missing `.env` files.
* **Protected Routes Middleware:** Enforces JWT token validation on private endpoints.

---

## 🛠 Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose)
* **Security:** `jsonwebtoken`, `bcryptjs`, `cookie-parser`, `cors`
* **Configuration:** `dotenv`

---

## 🚀 Getting Started

### 1. Installation

```bash
cd server
npm install