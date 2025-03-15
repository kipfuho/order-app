import { useDispatch, useSelector } from "react-redux";
import { signIn, signOut } from "../stores/authSlice";
import { RootState } from "../stores/store";
import { User } from "../stores/state.interface";

export function useSession() {
  const session = useSelector((state: RootState) => state.auth.session);
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const dispatch = useDispatch();

  return {
    session,
    isLoading,
    signIn: (user: User) => dispatch(signIn(user)), // Replace with real token
    signOut: () => dispatch(signOut()),
  };
}
