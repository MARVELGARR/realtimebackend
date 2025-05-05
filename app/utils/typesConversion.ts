import { DisappearingMessages, Gender, LastSeen, Precense } from "@prisma/client";

export const Genda = (gender: string): Gender => {
  switch (gender.toUpperCase()) {
    case "MALE":
      return Gender.MALE;
    case "FEMALE":
      return Gender.FEMALE;
    case "OTHERS":
      return Gender.OTHERS;
    default:
      return Gender.OTHERS; // fallback
  }
};

export const PRS = (precense: string): Precense => {
  switch (precense.toUpperCase()) {
    case "EVERYONE":
      return Precense.EVERYONE;
    case "NOBODY":
      return Precense.NOBODY;
    default:
      return Precense.EVERYONE; // fallback
  }
};

export const DSM = (disappearingMessages: string): DisappearingMessages => {
  switch (disappearingMessages.toUpperCase()) {
    case "DAYS7":
      return DisappearingMessages.DAYS7;
    case "DAYS90":
      return DisappearingMessages.DAYS90;
    case "H24":
      return DisappearingMessages.H24;
    case "OFF":
      return DisappearingMessages.OFF;
    default:
      return DisappearingMessages.OFF; // fallback
  }
};

export const LS = (lastSeen: string): LastSeen => {
  switch (lastSeen.toUpperCase()) {
    case "EVERYONE":
      return LastSeen.EVERYONE;
    case "MYCONTACTS":
      return LastSeen.MYCONTACTS;
    case "NOBODY":
      return LastSeen.NOBODY;
    default:
      return LastSeen.EVERYONE; // fallback
  }
};
