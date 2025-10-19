# HTML Test Report Generator

This utility generates beautiful, interactive HTML reports from the JSON test results produced by the BDD Test Orchestrator.

## Features

✨ **Beautiful UI** - Modern, gradient design with responsive layout  
📊 **Visual Statistics** - Color-coded metrics cards and progress bars  
🎯 **Detailed Results** - Individual test results with error messages  
📱 **Responsive Design** - Works on desktop and mobile  
🖨️ **Print-Friendly** - Optimized for printing and PDF export  

## Usage

### Option 1: Using npm script (Recommended)

```bash
# Generate and open HTML report from latest-report.json
npm run test:report
```

### Option 2: Manual generation

```bash
# Generate HTML report from any JSON file
node scripts/generate-html-report.js ./path/to/report.json

# Open the generated HTML file
open ./path/to/report.html
```

### Option 3: Complete workflow

```bash
# Step 1: Run the test orchestrator
npm run test:orchestrator

# Step 2: Generate HTML report from results
node scripts/generate-html-report.js ./test-results.json

# Step 3: Open in browser
open ./test-results.html
```

## Download Reports from S3

To download the JSON reports from S3 and generate HTML:

```bash
# Download all reports from today
npm run test:download-report

# Or manually download specific report
aws s3 cp s3://serverless-test-reports-dev/test-reports/2025-10-19/consolidated-report-xxx.json ./latest-report.json --profile evident --region eu-west-2

# Generate HTML
npm run test:report
```

## Report Contents

The HTML report includes:

### Summary Section
- Total test scenarios count
- Passed tests count (green)
- Failed tests count (red)
- Total execution duration
- Pass rate progress bar

### Service-Specific Sections
For each API service (User, Product, Order):
- Service-level statistics
- Detailed test results table
- Test name and description
- Pass/Fail status with icons
- Execution duration
- Error messages (for failed tests)

## Report Location

- **JSON Reports**: Stored in S3 bucket `serverless-test-reports-dev`
- **HTML Reports**: Generated locally in the same directory as source JSON
- **S3 Path**: `s3://serverless-test-reports-dev/test-reports/YYYY-MM-DD/consolidated-report-*.json`

## Example

```bash
# Complete example
$ npm run test:orchestrator
✅ Test orchestration completed
📄 Results: test-results.json

$ npm run test:report
✅ HTML report generated successfully!
📄 Report file: ./latest-report.html
📊 Summary: 29/36 tests passed (80.6%)
🌐 Opening report in browser...
```

## Customization

To customize the HTML report design, edit `scripts/generate-html-report.js`:

- **Colors**: Modify the CSS variables in the `<style>` section
- **Layout**: Adjust grid and flexbox properties
- **Content**: Modify the template literals in the `generateHTMLReport()` function

## Troubleshooting

### Report file not found
```bash
Error: Report file not found: ./latest-report.json
```
**Solution**: Make sure you've run the test orchestrator first and the JSON file exists.

### No recent reports in S3
```bash
Error: No objects found in S3 bucket
```
**Solution**: Run the test orchestrator to generate new reports:
```bash
npm run test:orchestrator
```

### Browser doesn't open automatically
**Solution**: Manually open the HTML file:
```bash
open ./latest-report.html
# or on Windows
start ./latest-report.html
# or on Linux
xdg-open ./latest-report.html
```

## Screenshots

The generated HTML report features:

1. **Header**: Purple gradient header with test execution timestamp
2. **Summary Cards**: Four metric cards showing total, passed, failed, and duration
3. **Progress Bar**: Visual representation of pass rate percentage
4. **Service Cards**: Color-coded cards for each API service
5. **Test Tables**: Detailed tables with test scenarios and results
6. **Footer**: Links to documentation and GitHub repository

## Integration with CI/CD

You can integrate this into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm run test:orchestrator

- name: Generate HTML Report
  run: node scripts/generate-html-report.js ./test-results.json

- name: Upload Report Artifact
  uses: actions/upload-artifact@v3
  with:
    name: test-report
    path: ./test-results.html
```

## License

MIT - See LICENSE file in the project root
