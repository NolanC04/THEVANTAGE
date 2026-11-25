// Pure privacy rules, testable.
/** Notification emails never carry the request's reason or any personal detail. */
export const notificationEmail = (link: string) => ({
  subject: "You have a new message on AAPEX",
  text: `You have a new message on AAPEX.\n\n${link}\n\nUnofficial program resource. Not an activity of the U.S. Air Force or DoD; no federal endorsement implied.`,
});

export const CRISIS = "Military Crisis Line: dial 988 then press 1, or text 838255.";
