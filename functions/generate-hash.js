import { random } from "lodash";

const generateHash = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = random(0, characters.length - 1);
    result += characters.charAt(randomIndex);
  }

  return result;
};

export default generateHash;
