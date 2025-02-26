interface DataPenting {
  firebase: Firebase;
  envApp: string;
  githubToken: string;
  ssh: Ssh;
}
interface Ssh {
  user: string;
  host: string;
  key: string;
}
interface Firebase {
  accountKey: AccountKey;
  databaseURL: string;
}
interface AccountKey {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}
