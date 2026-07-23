export const portalConfig = {
  testMode:
    process.env.PORTAL_TEST_MODE === "true",

  testVerificationCode:
    process.env.PORTAL_TEST_VERIFICATION_CODE ?? "",

  routes: {
    home: "/portal",
    login: "/portal/login",
    register: "/portal/registrieren",
    dashboard: "/portal/app",
    application: "/mitmachen/antrag",
  },
} as const;

export function isValidTestVerificationCode(
  value: string,
): boolean {
  if (!portalConfig.testMode) {
    return false;
  }

  return (
    portalConfig.testVerificationCode.length > 0 &&
    value === portalConfig.testVerificationCode
  );
}