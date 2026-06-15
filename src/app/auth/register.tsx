import { RegisterForm } from "../../features/auth/ui/RegisterForm";
import { router } from "expo-router";

export default function RegisterScreen() {
  return (
    <RegisterForm onSwitch={() => router.replace("/auth/login")} />
  );
}
