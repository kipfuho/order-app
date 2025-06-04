import { useDispatch, useSelector } from "react-redux";
import {
  signInForCustomer,
  signOutForCustomer,
} from "@/stores/auth.customer.slice";
import { RootState } from "@stores/store";
import { Customer } from "@stores/state.interface";

export function useCustomerSession() {
  const { session } = useSelector((state: RootState) => state.authCustomer);
  const dispatch = useDispatch();

  return {
    session,
    signInForCustomer: (customer: Customer) =>
      dispatch(signInForCustomer(customer)),
    signOutForCustomer: () => dispatch(signOutForCustomer()),
  };
}
