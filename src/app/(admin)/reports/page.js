"use client";

import React from "react";
import Reports from "../components/Reports";
import withUserRole from '../withUserRole';

function WelcomePage({ role }) {

  if (role === "admin") {
    return (
      <div>
        <Reports />
      </div>
    );
  }

 
}

export default withUserRole(WelcomePage, ["admin"]);