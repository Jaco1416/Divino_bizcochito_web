"use client";
import { useAlertContext } from "@/context/AlertContext";

export default function Alert() {
  const { alert } = useAlertContext();
  if (!alert) return null;

  const color =
    alert.type === "success"
      ? "bg-green-500"
      : alert.type === "error"
      ? "bg-red-500"
      : alert.type === "warning"
      ? "bg-yellow-500"
      : "bg-blue-500";

  return (
    <div
      className={`${color} text-white px-4 py-2 rounded-md fixed top-5 right-5 shadow-lg transition-all z-50`}
    >
      {alert.message}
    </div>
  );
}
