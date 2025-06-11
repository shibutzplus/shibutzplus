import { redirect } from "next/navigation";
import routePath from "../routes";

export default function Home() {
  // Server-side redirect to login page
  redirect(routePath.login.p);
}
