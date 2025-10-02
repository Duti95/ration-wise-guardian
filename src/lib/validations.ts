import { z } from "zod";

// Auth validations
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
});

export const signupSchema = loginSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// Vendor validations
export const vendorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vendor name is required")
    .max(100, "Vendor name must be less than 100 characters"),
  contact_person: z
    .string()
    .trim()
    .max(100, "Contact person name must be less than 100 characters")
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .max(500, "Address must be less than 500 characters")
    .optional(),
});

// Item validations
export const itemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Item name is required")
    .max(100, "Item name must be less than 100 characters"),
  unit: z
    .string()
    .trim()
    .min(1, "Unit is required")
    .max(20, "Unit must be less than 20 characters"),
  current_stock: z
    .number()
    .min(0, "Stock cannot be negative")
    .max(999999.99, "Stock value too large"),
  rate_per_unit: z
    .number()
    .min(0, "Rate cannot be negative")
    .max(999999.99, "Rate value too large"),
  medium_threshold: z
    .number()
    .min(0, "Threshold cannot be negative")
    .max(999999.99, "Threshold value too large"),
  danger_threshold: z
    .number()
    .min(0, "Threshold cannot be negative")
    .max(999999.99, "Threshold value too large"),
});

// Purchase validations
export const purchaseItemSchema = z.object({
  item_id: z.string().uuid("Invalid item ID"),
  quantity: z
    .number()
    .positive("Quantity must be positive")
    .max(999999.99, "Quantity too large"),
  mrp: z
    .number()
    .positive("MRP must be positive")
    .max(999999.99, "MRP too large")
    .optional(),
  discount_value: z
    .number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%"),
  rate_per_unit: z
    .number()
    .positive("Rate must be positive")
    .max(999999.99, "Rate too large"),
  damaged_quantity: z
    .number()
    .min(0, "Damaged quantity cannot be negative")
    .max(999999.99, "Damaged quantity too large"),
});

export const purchaseSchema = z.object({
  bill_no: z
    .string()
    .trim()
    .min(1, "Bill number is required")
    .max(50, "Bill number must be less than 50 characters"),
  vendor_id: z.string().uuid("Invalid vendor ID"),
  purchase_date: z.string().min(1, "Purchase date is required"),
  items: z
    .array(purchaseItemSchema)
    .min(1, "At least one item is required")
    .max(100, "Cannot add more than 100 items"),
});

// Stock Issue validations
export const stockIssueItemSchema = z.object({
  item_id: z.string().uuid("Invalid item ID"),
  quantity: z
    .number()
    .positive("Quantity must be positive")
    .max(999999.99, "Quantity too large"),
  rate_per_unit: z
    .number()
    .positive("Rate must be positive")
    .max(999999.99, "Rate too large"),
});

export const stockIssueSchema = z.object({
  issue_date: z.string().min(1, "Issue date is required"),
  issue_type: z.enum(["Master", "Handloan"], {
    errorMap: () => ({ message: "Issue type must be Master or Handloan" }),
  }),
  items: z
    .array(stockIssueItemSchema)
    .min(1, "At least one item is required")
    .max(100, "Cannot add more than 100 items"),
});

// Report filter validations
export const reportFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  itemId: z.string().optional(),
  vendorId: z.string().optional(),
  minAmount: z
    .number()
    .min(0, "Amount cannot be negative")
    .max(9999999.99, "Amount too large")
    .optional(),
  maxAmount: z
    .number()
    .min(0, "Amount cannot be negative")
    .max(9999999.99, "Amount too large")
    .optional(),
});

// Transaction metadata validations
export const transactionMetadataSchema = z.object({
  principal_signature: z
    .string()
    .trim()
    .max(100, "Signature must be less than 100 characters")
    .optional(),
  dep_warden_signature: z
    .string()
    .trim()
    .max(100, "Signature must be less than 100 characters")
    .optional(),
  remarks: z
    .string()
    .trim()
    .max(500, "Remarks must be less than 500 characters")
    .optional(),
  custom_balance_quantity: z
    .number()
    .min(0, "Balance quantity cannot be negative")
    .max(999999.99, "Balance quantity too large")
    .optional(),
  custom_balance_amount: z
    .number()
    .min(0, "Balance amount cannot be negative")
    .max(9999999.99, "Balance amount too large")
    .optional(),
});
