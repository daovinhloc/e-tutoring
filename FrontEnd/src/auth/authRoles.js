export const authRoles = {
  SA: ["SA"], // Only Admin has access
  Tutor: ["SA","TUTOR"], // Only SA & Admin & Editor has access
  Student: ["SA", "STUDENT"],
  Guest: ["SA", "ADMIN", "GUEST","TUTOR","STUDENT"] // Everyone has access
};
