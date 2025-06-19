import { redirect } from "next/navigation";

export default function PatientRootPage() {
  redirect("/patient/dashboard");
}
