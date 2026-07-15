export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/jobs/:path*", "/applicants/:path*", "/dashboard/:path*"],
};
