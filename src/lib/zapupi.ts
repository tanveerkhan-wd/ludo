
const ZAPUPI_API_URL = 'https://pay.zapupi.com/api';
const ZAPUPI_KEY = process.env.ZAPUPI_KEY;

export interface ZapUPICreateOrderResponse {
  status: 'success' | 'error';
  message: string;
  order_id: string;
  payment_url: string;
  environment?: string;
}

export interface ZapUPIOrderStatusResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    order_id: string;
    status: 'Pending' | 'Success' | 'Failed';
    amount: number;
    pay_amount: number;
    create_at: string;
    txn_id: string;
    utr: string;
    customer_mobile: string;
  };
}

export const zapupiService = {
  /**
   * Creates a new order on ZapUPI
   */
  async createOrder(params: {
    order_id: string;
    amount: number;
    customer_mobile?: string;
    remark?: string;
    success_url?: string;
    failed_url?: string;
    timeout_url?: string;
    redirect_url?: string;
    webhook_url?: string;
  }, apiKey?: string) {
    const key = apiKey || ZAPUPI_KEY;
    if (!key) {
      throw new Error('ZapUPI API Key is not configured');
    }

    const payload = {
      zap_key: key,
      ...params,
      amount: params.amount.toString(),
    };

    // Ensure redirect_url is set if not provided (fallback to success_url)
    if (!payload.redirect_url && params.success_url) {
      payload.redirect_url = params.success_url;
    }

    const response = await fetch(`${ZAPUPI_API_URL}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json() as ZapUPICreateOrderResponse;
    return data;
  },

  /**
   * Checks the status of an order
   */
  async checkOrderStatus(order_id: string, apiKey?: string) {
    const key = apiKey || ZAPUPI_KEY;
    if (!key) {
      throw new Error('ZapUPI API Key is not configured');
    }

    const response = await fetch(`${ZAPUPI_API_URL}/order-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zap_key: key,
        order_id,
      }),
    });

    const data = await response.json() as ZapUPIOrderStatusResponse;
    return data;
  }
};
