import Cookies from "js-cookie";
import { COOKIE_NAME, COOKIE_EXPIRATION_DAYS } from "@/constants/cookie";

const savePetDetails = (petDetails) => {
  Cookies.set(COOKIE_NAME, petDetails, { expires: COOKIE_EXPIRATION_DAYS });
};

export default savePetDetails;
