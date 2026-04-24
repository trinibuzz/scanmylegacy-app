import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const user = cookieStore.get("user");

  if (!user) {
    redirect("/login");
  }

  const userData = JSON.parse(user.value);

  return (
    <main className="p-10 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {userData.name}
      </h1>

      <p>Your memorials will appear here.</p>
    </main>
  );
}