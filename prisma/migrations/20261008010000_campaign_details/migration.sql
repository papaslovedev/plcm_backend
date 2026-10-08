-- Add database-backed campaign details for the public campaign section
ALTER TABLE "SiteSettings" ADD COLUMN "campaignManagerName" TEXT NOT NULL DEFAULT '--------';
ALTER TABLE "SiteSettings" ADD COLUMN "campaignLink" TEXT NOT NULL DEFAULT '#';
