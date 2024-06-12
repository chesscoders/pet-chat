import Cookies from "js-cookie";
import { COOKIE_NAME, COOKIE_EXPIRATION_DAYS } from "@/constants/cookie";

const savePetDetails = (petDetails) => {
  const start = petDetails.indexOf("Specie");
  const end = petDetails.indexOf("Poți");
  const extractedPetDetails = petDetails.substring(start, end).trim();
  Cookies.set(COOKIE_NAME, extractedPetDetails, {
    expires: COOKIE_EXPIRATION_DAYS,
  });
};

export default savePetDetails;
