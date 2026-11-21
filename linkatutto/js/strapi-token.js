/**
 * strapi-token.js
 */

function parseJwt(tokenStr) {
  try {
    if (!tokenStr || typeof tokenStr !== "string") return null;
    const parts = tokenStr.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function extractAndStoreStrapiToken(authData, clientId) {
  if (!authData) return null;
  const data = authData.data || authData;
  let strapiToken = null;

  // 1. data.user.attributes
  if (data.user && data.user.attributes) {
    strapiToken =
      data.user.attributes["strapi-token"] ||
      data.user.attributes["strapi_token"];
  }

  // 2. data.payload
  if (!strapiToken && data.payload && typeof data.payload === "object") {
    strapiToken =
      data.payload["strapi-token"] ||
      data.payload["strapi_token"] ||
      (data.payload.attributes &&
        (data.payload.attributes["strapi-token"] ||
          data.payload.attributes["strapi_token"]));
  }

  // 3. data.userInfo.attributes
  if (!strapiToken && data.userInfo && data.userInfo.attributes) {
    strapiToken =
      data.userInfo.attributes["strapi-token"] ||
      data.userInfo.attributes["strapi_token"];
  }

  // 4. Decodifica JWT
  if (!strapiToken) {
    const tokenStr =
      data.token?.access_token ||
      data.token?.id_token ||
      (typeof data.token === "string" ? data.token : null);
    if (tokenStr) {
      const decoded = parseJwt(tokenStr);
      if (decoded) {
        strapiToken =
          decoded["strapi-token"] ||
          decoded["strapi_token"] ||
          (decoded.attributes &&
            (decoded.attributes["strapi-token"] ||
              decoded.attributes["strapi_token"]));
      }
    }
  }

  // 5. Fallback legacy
  if (!strapiToken && data.strapiToken) {
    strapiToken =
      typeof data.strapiToken === "string"
        ? data.strapiToken
        : data.strapiToken.access_token;
  }

  if (strapiToken) {
    console.log("💾 [Linkatutto] Strapi token estratto con successo!");
    if (clientId) {
      localStorage.setItem(`${clientId}_strapi-token`, strapiToken);
    }
    localStorage.setItem("strapi-token", strapiToken);
  } else {
    console.warn("⚠️ [Linkatutto] Nessun token Strapi trovato.");
  }

  return strapiToken;
}
