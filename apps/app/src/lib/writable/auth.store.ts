import { writable } from "svelte/store";
import type { User } from "firebase/auth";
import { auth } from "$lib/firebase";

export const user = writable<User | null>(null);
export const authLoading = writable<boolean>(true);

if (typeof window !== "undefined") {
  auth.onAuthStateChanged((u) => {
    user.set(u);
    authLoading.set(false);
  });
}
