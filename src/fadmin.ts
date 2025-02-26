import admin from "firebase-admin";

function fAdmin(params: { credential: any; databaseURL: string }) {
  const { credential, databaseURL } = params;
  admin.initializeApp({
    credential: admin.credential.cert(credential),
    databaseURL,
  });

  return admin;
}

export { fAdmin };
