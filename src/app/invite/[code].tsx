import { useLocalSearchParams } from "expo-router";
import { AcceptInvite } from "../../features/family-invite";

export default function InviteScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  return <AcceptInvite code={code} />;
}
