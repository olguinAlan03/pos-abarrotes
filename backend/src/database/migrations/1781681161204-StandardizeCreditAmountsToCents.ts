import { MigrationInterface, QueryRunner } from "typeorm";

export class StandardizeCreditAmountsToCents1781681161204 implements MigrationInterface {
    name = 'StandardizeCreditAmountsToCents1781681161204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "credit_payments" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "credit_payments" ADD "amount" integer NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "credit_payments"."amount" IS 'Amount paid in centavos (MXN)'`);
        await queryRunner.query(`ALTER TABLE "credits" DROP COLUMN "amount_paid"`);
        await queryRunner.query(`ALTER TABLE "credits" ADD "amount_paid" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "credits"."amount_paid" IS 'Amount paid in centavos (MXN)'`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "credit_limit"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "credit_limit" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "customers"."credit_limit" IS 'Credit limit in centavos (MXN)'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "customers"."credit_limit" IS 'Credit limit in centavos (MXN)'`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "credit_limit"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "credit_limit" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "credits"."amount_paid" IS 'Amount paid in centavos (MXN)'`);
        await queryRunner.query(`ALTER TABLE "credits" DROP COLUMN "amount_paid"`);
        await queryRunner.query(`ALTER TABLE "credits" ADD "amount_paid" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "credit_payments"."amount" IS 'Amount paid in centavos (MXN)'`);
        await queryRunner.query(`ALTER TABLE "credit_payments" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "credit_payments" ADD "amount" numeric(10,2) NOT NULL`);
    }

}
