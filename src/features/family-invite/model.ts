import { create } from "zustand";
import { supabase } from "../../shared/api/supabase";

interface InviteState {
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
  sendInvite: (familyId: string) => Promise<void>;
  acceptInvite: (code: string, userId: string) => Promise<void>;
  isLoading: boolean;
}

export const useInviteStore = create<InviteState>((set) => ({
  inviteEmail: "",
  isLoading: false,
  setInviteEmail: (email) => set({ inviteEmail: email }),

  sendInvite: async (familyId) => {
    set({ isLoading: true });
    const { inviteEmail } = useInviteStore.getState();
    const { error } = await supabase.functions.invoke("send-invite", {
      body: { email: inviteEmail, familyId },
    });
    if (error) throw error;
    set({ isLoading: false, inviteEmail: "" });
  },

  acceptInvite: async (code, userId) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from("invites")
      .select("*")
      .eq("code", code)
      .single();
    if (error || !data) throw new Error("Invalid invite");

    await supabase.from("family_members").insert({
      family_id: data.family_id,
      user_id: userId,
      role: "member",
    });
    set({ isLoading: false });
  },
}));
