import { permanentRedirect } from "next/navigation";
import { southAmericaLandingPath } from "@/lib/paths";

export default function LegacySudamericaRedirect() {
  permanentRedirect(southAmericaLandingPath());
}
