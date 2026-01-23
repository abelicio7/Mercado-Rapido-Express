/**
 * WhatsApp helpers
 *
 * - wa.me expects digits only (no +)
 * - For Mozambique, we ensure prefix 258
 */

export const formatMozWhatsAppNumber = (phone?: string | null): string => {
  if (!phone) return "";

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");
  if (!cleaned) return "";

  // Ensure Mozambique country code
  if (!cleaned.startsWith("258")) cleaned = `258${cleaned}`;
  return cleaned;
};

export const buildWhatsAppUrl = (phone?: string | null, message?: string): string | null => {
  const formatted = formatMozWhatsAppNumber(phone);
  if (!formatted) return null;

  if (!message) return `https://wa.me/${formatted}`;
  const text = encodeURIComponent(message);
  return `https://wa.me/${formatted}?text=${text}`;
};

/**
 * Opens an external URL in a new tab when possible.
 * On some mobile browsers, popups may be blocked; fallback to same-tab navigation.
 */
export const openExternalUrl = (url: string) => {
  const win = window.open("about:blank", "_blank");
  if (win) {
    win.location.href = url;
    return;
  }

  window.location.assign(url);
};
