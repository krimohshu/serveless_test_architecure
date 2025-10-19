# Team Access Guide - HTML Test Reports on S3

## Overview
All test execution reports are automatically generated as beautiful HTML reports and uploaded to AWS S3. Your entire team can access these reports without any local tooling or AWS credentials.

## ✅ Latest Test Report

**Public URL:** https://serverless-test-reports-dev.s3.eu-west-2.amazonaws.com/test-reports/2025-10-19/consolidated-report-1760880344548.html

Simply click the link above or copy it into your browser to view the latest test results!

## 📊 How It Works

### Automatic Report Generation
1. **Test Execution**: When the test orchestrator runs, it:
   - Executes all 3 test suites in parallel (User, Product, Order)
   - Aggregates results from all tests
   - Generates both JSON and HTML reports

2. **S3 Upload**: Reports are automatically uploaded to S3:
   - **Bucket**: `serverless-test-reports-dev`
   - **JSON Path**: `test-reports/YYYY-MM-DD/consolidated-report-TIMESTAMP.json`
   - **HTML Path**: `test-reports/YYYY-MM-DD/consolidated-report-TIMESTAMP.html`

3. **Public Access**: HTML reports are publicly accessible (read-only)
   - No AWS credentials needed
   - No downloads required
   - Works in any web browser

### Report Location Pattern
```
https://serverless-test-reports-dev.s3.eu-west-2.amazonaws.com/test-reports/[DATE]/consolidated-report-[TIMESTAMP].html
```

**Example:**
```
https://serverless-test-reports-dev.s3.eu-west-2.amazonaws.com/test-reports/2025-10-19/consolidated-report-1760880344548.html
```

## 🔍 Finding Reports

### Option 1: From Test Execution Response
When running tests via the orchestrator API, the response includes the public URL:

```bash
npm run test:orchestrator
```

Look for the `htmlPublicUrl` in the response:
```json
{
  "reports": {
    "json": "s3://...",
    "html": "s3://...",
    "htmlPublicUrl": "https://serverless-test-reports-dev.s3.eu-west-2.amazonaws.com/..."
  }
}
```

### Option 2: Browse S3 Bucket (with AWS credentials)
If you have AWS access:

```bash
# List all HTML reports
aws s3 ls s3://serverless-test-reports-dev/test-reports/ --recursive --profile evident | grep .html

# Get the latest report
aws s3 ls s3://serverless-test-reports-dev/test-reports/ --recursive --profile evident | grep .html | tail -1
```

### Option 3: Build the URL Manually
If you know the date and timestamp:
```
https://serverless-test-reports-dev.s3.eu-west-2.amazonaws.com/test-reports/[YYYY-MM-DD]/consolidated-report-[TIMESTAMP].html
```

## 📥 Sharing Reports

### Share with Team Members
1. Run the tests or trigger the orchestrator
2. Copy the `htmlPublicUrl` from the response
3. Share the URL via Slack, email, or your project management tool
4. Team members can view immediately in their browser

### Embed in Documentation
You can link to reports in your README, wiki, or documentation:

```markdown
[Latest Test Report](https://serverless-test-reports-dev.s3.eu-west-2.amazonaws.com/test-reports/2025-10-19/consolidated-report-1760880344548.html)
```

### Use in CI/CD
In your CI/CD pipeline, you can:
1. Trigger the orchestrator
2. Extract the `htmlPublicUrl`
3. Post it as a comment on PRs
4. Send notifications with the URL

## 🎨 Report Features

The HTML reports include:
- **Beautiful Design**: Modern gradient UI with responsive layout
- **Summary Dashboard**: Overall test statistics at a glance
- **Service Breakdown**: Detailed results for each API (User, Product, Order)
- **Test Details**: Individual test names, status, and execution time
- **Visual Indicators**: 
  - ✅ Green for passed tests
  - ❌ Red for failed tests
  - Color-coded status badges
- **Timestamps**: When the tests were executed
- **Performance Metrics**: Execution duration for each test

## 🔒 Security

### Public Access (HTML Only)
- ✅ HTML reports are publicly readable
- ❌ JSON reports remain private (S3 credentials required)
- ❌ No write/delete permissions for anyone
- ✅ Only GET access to `*.html` files

### S3 Bucket Policy
The bucket policy allows public read access only for HTML files:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadHTMLReports",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::serverless-test-reports-dev/test-reports/*/*.html"
    }
  ]
}
```

## 🚀 Running Tests

### Trigger Test Execution
```bash
# Run all tests via orchestrator
npm run test:orchestrator

# Or invoke the API directly
curl -X GET https://0uteg1cl4b.execute-api.eu-west-2.amazonaws.com/dev/test/orchestrate
```

### Response Contains URLs
```json
{
  "success": true,
  "data": {
    "message": "Test orchestration completed",
    "report": { ... },
    "reports": {
      "json": "s3://serverless-test-reports-dev/test-reports/2025-10-19/consolidated-report-1760880344548.json",
      "html": "s3://serverless-test-reports-dev/test-reports/2025-10-19/consolidated-report-1760880344548.html",
      "htmlPublicUrl": "https://serverless-test-reports-dev.s3.eu-west-2.amazonaws.com/test-reports/2025-10-19/consolidated-report-1760880344548.html"
    }
  }
}
```

## 📝 Current Test Status

**Last Test Run:** 2025-10-19

### Summary
- **Total Services:** 3
- **Total Scenarios:** 36
- **Passed:** 29 (80.6%)
- **Failed:** 7 (19.4%)
- **Duration:** ~2.2 seconds

### Service Breakdown
| Service | Scenarios | Passed | Failed | Pass Rate |
|---------|-----------|--------|--------|-----------|
| User    | 8         | 8      | 0      | 100%      |
| Product | 11        | 11     | 0      | 100%      |
| Order   | 17        | 10     | 7      | 58.8%     |

### Known Issues
Order API has 7 failing tests due to 404 errors. This requires investigation of:
- Order endpoint routing
- User/Product dependency management
- Database state between tests

## 🔧 Troubleshooting

### Report Not Loading?
1. **Check URL**: Ensure the URL is complete and correctly copied
2. **Check Date**: Reports are organized by date (YYYY-MM-DD)
3. **Check Timestamp**: Each report has a unique timestamp
4. **Verify Bucket Policy**: Ensure public read access is enabled for HTML files

### How to List All Reports (with AWS access)?
```bash
# All reports sorted by date
aws s3 ls s3://serverless-test-reports-dev/test-reports/ --recursive --profile evident

# Just today's reports
aws s3 ls s3://serverless-test-reports-dev/test-reports/$(date +%Y-%m-%d)/ --profile evident
```

### How to Download a Report?
```bash
# Download specific report
aws s3 cp s3://serverless-test-reports-dev/test-reports/2025-10-19/consolidated-report-1760880344548.html ./report.html --profile evident

# Or just open the public URL in your browser (no download needed!)
```

## 📧 Support

If you have questions or need help accessing reports:
1. Check this guide first
2. Verify the URL is correct
3. Ensure you're using the latest URL from the orchestrator response
4. Contact the team lead if you encounter access issues

## 🎯 Next Steps

1. **Bookmark the Report URL Pattern** for easy access
2. **Set up Notifications** to receive report URLs automatically
3. **Integrate with CI/CD** to post reports on PRs
4. **Fix Order API Issues** to achieve 100% pass rate

---

**Happy Testing! 🎉**
