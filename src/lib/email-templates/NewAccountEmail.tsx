import * as React from "react";

interface NewAccountEmailProps {
  name: string;
  email: string;
  password: string;
  role: "Artist" | "Supplier";
}

export default function NewAccountEmail({
  name,
  email,
  password,
  role,
}: NewAccountEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.6 }}>
      <h2>Welcome {name}!</h2>
      <p>
        Your {role} account has been successfully created on Tiny Giggle.
      </p>
      <p>Here are your login credentials:</p>
      <ul>
        <li><strong>Email:</strong> {email}</li>
        <li><strong>Password:</strong> {password}</li>
      </ul>
      <p>
        You can log in using the credentials above. For security reasons,
        please change your password after your first login.
      </p>
      <p>Best regards,<br />Tiny Giggle Team</p>
    </div>
  );
}
