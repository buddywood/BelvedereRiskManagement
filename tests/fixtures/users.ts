export type Role = "advisor" | "client" | "admin";

export interface TestUser {
  role: Role;
  email: string;
  password: string;
  expectedLandingPath: string;
}

const env = (key: string, fallback: string) => process.env[key]?.trim() || fallback;

export const USERS: Record<Role, TestUser> = {
  advisor: {
    role: "advisor",
    email: env("ADVISOR_EMAIL", "advisor@test.com"),
    password: env("ADVISOR_PASSWORD", "testpassword123"),
    expectedLandingPath: "/advisor",
  },
  client: {
    role: "client",
    email: env("CLIENT_EMAIL", "client@test.com"),
    password: env("CLIENT_PASSWORD", "testpassword123"),
    expectedLandingPath: "/dashboard",
  },
  admin: {
    role: "admin",
    email: env("ADMIN_EMAIL", "buddy@ebilly.com"),
    password: env("ADMIN_PASSWORD", "Test1111!"),
    expectedLandingPath: "/admin",
  },
};
