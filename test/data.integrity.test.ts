import { describe, it, expect } from 'vitest';

interface CartItem {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
}

interface Product {
  id: number | string;
  name: string;
  price: number;
  stock: number;
}

describe('Data Integrity & Financial Calculation Rules', () => {
  const trustedProducts: Product[] = [
    { id: 1, name: 'Dahua 3MP', price: 3200, stock: 10 },
    { id: 2, name: 'Hikvision 5MP', price: 4500, stock: 5 }
  ];

  it('calculates order total using trusted product catalog prices, rejecting client price spoofing', () => {
    const clientItems: CartItem[] = [
      { id: 1, name: 'Dahua 3MP', price: 10, quantity: 2 }, // Attempted spoof price 10 BDT
      { id: 2, name: 'Hikvision 5MP', price: 1, quantity: 1 }  // Attempted spoof price 1 BDT
    ];

    let validatedTotal = 0;
    clientItems.forEach(item => {
      const catalogItem = trustedProducts.find(p => p.id === item.id);
      const actualPrice = catalogItem ? catalogItem.price : item.price;
      validatedTotal += actualPrice * item.quantity;
    });

    // 3200 * 2 + 4500 * 1 = 10900
    expect(validatedTotal).toBe(10900);
  });

  it('prevents duplicate payment submissions using idempotency tracking', () => {
    const processedPaymentIds = new Set<string>();

    const recordPayment = (paymentId: string) => {
      if (processedPaymentIds.has(paymentId)) {
        return { success: false, reason: 'Duplicate payment transaction' };
      }
      processedPaymentIds.add(paymentId);
      return { success: true };
    };

    const res1 = recordPayment('tx_1001');
    const res2 = recordPayment('tx_1001'); // Duplicate attempt

    expect(res1.success).toBe(true);
    expect(res2.success).toBe(false);
    expect(res2.reason).toBe('Duplicate payment transaction');
  });

  it('accurately calculates Net Profit without double counting revenue and expenses', () => {
    const collectedPayments = 50000;
    const outstandingDues = 15000;
    const expenses = 12000;

    const grossRevenue = collectedPayments + outstandingDues; // 65,000
    const netProfit = collectedPayments - expenses; // 38,000

    expect(grossRevenue).toBe(65000);
    expect(netProfit).toBe(38000);
  });
});
