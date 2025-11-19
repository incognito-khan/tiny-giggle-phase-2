import bcrypt from "bcryptjs";

export const hashing = async (value: string) => {
  return await bcrypt.hash(value, 10);
};

export const compareHashing = async (value: string, hashedValue: string) => {
  return await bcrypt.compare(value, hashedValue);
};
