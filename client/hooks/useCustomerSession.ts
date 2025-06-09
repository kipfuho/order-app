import { useSelector } from "react-redux";
import { RootState } from "@stores/store";

export function useCustomerSession() {
  const { session, clientId } = useSelector(
    (state: RootState) => state.authCustomer,
  );

  return {
    session,
    clientId,
  };
}
