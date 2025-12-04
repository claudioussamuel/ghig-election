// Simple PIN-based authentication using localStorage
// This stores the PIN and voting status in the browser

const PIN_STORAGE_KEY = 'voting_pin';
const VOTED_STORAGE_KEY = 'has_voted';

export interface PinAuthState {
    pin: string | null;
    hasVoted: boolean;
}

// Validate PIN format (6 digits)
export const isValidPin = (pin: string): boolean => {
    return /^\d{6}$/.test(pin);
};

// Set the user's PIN (simulates login)
export const setPinAuth = (pin: string): void => {
    if (!isValidPin(pin)) {
        throw new Error('PIN must be exactly 6 digits');
    }
    localStorage.setItem(PIN_STORAGE_KEY, pin);
};

// Get the current PIN
export const getCurrentPin = (): string | null => {
    return localStorage.getItem(PIN_STORAGE_KEY);
};

// Check if user is authenticated (has a PIN set)
export const isAuthenticated = (): boolean => {
    return getCurrentPin() !== null;
};

// Check if the user has voted
export const hasVoted = (): boolean => {
    const pin = getCurrentPin();
    if (!pin) return false;

    const votedPins = getVotedPins();
    return votedPins.includes(pin);
};

// Mark the current user as having voted
export const markAsVoted = (): void => {
    const pin = getCurrentPin();
    if (!pin) {
        throw new Error('No PIN set');
    }

    const votedPins = getVotedPins();
    if (!votedPins.includes(pin)) {
        votedPins.push(pin);
        localStorage.setItem(VOTED_STORAGE_KEY, JSON.stringify(votedPins));
    }
};

// Get list of PINs that have voted (stored in localStorage)
const getVotedPins = (): string[] => {
    const stored = localStorage.getItem(VOTED_STORAGE_KEY);
    if (!stored) return [];

    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
};

// Clear authentication (logout)
export const clearPinAuth = (): void => {
    localStorage.removeItem(PIN_STORAGE_KEY);
};

// Get authentication state
export const getAuthState = (): PinAuthState => {
    return {
        pin: getCurrentPin(),
        hasVoted: hasVoted(),
    };
};
