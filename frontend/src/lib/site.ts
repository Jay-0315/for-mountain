export const BASE_URL = "https://mountain-info.com";

export function withTrailingSlash(path = ""): string {
  if (!path || path === "/") return `${BASE_URL}/`;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${normalizedPath.replace(/\/?$/, "/")}`;
}

export const DEFAULT_OG_IMAGE = `${BASE_URL}/mountain-logo.png`;

export const GOOGLE_SITE_VERIFICATION = "google0088ddcc385ab3de";

export const COMPANY_NAME_JA = "株式会社マウンテン";
export const COMPANY_NAME_EN = "株式会社MOUNTAIN";
export const COMPANY_POSTAL_CODE = "101-0032";
export const COMPANY_ADDRESS_REGION = "東京都";
export const COMPANY_ADDRESS_LOCALITY = "千代田区";
export const COMPANY_STREET_ADDRESS = "岩本町2-13-6 リアライズ岩本町ビル 5F";
export const COMPANY_PHONE = "03-5829-6357";
