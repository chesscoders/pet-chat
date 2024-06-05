import { COOKIE_NAME } from "@/constants/cookie";
import Cookies from "js-cookie";

const getPetDetails = () => {
  const petDetails = Cookies.get(COOKIE_NAME);

  return petDetails || "";
};

export default getPetDetails;
