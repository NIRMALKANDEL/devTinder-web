export const BASE_URL = "/api";

// Backend default for "about"; treated as "no bio yet" in the UI
export const DEFAULT_ABOUT = "This is the default about section of the user.";

// Make a user-entered link openable even if it was typed without http(s)://
export const toHref = (url) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

// Operator and support details shown on the Contact page and in the policies
export const CONTACT = {
  name: "Nirmal Kandel",
  email: "nirmalkandel001@gmail.com",
  phone: "+91 83496 92155",
  phoneHref: "tel:+918349692155",
  address: "X-19, JMD Elite Apartment, New Rani Bagh, Indore, Madhya Pradesh 452001, India",
  hours: "Monday to Friday, 10:00 AM to 6:00 PM IST",
};
