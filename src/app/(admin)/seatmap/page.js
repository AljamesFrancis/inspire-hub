"use client";

import React from "react";
import SeatMap from "../components/SeatMap";
import withUserRole from '../withUserRole';

function WelcomePage({ role }) {

  if (role === "admin") {
    return (
      <div>
        <SeatMap />
      </div>
    );
  }

}

export default withUserRole(WelcomePage, ["admin"]);