import { db } from "../../../lib/db";
import GuestAccess from "./GuestAccess";

export default async function MemorialPage({ params }: any) {
  const { token } = params;

  const [rows]: any = await db.execute(
    "SELECT * FROM memorials WHERE invite_token = ? LIMIT 1",
    [token]
  );

  const memorial = rows[0];

  if (!memorial) {
    return (
      <main className="min-h-screen bg-[#0b1320] p-10 text-white">
        Invalid memorial link.
      </main>
    );
  }

  return <GuestAccess memorial={memorial} token={token} />;
}