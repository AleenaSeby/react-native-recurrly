export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    if ("longMessage" in error && typeof error.longMessage === "string") {
      return error.longMessage;
    }
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }

  return "Something went wrong. Please try again.";
}
