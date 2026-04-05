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
export const COMPANY_FULL_ADDRESS = `〒${COMPANY_POSTAL_CODE} ${COMPANY_ADDRESS_REGION}${COMPANY_ADDRESS_LOCALITY}${COMPANY_STREET_ADDRESS}`;
export const COMPANY_MAP_SEARCH_QUERY = `${COMPANY_NAME_JA} ${COMPANY_FULL_ADDRESS}`;
export const COMPANY_PHONE = "03-5829-6357";
export const COMPANY_FAX = "03-5829-8032";
export const COMPANY_LATITUDE = "35.694721";
export const COMPANY_LONGITUDE = "139.777435";
export const COMPANY_GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_MAP_SEARCH_QUERY)}`;
export const COMPANY_GOOGLE_MAPS_EMBED_URL = `https://www.google.com/maps?ll=${COMPANY_LATITUDE},${COMPANY_LONGITUDE}&q=${COMPANY_LATITUDE},${COMPANY_LONGITUDE}&z=17&hl=ja&output=embed`;
