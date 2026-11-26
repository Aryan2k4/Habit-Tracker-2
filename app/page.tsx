import Bloom from "./ui/Bloom";
import { getChatGPTUser, chatGPTSignInPath } from "./chatgpt-auth";
export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await getChatGPTUser();
  return <Bloom signedIn={!!user} signInUrl={chatGPTSignInPath("/")} />;
}
