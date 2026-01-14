"use client";

import React, { createContext, useContext, useRef, useCallback } from "react";

type ValidationCallback = () => boolean; // Returns true if valid, false if invalid

type ValidationContextType = {
    /**
     * Register a validation callback.
     * @returns A cleanup function to unregister.
     */
    registerValidator: (validator: ValidationCallback) => () => void;

    /**
     * Run all registered validators.
     * @returns true if ALL validators pass (return true), false otherwise.
     */
    validate: () => boolean;
};

const ValidationContext = createContext<ValidationContextType | null>(null);

export const ValidationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // using a ref to store validators to avoid re-renders when they change
    const validatorsRef = useRef<Set<ValidationCallback>>(new Set());
    const registerValidator = useCallback((validator: ValidationCallback) => {
        validatorsRef.current.add(validator);
        return () => {
            validatorsRef.current.delete(validator);
        };
    }, []);

    const validate = useCallback(() => {
        for (const validator of validatorsRef.current) {
            if (!validator()) {
                return false;
            }
        }
        return true;
    }, []);

    return (
        <ValidationContext.Provider value={{ registerValidator, validate }}>
            {children}
        </ValidationContext.Provider>
    );
};

export const useValidation = () => {
    const context = useContext(ValidationContext);
    if (!context) {
        throw new Error("useValidation must be used within a ValidationProvider");
    }
    return context;
};
