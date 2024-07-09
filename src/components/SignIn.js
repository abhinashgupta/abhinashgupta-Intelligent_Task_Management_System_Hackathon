import React from "react";
import { SignIn } from "@clerk/clerk-react";

function SignInPage() {
  console.log("SignInPage component rendered");
  return (
    <div>
      <SignIn />
    </div>
  );
}

export default SignInPage;
