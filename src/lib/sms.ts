import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

/**
 * Reusable SMS utility to send messages via Twilio
 * @param to - The recipient phone number (with country code)
 * @param body - The message content
 */
export async function sendSMS(to: string, body: string) {
  try {
    // If we are in development and credentials are missing, log to console instead
    if (process.env.NODE_ENV === 'development' && (!accountSid || !authToken || !fromPhone)) {
      console.log(`[SMS MOCK] To: ${to} | Body: ${body}`);
      return { success: true, mock: true };
    }

    const message = await client.messages.create({
      body,
      from: fromPhone,
      to: to.startsWith('+') ? to : `+91${to}`, // Default to India if no country code
    });

    console.log(`[SMS SENT] SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('[SMS ERROR]', error);
    throw new Error('Failed to send SMS');
  }
}

/**
 * Specifically for sending OTPs
 */
export async function sendOTP(phone: string, otp: string) {
  const body = `Your Bajiger Ludo OTP is ${otp}. Valid for 5 minutes. Do not share this with anyone.`;
  return sendSMS(phone, body);
}
