import admin from "firebase-admin";

function fAdmin(params: { credential: any; databaseUrl: string }) {
  const { credential, databaseUrl } = params;
  admin.initializeApp({
    credential,
    databaseURL: databaseUrl,
  });

  return admin;
}

export { fAdmin };
