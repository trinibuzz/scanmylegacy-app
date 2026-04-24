<button
  className="w-full bg-white text-black p-2 rounded"
  onClick={async () => {
    await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: "test@email.com",
        password: "123456",
      }),
    });
    alert("User created!");
  }}
>
  Register
</button>