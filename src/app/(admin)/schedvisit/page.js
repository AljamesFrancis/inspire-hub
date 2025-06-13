"use client";

import React from "react";
import SchedVisit from "../components/SchedVisit";
import withUserRole from '../withUserRole';

function WelcomePage({ role }) {

  if (role === "admin") {
    return (
      <div>
        <SchedVisit />
      </div>
    );
  }


}

export default withUserRole(WelcomePage, ["admin"]);