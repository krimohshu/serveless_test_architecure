# 📊 How to View HTML Test Reports

## Quick Start (3 Steps)

### 1️⃣ Run the Tests

```bash
npm run test:orchestrator
```

This will:
- Invoke all test Lambda functions in parallel
- Save results to `test-results.json`
- Display summary in terminal

### 2️⃣ Generate HTML Report

```bash
npm run test:report
```

This will:
- Convert JSON results to beautiful HTML
- Generate `latest-report.html` file
- Automatically open in your default browser

### 3️⃣ View the Report

The HTML report will open automatically! If not:

```bash
open latest-report.html
```

---

## Alternative Methods

### Method 1: One-Line Command

```bash
npm run test:orchestrator && npm run test:report
```

### Method 2: From S3 Archived Reports

```bash
# Download latest report from S3
aws s3 cp s3://serverless-test-reports-dev/test-reports/2025-10-19/consolidated-report-1760877515009.json ./latest-report.json --profile evident --region eu-west-2

# Generate HTML
node scripts/generate-html-report.js ./latest-report.json

# Open in browser
open ./latest-report.html
```

### Method 3: Direct Lambda Invocation

```bash
# Invoke orchestrator directly
aws lambda invoke \
  --function-name serverless-rest-apis-tests-dev-testOrchestrator \
  --profile evident \
  --region eu-west-2 \
  test-results.json

# Generate HTML from results
node scripts/generate-html-report.js ./test-results.json

# Open report
open ./test-results.html
```

---

## What You'll See in the HTML Report

### 📊 Summary Dashboard
- **Total Scenarios**: 36 tests
- **Passed**: 29 tests (green card)
- **Failed**: 7 tests (red card)
- **Duration**: 2.2 seconds (yellow card)
- **Pass Rate**: Visual progress bar showing 80.6%

### 🔍 Detailed Results by Service

#### User API (100% Pass)
✅ 8/8 tests passing
- Create, read, update, delete operations
- Error handling validation
- ~1.6s execution time

#### Product API (100% Pass)
✅ 11/11 tests passing
- CRUD operations
- Stock management
- Partial updates
- ~1.7s execution time

#### Order API (58% Pass)
⚠️ 10/17 tests passing
- Some tests failing due to 404 errors
- Needs endpoint configuration fixes
- ~2.2s execution time

### 🎨 Report Features

- **Interactive**: Hover over cards for visual feedback
- **Color-Coded**: Green for pass, red for fail
- **Detailed Errors**: Failed tests show error messages
- **Responsive**: Works on desktop and mobile
- **Print-Ready**: Can be printed or saved as PDF

---

## NPM Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run test:orchestrator` | Run all BDD tests via orchestrator |
| `npm run test:report` | Generate HTML report from `latest-report.json` |
| `npm run test:download-report` | Download today's reports from S3 |

---

## File Locations

### JSON Reports
- **Local**: `./test-results.json`, `./latest-report.json`
- **S3**: `s3://serverless-test-reports-dev/test-reports/YYYY-MM-DD/`

### HTML Reports
- **Local**: `./test-results.html`, `./latest-report.html`
- **Generated**: Same directory as source JSON file

---

## Troubleshooting

### "Report file not found"

**Problem**: 
```
❌ Report file not found: ./latest-report.json
```

**Solution**:
```bash
# Run tests first to generate the JSON file
npm run test:orchestrator

# OR use custom path
node scripts/generate-html-report.js ./custom-path/report.json
```

### "HTML doesn't open automatically"

**Problem**: Browser doesn't launch

**Solutions**:
```bash
# macOS
open ./latest-report.html

# Windows
start ./latest-report.html

# Linux
xdg-open ./latest-report.html

# Or simply drag and drop the HTML file into your browser
```

### "JSON file is empty or corrupt"

**Problem**: Report generation fails

**Solution**:
```bash
# Check if JSON file exists and is valid
cat latest-report.json | jq .

# If invalid, re-run tests
npm run test:orchestrator
```

---

## Advanced Usage

### Generate Report from Custom Path

```bash
node scripts/generate-html-report.js /path/to/custom-report.json
```

### Batch Process Multiple Reports

```bash
# Download all reports from a specific date
aws s3 cp s3://serverless-test-reports-dev/test-reports/2025-10-19/ ./reports/ --recursive --profile evident

# Generate HTML for each
for file in ./reports/*.json; do
  node scripts/generate-html-report.js "$file"
done

# Open all HTML reports
open ./reports/*.html
```

### Share Reports

```bash
# Email the HTML file (it's self-contained)
# Upload to internal server
# Share via Slack/Teams
# Archive for compliance

# The HTML file contains everything - no external dependencies!
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Run BDD Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Tests
        run: npm run test:orchestrator
        
      - name: Generate HTML Report
        run: node scripts/generate-html-report.js ./test-results.json
        
      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: test-report-${{ github.run_number }}
          path: ./test-results.html
```

---

## Example Output

```bash
$ npm run test:report

> serverless-typescript-apis@1.0.0 test:report
> node scripts/generate-html-report.js ./latest-report.json && open ./latest-report.html

✅ HTML report generated successfully!
📄 Report file: ./latest-report.html
📊 Summary: 29/36 tests passed (80.6%)

🌐 To view the report, run: open ./latest-report.html

# Browser opens automatically with beautiful HTML report! 🎉
```

---

## Need Help?

- 📖 **Documentation**: See `scripts/README.md`
- 🐛 **Issues**: Check `TEST_RESULTS.md` for known issues
- 💬 **Support**: Open issue on GitHub
- 📧 **Contact**: Create PR with improvements

---

**Happy Testing! 🧪✨**
