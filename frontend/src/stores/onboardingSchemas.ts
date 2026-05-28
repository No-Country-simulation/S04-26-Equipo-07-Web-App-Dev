import { z } from "zod"

export const personalInfoSchema = z.object({
  fullName: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre no debe contener caracteres especiales"),
  email: z.string().email("Ingresa un correo electrónico válido"),
  phone: z.string()
    .min(9, "El teléfono debe tener al menos 9 dígitos")
    .regex(/^\d+$/, "El teléfono solo debe contener números"),
  phoneCode: z.string().min(1, "Selecciona un código de país"),
  dateOfBirth: z.string()
    .min(1, "La fecha de nacimiento es requerida")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  city: z.string().min(2, "La ciudad es requerida"),
  state: z.string().min(2, "El estado es requerido"),
  zipCode: z.string()
    .min(5, "El código postal debe tener al menos 5 dígitos")
    .regex(/^\d+$/, "El código postal debe contener solo números"),
  country: z.string().min(2, "El país es requerido"),
})

export const contractSchema = z.object({
  accepted: z.literal(true, { message: "Debes aceptar el contrato" }),
  signature: z.string().min(2, "La firma es requerida"),
  signedAt: z.string().nullable().optional(),
})

export const paymentSchema = z.object({
  bankName: z.string().min(2, "El nombre del banco es requerido"),
  accountType: z.string().min(1, "Selecciona un tipo de cuenta"),
  accountNumber: z.string().min(10, "El número de cuenta debe tener al menos 10 dígitos"),
  routingNumber: z.string().min(3, "El código de rastreo es requerido"),
  currency: z.string().min(1, "Selecciona una moneda"),
})
