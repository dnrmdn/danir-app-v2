CREATE TYPE "PlanType" AS ENUM ('FREE', 'PRO_TRIAL', 'PRO');

CREATE TYPE "SubscriptionStatus" AS ENUM ('NONE', 'TRIALING', 'ACTIVE', 'EXPIRED', 'CANCELED');

ALTER TABLE "user"
ADD COLUMN "planType" "PlanType" NOT NULL DEFAULT 'PRO_TRIAL',
ADD COLUMN "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
ADD COLUMN "trialStartAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "trialEndAt" TIMESTAMP(3) DEFAULT (CURRENT_TIMESTAMP + interval '30 days'),
ADD COLUMN "proStartedAt" TIMESTAMP(3),
ADD COLUMN "subscriptionEndsAt" TIMESTAMP(3);

UPDATE "user"
SET
  "trialStartAt" = COALESCE("trialStartAt", CURRENT_TIMESTAMP),
  "trialEndAt" = COALESCE("trialEndAt", CURRENT_TIMESTAMP + interval '30 days')
WHERE "planType" = 'PRO_TRIAL';
