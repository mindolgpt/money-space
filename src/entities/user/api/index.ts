import { createAuthApi } from '@/shared/api/auth'

export function createUserApi() {
  return {
    remote: createAuthApi(),
  }
}
