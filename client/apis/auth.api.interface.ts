interface LoginRequest {
  email: string;
  password: string;
}

interface LoginForCustomerRequest {
  phone: string;
  password: string;
}

interface RegisterForCustomerRequest {
  id: string;
  name: string;
  phone: string;
  password: string;
}

export { LoginRequest, LoginForCustomerRequest, RegisterForCustomerRequest };
