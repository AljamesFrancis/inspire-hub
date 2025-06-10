"use client";

import React from "react";
import Settings from "../components/Settings";
import withUserRole from '../withUserRole';

function WelcomePage({ role }) {

  if (role === "admin") {
    return (
      <div>
        <Settings />
      </div>
    );
  }

}

export default withUserRole(WelcomePage, ["admin"]);