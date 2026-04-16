import React from "react";
export function Compliance() {
  return (
    <div className="w-full py-10">
      {" "}
      <h4 className="text-center text-2xl font-bold mt-6">
        {" "}
        Our Compliance Standards{" "}
      </h4>{" "}
      <div className="w-full grid grid-cols-3 items-center justify-center">
        {" "}
        <div className="w-full flex justify-center">
          {" "}
          <img src="/hippa.png" alt="" className="w-56 h-56" />{" "}
        </div>{" "}
        <div className="w-full flex justify-center">
          {" "}
          <img src="/GDPR.png" alt="" className="w-56 h-56" />{" "}
        </div>{" "}
        <div className="w-full flex justify-center">
          {" "}
          <img src="/pci.png" alt="" className="w-56 h-56" />{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
