import "i18next";

type AppResources = {
  common: typeof import("./dictionaries/en/common.json");
  landing: typeof import("./dictionaries/en/landing.json");
  auth: typeof import("./dictionaries/en/auth.json");
  dashboard: typeof import("./dictionaries/en/dashboard.json");
  profile: typeof import("./dictionaries/en/profile.json");
  legal: typeof import("./dictionaries/en/legal.json");
};

export type LocalizedKey = {
  [K in keyof AppResources]: keyof AppResources[K];
}[keyof AppResources];

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: AppResources;
  }
}