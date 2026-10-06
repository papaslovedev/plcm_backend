CREATE TABLE "AdminAccount" (
  "id" TEXT NOT NULL DEFAULT 'main',
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminAccount_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AdminAccount_email_key" UNIQUE ("email")
);