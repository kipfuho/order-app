import { useSelector } from "react-redux";
import { RootState } from "@stores/store";

export function useSession() {
  const { session, clientId } = useSelector((state: RootState) => state.auth);

  return {
    session,
    clientId,
  };
}
