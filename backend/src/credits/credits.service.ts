import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Credit, CreditStatus } from './entities/credit.entity';
import { CreditPayment } from './entities/credit-payment.entity';

// All monetary fields on Credit/CreditPayment/Customer (amount_due,
// amount_paid, amount, credit_limit) are `int` columns denominated in
// centavos (MXN). Never multiply/divide by 100 in this service — values
// arrive and leave already in cents.
@Injectable()
export class CreditsService {
  constructor(
    @InjectRepository(Credit) private creditsRepo: Repository<Credit>,
    private dataSource: DataSource,
  ) {}

  async getOutstandingBalance(creditKey: string): Promise<number> {
    const credit = await this.creditsRepo.findOne({ where: { credit_key: creditKey } });
    if (!credit) throw new NotFoundException(`Credit ${creditKey} not found`);
    return credit.amount_due - credit.amount_paid;
  }

  async recordPayment(
    creditKey: string,
    amount: number,
    registeredByUserKey: string,
  ): Promise<Credit> {
    return this.dataSource.transaction(async (manager) => {
      const creditsRepo = manager.getRepository(Credit);
      const credit = await creditsRepo.findOne({ where: { credit_key: creditKey } });
      if (!credit) throw new NotFoundException(`Credit ${creditKey} not found`);

      if (amount <= 0) {
        throw new BadRequestException('Payment amount must be positive');
      }

      const outstanding = credit.amount_due - credit.amount_paid;
      if (amount > outstanding) {
        throw new BadRequestException(
          `Payment (${amount}) exceeds outstanding balance (${outstanding})`,
        );
      }

      credit.amount_paid += amount;
      const remaining = credit.amount_due - credit.amount_paid;
      credit.status = remaining <= 0 ? CreditStatus.PAID : CreditStatus.PARTIAL;
      await creditsRepo.save(credit);

      await manager.getRepository(CreditPayment).save(
        manager.getRepository(CreditPayment).create({
          credit_key: creditKey,
          amount,
          registered_by: registeredByUserKey,
        }),
      );

      return credit;
    });
  }
}
