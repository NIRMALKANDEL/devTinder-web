import axios from "axios";
import React from "react";
import { BASE_URL } from "../utils /constants";
import { useEffect } from "react";

const Connections = () => {
  const fetchConnnections = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredintiels: true,
      });
      console.log(res);
    } catch (err) {
      console.log("error occoured while fecthing connections");
    }
  };
  useEffect(() => {
    fetchConnnections();
  }, []);

  return <div>Connections</div>;
};

export default Connections;
