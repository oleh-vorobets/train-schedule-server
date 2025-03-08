export type Tokens = {
  accessToken: string;
  refresh: RefreshTokenCookie;
};

export type RefreshTokenCookie = {
  refreshToken: string;
  id: string;
};

export type AccessToken = {
  accessToken: string;
};
