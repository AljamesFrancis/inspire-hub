"use client";

import React from "react";
import Tenants from "../components/Tenants";
import withUserRole from '../withUserRole';

function WelcomePage({ role }) {
 
  if (role === "admin") {
    return (
      <div>
        <Tenants />
      </div>
    );
  }
}

export default withUserRole(WelcomePage, ["admin"]);