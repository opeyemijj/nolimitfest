import crypto from "node:crypto";
import QRCode from "qrcode";

const QR_SECRET =
  process.env.QR_SIGNING_SECRET ||
  "nolimitfest_qr_super_secure_token_secret_2026";

/**
 * Generate a cryptographic verification signature for a ticket code
 */
export function generateTicketSignature(ticketCode: string): string {
  return crypto
    .createHmac("sha256", QR_SECRET)
    .update(ticketCode)
    .digest("hex")
    .substring(0, 16);
}

/**
 * Verify a ticket code signature
 */
export function verifyTicketSignature(
  ticketCode: string,
  signature: string,
): boolean {
  const expected = generateTicketSignature(ticketCode);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

/**
 * Generates an official, camera-readable ISO/IEC 18004 standard QR code SVG.
 * Encodes direct absolute URL (e.g. https://nolimitfest.com/tickets/NLF-DUBAI-12345).
 */
export async function generateQrSvg(
  urlOrText: string,
  size: number = 260,
): Promise<string> {
  try {
    return await QRCode.toString(urlOrText, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      width: size,
      color: {
        dark: "#08090E",
        light: "#FFFFFF",
      },
    });
  } catch (err) {
    console.error("Error generating QR SVG with qrcode library:", err);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="#FFFFFF"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#000" font-size="12">QR Code</text></svg>`;
  }
}

/**
 * Generates a Data URL (image/png;base64) for embedding in transactional emails or downloads.
 */
export async function generateQrDataUrl(
  urlOrText: string,
  size: number = 300,
): Promise<string> {
  try {
    return await QRCode.toDataURL(urlOrText, {
      margin: 1,
      errorCorrectionLevel: "M",
      width: size,
      color: {
        dark: "#08090E",
        light: "#FFFFFF",
      },
    });
  } catch (err) {
    console.error("Error generating QR DataURL:", err);
    return "";
  }
}
