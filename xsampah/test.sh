# source .env
# OWNER="bipproduction";
# REPO="obake";
# RUN_ID="13517247379";
# curl -L \
#   -H "Accept: application/vnd.github+json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -H "X-GitHub-Api-Version: 2022-11-28" \
#   https://api.github.com/repos/$OWNER/$REPO/actions/runs/$RUN_ID/logs \
#   --output logs.zip

URL=https://wibu-5281e-default-rtdb.asia-southeast1.firebasedatabase.app/
curl -X PUT -d '{"name": "John", "age": 33}' https://wibu-5281e-default-rtdb.asia-southeast1.firebasedatabase.app/apa.json