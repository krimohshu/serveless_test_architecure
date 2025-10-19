# 🌐 Team Access to Test Reports

## Quick Access Guide for Team Members

### 📄 Accessing HTML Test Reports

After each test run, HTML reports are automatically generated and made publicly accessible on S3.

### How to Get the Latest Report URL

**Option 1: From Test Execution Response**

When the test orchestrator runs, it returns a response containing the public URL:

```json
{
  "data": {
    "reports": {
      "htmlPublicUrl": "https://serverless-test-reports-dev.s3.eu-west-2.amazonaws.com/test-reports/2025-10-19/consolidated-report-TIMESTAMP.html"
    }
  }
}
```

**Option 2: Check Slack/Email/Teams**

The developer who ran the tests should share the `htmlPublicUrl` link.

**Option 3: List Reports in S3**

If you have AWS CLI access:

```bash
# List all HTML reports
aws s3 ls s3://serverless-test-reports-dev/test-reports/ --recursive --profile evident --region eu-west-2 | grep '.html'

# Get the latest HTML report URL
LATEST_REPORT=$(aws s3 ls s3://serverless-test-reports-dev/test-reports/ --recursive --profile evident --region eu-west-2 | grep '.html' | sort | tail -1 | awk '{print $4}')
echo "https://serverless-test-reports-dev.s3.eu-west-2.amazonaws.com/${LATEST_REPORT}"
```

### 📊 What You'll See in the Report

The HTML report includes:

- **Summary Dashboard** with:
  - Total scenarios, passed, failed
  - Pass rate percentage
  - Total duration
  - Visual progress bar

- **Service Breakdown** showing:
  - User API tests (8 scenarios)
  - Product API tests (11 scenarios)
  - Order API tests (17 scenarios)

- **Detailed Test Tables** with:
  - Test scenario names
  - Pass/fail status with color coding
  - Execution duration for each test
  - Error messages for failed tests

### 🔗 Report URL Format

All reports follow this pattern:

```
https://serverless-test-reports-dev.s3.eu-west-2.amazonaws.com/test-reports/YYYY-MM-DD/consolidated-report-TIMESTAMP.html
```

Example:
```
https://serverless-test-reports-dev.s3.eu-west-2.amazonaws.com/test-reports/2025-10-19/consolidated-report-1760879484293.html
```

### 📅 Report Organization

Reports are organized by date:
- `test-reports/2025-10-19/` - Reports from October 19, 2025
- `test-reports/2025-10-20/` - Reports from October 20, 2025
- etc.

Each report includes a timestamp in milliseconds for uniqueness.

### 🔒 Access Permissions

- ✅ **HTML reports (.html)**: Publicly accessible - no AWS credentials needed
- 🔐 **JSON reports (.json)**: Private - requires AWS credentials to access

### 💡 Tips for Team Members

1. **Bookmark the S3 bucket URL** for easy access to the reports folder:
   ```
   https://s3.console.aws.amazon.com/s3/buckets/serverless-test-reports-dev?region=eu-west-2&prefix=test-reports/
   ```

2. **Use the latest report** from the current date's folder for most recent results

3. **Compare reports** by opening multiple browser tabs to track improvements over time

4. **Download for offline viewing**: Right-click the report page and select "Save As"

5. **Share the direct URL** - anyone with the link can view it (no login required)

### 🚨 Troubleshooting

**Problem**: Can't access the HTML report URL

**Solutions**:
1. Verify the URL is complete and correctly formatted
2. Try opening in an incognito/private browser window
3. Check with the DevOps team if the S3 bucket policy changed
4. Contact the person who ran the tests for the correct URL

**Problem**: Report shows old data

**Solution**: Make sure you're using the latest timestamp in the URL. Check the date folder for the most recent report.

### 📞 Support

If you have issues accessing reports:
1. Check this guide first
2. Ask in the #testing or #devops Slack channel
3. Contact the DevOps team

---

## For Developers: Generating New Reports

To generate a new test report with public URL:

```bash
# Run the test orchestrator
npm run test:orchestrator

# Extract the public URL from response.json
cat response.json | jq -r '.body' | jq -r '.data.reports.htmlPublicUrl'

# Share this URL with your team!
```

Or invoke directly via AWS Lambda:

```bash
aws lambda invoke \
  --function-name serverless-rest-apis-tests-dev-testOrchestrator \
  --profile evident \
  --region eu-west-2 \
  --payload '{}' \
  --cli-binary-format raw-in-base64-out \
  response.json

# Get the public URL
cat response.json | jq -r '.body' | jq -r '.data.reports.htmlPublicUrl'
```

### Automating Report Distribution

You can add the public URL to:
- Slack notifications
- Email alerts
- CI/CD pipeline outputs
- GitHub Actions summaries
- JIRA tickets

Example Slack message:
```
🧪 Test Report Available
✅ 29/36 tests passed (80.6%)
📊 View Report: https://serverless-test-reports-dev.s3.eu-west-2.amazonaws.com/test-reports/2025-10-19/consolidated-report-1760879484293.html
```

---

## S3 Bucket Configuration

**Bucket Name**: `serverless-test-reports-dev`  
**Region**: `eu-west-2` (London)  
**Public Access**: HTML files only (`.html` extension)  
**Lifecycle**: Reports retained for 30 days  
**Versioning**: Enabled

### Security Note

Only HTML reports are publicly accessible. JSON reports containing raw test data remain private and require AWS credentials to access. This ensures sensitive test data is protected while making visual reports easily shareable.
