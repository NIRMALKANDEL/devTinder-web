import { createContext, useContext } from "react";

// Added: in-app calls. CallProvider (Components/CallProvider.jsx) holds the state;
// any component can start a call or read its status with useCall().
export const CallContext = createContext(null);
export const useCall = () => useContext(CallContext);
