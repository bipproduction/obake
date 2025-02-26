import admin from "firebase-admin";

function fAdmin(params: { key: string }) {
  const { key } = params;
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(key)),
    databaseURL:
      "https://wibu-5281e-default-rtdb.asia-southeast1.firebasedatabase.app",
  });

  return admin;
}

export { fAdmin };
