export function formatCurrency(amount: number, decimals = 2): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) return `£${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `£${(amount / 1_000).toFixed(0)}k`;
  return `£${amount.toFixed(0)}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function formatDate(d: string | Date): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(d: string | Date): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleString("en-GB");
}

export function getEmailError(email: string): string | null {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email";
  return null;
}

export function getPhoneError(phone: string): string | null {
  if (!phone.trim()) return "Phone is required";
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length < 7) return "Enter a valid phone number";
  return null;
}

export function getPostcodeError(postcode: string): string | null {
  if (!postcode.trim()) return "Postcode is required";
  // Loose UK postcode pattern
  if (!/^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i.test(postcode.trim())) {
    return "Enter a valid UK postcode";
  }
  return null;
}

export function relativeTime(d: string | Date): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  const diff = (Date.now() - dt.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dt);
}
