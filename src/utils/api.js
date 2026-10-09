import axios from "axios";
import { BASE_URL } from "./constants";
import { addConnections } from "./connectionSlice";
import { addRequests } from "./requestSlice";

// Backend sends errors as plain text ("ERROR ..."), { message } or { error }.
// Mongoose errors look like "User validation failed: firstName: First name must be...".
export const getErrorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  if (!err?.response) {
    return "Can't reach the server. Check your connection and try again.";
  }
  const data = err.response.data;
  let message =
    typeof data === "string" ? data : data?.message || data?.error || "";
  message = String(message)
    .replace(/^(ERROR:=|ERROR|Error:?)\s*/i, "")
    .replace(/^\w+ validation failed:\s*/i, "")
    .replace(/(^|,\s*)\w+:\s/g, "$1")
    .trim();
  return message || fallback;
};

// Connections and requests are shared by their pages and the feed's side tiles.
// Rows whose user was deleted come back as null, so they are dropped here.
export const fetchConnections = async (dispatch) => {
  const res = await axios.get(`${BASE_URL}/user/connections`, {
    withCredentials: true,
  });
  const data = (res?.data?.data || []).filter((c) => c && c._id);
  dispatch(addConnections(data));
  return data;
};

export const fetchRequests = async (dispatch) => {
  const res = await axios.get(`${BASE_URL}/user/requests/received`, {
    withCredentials: true,
  });
  const data = (res?.data?.data || []).filter((r) => r && r.fromUserId);
  dispatch(addRequests(data));
  return data;
};
