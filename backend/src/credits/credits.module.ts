import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditsService } from './credits.service';
import { Customer } from './entities/customer.entity';
import { Credit } from './entities/credit.entity';
import { CreditPayment } from './entities/credit-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Credit, CreditPayment])],
  providers: [CreditsService],
  exports: [CreditsService],
})
export class CreditsModule {}
