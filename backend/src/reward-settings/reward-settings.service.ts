import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RewardSettingsDto {
  mode: 'NONE' | 'DISCOUNT' | 'GIFT';
  enabled: boolean;
  minEligibleAmount: number;
  excludedCategoryIds?: string;
  discountPercent: number;
  discountCap: number;
  allowedPaymentModes: string;
  allowedBillingTypes: string;
  allocateOnlyByInventory: boolean;
  fallbackMode: 'NONE' | 'DISCOUNT';
}

@Injectable()
export class RewardSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.rewardSettings.findFirst();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await this.prisma.rewardSettings.create({
        data: {
          mode: 'NONE',
          enabled: false,
          minEligibleAmount: 0,
          discountPercent: 1,
          discountCap: 50,
          allowedPaymentModes: 'CASH,UPI,BANK',
          allowedBillingTypes: 'WHOLESALE,DELIVERY',
          allocateOnlyByInventory: true,
          fallbackMode: 'NONE',
        },
      });
    }
    
    return settings;
  }

  async updateSettings(data: Partial<RewardSettingsDto>) {
    const settings = await this.getSettings();
    
    // Validate that only one mode is active at a time
    if (data.mode && data.mode !== 'NONE') {
      // Ensure exclusivity of modes
      if (data.enabled === true && data.mode === 'DISCOUNT') {
        data.fallbackMode = 'NONE'; // Disable fallback when discount is primary
      }
    }

    return this.prisma.rewardSettings.update({
      where: { id: settings.id },
      data,
    });
  }

  async checkEligibility(
    customerId: string,
    paymentMode: string,
    billingType: string,
    eligibleAmount: number,
  ): Promise<{
    isEligible: boolean;
    reason?: string;
    settings: any;
  }> {
    const settings = await this.getSettings();

    if (!settings.enabled || settings.mode === 'NONE') {
      return {
        isEligible: false,
        reason: 'Rewards are not enabled',
        settings,
      };
    }

    if (eligibleAmount < settings.minEligibleAmount) {
      return {
        isEligible: false,
        reason: `Eligible amount must be at least ₹${settings.minEligibleAmount}`,
        settings,
      };
    }

    const allowedPayments = settings.allowedPaymentModes.split(',').map(p => p.trim());
    if (!allowedPayments.includes(paymentMode)) {
      return {
        isEligible: false,
        reason: `Payment mode ${paymentMode} not allowed for rewards`,
        settings,
      };
    }

    const allowedTypes = settings.allowedBillingTypes.split(',').map(t => t.trim());
    if (!allowedTypes.includes(billingType)) {
      return {
        isEligible: false,
        reason: `Customer type ${billingType} not eligible for rewards`,
        settings,
      };
    }

    return {
      isEligible: true,
      settings,
    };
  }
}
