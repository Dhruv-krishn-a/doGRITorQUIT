import { redirect } from "next/navigation";

export default async function StudyCatchAllRedirect({ 
  params 
}: { 
  params: Promise<{ path: string[] }> 
}) {
  const { path } = await params;
  const targetPath = path.join('/');
  redirect(`/dashboard/study/${targetPath}`);
}
