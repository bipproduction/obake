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

// Ambil semua workflow runs
async function deleteAllWorkflowRuns() {
  try {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs`;
    const response = await axios.get(url, { headers });
    const runs = response.data.workflow_runs;

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

    console.log("All workflow runs deleted.");
    await deleteAllWorkflowRuns();
  } catch (error) {
    console.log(error);
  }
}

// Jalankan fungsi
deleteAllWorkflowRuns();
