ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "email_verified" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "name" TEXT,
ADD COLUMN IF NOT EXISTS "image" TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'emailVerified'
  ) THEN
    EXECUTE '
      UPDATE "users"
      SET "email_verified" = COALESCE("email_verified", "emailVerified")
      WHERE "emailVerified" IS NOT NULL
    ';
  END IF;
END $$;
