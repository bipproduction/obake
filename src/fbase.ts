import admin from "firebase-admin";

function fAdmin(params: { key: string; databaseUrl: string }) {
  const { key, databaseUrl } = params;
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(key)),
    databaseURL: databaseUrl,
  });

  return admin;
}

export { fAdmin };
