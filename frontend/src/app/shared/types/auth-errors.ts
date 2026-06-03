export type AuthErrors = {
    global: string;
    email: string;
    password: string;
};

export const emptyAuthErrors = (): AuthErrors => ({
  global: '',
  email: '',
  password: ''
});