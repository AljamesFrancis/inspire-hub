"use client";

import React from "react";
import MeetingroomReceiving from "../components/MeetingroomReceiving";
import withUserRole from '../withUserRole';

function WelcomePage({ role }) {
  if (role === "admin") {
    return (
      <div>
        <MeetingroomReceiving />
      </div>
    );
  }

}

export default withUserRole(WelcomePage, ["admin"]);