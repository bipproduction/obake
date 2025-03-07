import axios from "axios";

// Konfigurasi
const GITHUB_TOKEN = process.env.TOKEN;
const REPO_OWNER = "bipproduction";
const REPO_NAME = "obake";

// Header untuk autentikasi
const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
};

// Fungsi untuk menghapus semua workflow runs
async function deleteAllWorkflowRuns(page = 1) {
  try {
    // Ambil semua workflow runs (dengan pagination)
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?page=${page}&per_page=100`;
    const response = await axios.get(url, { headers });
    const runs = response.data.workflow_runs;

    // Hentikan jika tidak ada workflow runs
    if (runs.length === 0) {
      console.log("No more workflow runs to delete.");
      return;
    }

    // Hapus setiap workflow run
    for (const run of runs) {
      const runId = run.id;
      const deleteUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${runId}`;
      const deleteResponse = await axios.delete(deleteUrl, { headers });

      if (deleteResponse.status === 204) {
        console.log(`Deleted run ID: ${runId}`);
      } else {
        console.log(`Failed to delete run ID: ${runId}`);
      }
    }

    // Lanjutkan ke halaman berikutnya
    console.log(`Moving to the next page: ${page + 1}`);
    await deleteAllWorkflowRuns(page + 1);
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

// Jalankan fungsi
deleteAllWorkflowRuns();