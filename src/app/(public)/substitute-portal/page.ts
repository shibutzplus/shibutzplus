import router from "@/routes";
import { redirect } from "next/navigation";
export default function Page() {
  redirect(router.substitutePortal.p);
}