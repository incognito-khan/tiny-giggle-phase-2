"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkTokenExpiry } from "@/store/slices/authHelpers";

export default function CheckAuth() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkTokenExpiry());
  }, [dispatch]);

  return null;
}
