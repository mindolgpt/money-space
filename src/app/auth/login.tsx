import { LoginForm } from "../../features/auth/ui/LoginForm";
import { router } from "expo-router";

export default function LoginScreen() {
  return (
    <LoginForm onSwitch={() => router.replace("/auth/register")} />
  );
}
