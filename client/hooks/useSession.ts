import { useDispatch, useSelector } from "react-redux";
import {
  signIn,
  signInForCustomer,
  signOut,
  signOutForCustomer,
} from "@stores/authSlice";
import { RootState } from "@stores/store";
import { Customer, User } from "@stores/state.interface";

export function useSession() {
  const { session, customerSession } = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch();

  return {
    session,
    customerSession,
    signIn: (user: User) => dispatch(signIn(user)),
    signInForCustomer: (customer: Customer) =>
      dispatch(signInForCustomer(customer)),
    signOut: () => dispatch(signOut()),
    signOutForCustomer: () => dispatch(signOutForCustomer()),
  };
}
