import { useDispatch, useSelector } from "react-redux";
import { signIn, signOut } from "@/stores/auth.slice";
import { RootState } from "@stores/store";
import { User } from "@stores/state.interface";

export function useSession() {
  const { session } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  return {
    session,
    signIn: (user: User) => dispatch(signIn(user)),
    signOut: () => dispatch(signOut()),
  };
}
