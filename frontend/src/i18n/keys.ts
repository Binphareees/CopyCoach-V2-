import common from "./dictionaries/en/common.json";
import landing from "./dictionaries/en/landing.json";
import auth from "./dictionaries/en/auth.json";
import dashboard from "./dictionaries/en/dashboard.json";
import profile from "./dictionaries/en/profile.json";
import legal from "./dictionaries/en/legal.json";

type KeyPath<K extends string, P extends string> = P extends "" ? K : `${P}.${K}`;

type FlatKeys<T, P extends string = ""> = {
  [K in Extract<keyof T, string>]: T[K] extends string
    ? KeyPath<K, P>
    : T[K] extends object
      ? FlatKeys<T[K], KeyPath<K, P>>
      : KeyPath<K, P>;
}[Extract<keyof T, string>];

export type CommonKey = FlatKeys<typeof common>;
export type LandingKey = FlatKeys<typeof landing>;
export type AuthKey = FlatKeys<typeof auth>;
export type DashboardKey = FlatKeys<typeof dashboard>;
export type ProfileKey = FlatKeys<typeof profile>;
export type LegalKey = FlatKeys<typeof legal>;