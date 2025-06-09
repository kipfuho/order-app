interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
  clientId: string;
}

interface LogoutRequest {
  refreshToken?: string;
}

interface LoginForCustomerRequest {
  phone: string;
  password: string;
  clientId: string;
}

interface RegisterForCustomerRequest {
  id: string;
  name: string;
  phone: string;
  password: string;
  clientId: string;
}

export {
  RegisterRequest,
  LoginRequest,
  LogoutRequest,
  LoginForCustomerRequest,
  RegisterForCustomerRequest,
};
