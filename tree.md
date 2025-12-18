ClovesPluralLink/
├── README.md                     ← Full docs
├── QUICKSTART.md                 ← 5-min setup
├── PROJECT_OVERVIEW.md           ← Architecture 
├── PROJECT_TREE.md               ← This file
├── docker-compose.yml
├── setup.sh
├── .gitignore
│
├── database/
│   └── schema.sql                ← MySQL tables
│
├── api/                          ← Backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example              ← Configure this!
│   ├── Dockerfile
│   └── src/
│       ├── index.ts              ← Main server
│       ├── db.ts
│       ├── types.ts
│       ├── middleware/
│       │   └── auth.ts
│       ├── services/
│       │   ├── userService.ts
│       │   ├── discordService.ts
│       │   └── pluralkitService.ts
│       └── routes/
│           ├── auth.ts
│           └── users.ts
│
└── web/                          ← Frontend
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    ├── Dockerfile
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── api.ts
        ├── index.css
        └── pages/
            ├── Login.tsx
            ├── AuthCallback.tsx
            └── Dashboard.tsx