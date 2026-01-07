/*
  Warnings:

  - The values [M25,M30,M30PLUS] on the enum `MarginBucket` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MarginBucket_new" AS ENUM ('M5', 'M10', 'M15', 'M20', 'M25PLUS');
ALTER TABLE "Pick" ALTER COLUMN "pickMargin" TYPE "MarginBucket_new" USING ("pickMargin"::text::"MarginBucket_new");
ALTER TYPE "MarginBucket" RENAME TO "MarginBucket_old";
ALTER TYPE "MarginBucket_new" RENAME TO "MarginBucket";
DROP TYPE "public"."MarginBucket_old";
COMMIT;
