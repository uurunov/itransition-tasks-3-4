const email = `uniqueindextest@example.com`;
const body = JSON.stringify({ name: "User", email, password: "U" });

const url = "http://uurunov.somee.com/api/Auth/register";

const makeRequest = (label) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  }).then(async (res) => ({
    label,
    status: res.status,
    body: await res.text(),
  }));

const [resA, resB] = await Promise.all([
  makeRequest("User1"),
  makeRequest("User2"),
]);

console.log(`User1: ${resA.status})`);
console.log(resA.body);
console.log(`User2: ${resB.status}`);
console.log(resB.body);
