/**
 * Validates if the given string is a correctly formatted email address.
 * @param email - The email string to validate
 * @returns boolean true if valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validates if the given string is a valid phone number.
 * Must only contain digits and be between 10 to 15 characters long.
 * @param phone - The phone string to validate
 * @returns boolean true if valid, false otherwise
 */
export const validatePhone = (phone: string): boolean => {
    return /^\d+$/.test(phone) && phone.length >= 10 && phone.length <= 15;
};
