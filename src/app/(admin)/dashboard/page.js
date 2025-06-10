"use client";

import React from "react";
import Dashboard from "../components/Dashboard";
import withUserRole from '../withUserRole';

function WelcomePage({ role }) {


  // Example: Only admins can view Dashboard
  if (role === "admin") {
    return (
      <div>
        <Dashboard />
      </div>
    );
  }

}

export default withUserRole(WelcomePage);