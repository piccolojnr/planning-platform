// not-found.tsx with tailwindcss and shadcn components
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/ui/seo";
import { CircleX } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
      <Seo title="404: Not found" />
      <div className="container flex flex-col items-center justify-center h-full space-y-4">
        <CircleX size={100} style={{ marginTop: 0 }} />
        <h1 className="text-4xl font-bold text-center" style={{ marginTop: 0 }}>
          404: Not found
        </h1>
        <p className="text-lg text-center text-gray-700">
          You just hit a route that doesn&#39;t exist... the sadness.
        </p>
        <Link to="/">
          <Button>Go back home</Button>
        </Link>
      </div>
    </div>
  );
}
