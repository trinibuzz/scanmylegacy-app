export default function Register() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="w-full max-w-md rounded-lg bg-zinc-900 p-8">
        <h1 className="mb-4 text-2xl font-bold">Create Account</h1>
        <input className="mb-3 w-full rounded bg-zinc-800 p-2" placeholder="Name" />
        <input className="mb-3 w-full rounded bg-zinc-800 p-2" placeholder="Email" />
        <input className="mb-4 w-full rounded bg-zinc-800 p-2" placeholder="Password" type="password" />
        <button className="w-full rounded bg-white p-2 text-black">Register</button>
      </div>
    </main>
  );
}