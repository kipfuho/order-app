import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { Tokens } from "../stores/state.interface";
import { RootState } from "../stores/store";
import { refreshTokensRequest } from "./api.service";
import { resetUser, updateUser } from "../stores/userSlice";

const isTokenExpired = (expires: number | undefined) => {
  if (!expires) return false;
  return Date.now() >= expires;
};

export const getAccessToken = async (): Promise<string> => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.shop.user);
  if (!user || !user.tokens) {
    return "";
  }

  if (isTokenExpired(_.get(user, "tokens.access.expires"))) {
    const newTokens: Tokens = await refreshTokensRequest(
      user.tokens.refresh.token
    );
    if (!newTokens) {
      dispatch(resetUser());
      return "";
    }
    dispatch(updateUser({ tokens: newTokens }));
    return newTokens.access.token;
  }
  return user.tokens.access.token;
};
