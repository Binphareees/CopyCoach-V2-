import common from "./common.json";
import landing from "./landing.json";
import auth from "./auth.json";
import dashboard from "./dashboard.json";
import profile from "./profile.json";
import legal from "./legal.json";

const ha = {
  common,
  landing,
  auth,
  dashboard,
  profile,
  legal,
} as const;

export default ha;
