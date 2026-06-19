export type { AuthUser } from '@/entities/user'

export type LoginFormData = {
  email: string
  password: string
}

export type RegisterFormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export type FormErrors = {
  email?: string
  password?: string
  name?: string
  confirmPassword?: string
  general?: string
}
