#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function generateHTMLReport(report) {
  const passRate = ((report.summary.totalPassed / report.summary.totalScenarios) * 100).toFixed(1);
  const timestamp = new Date(report.timestamp).toLocaleString();
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BDD Test Report - ${timestamp}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        .stat-card .value {
            font-size: 3em;
            font-weight: bold;
            margin: 10px 0;
        }
        .stat-card .label {
            color: #6c757d;
            text-transform: uppercase;
            font-size: 0.85em;
            letter-spacing: 1px;
        }
        .stat-card.success .value { color: #28a745; }
        .stat-card.danger .value { color: #dc3545; }
        .stat-card.info .value { color: #17a2b8; }
        .stat-card.warning .value { color: #ffc107; }
        .progress-bar {
            width: 100%;
            height: 30px;
            background: #e9ecef;
            border-radius: 15px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        .services { padding: 40px; }
        .service-card {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            margin-bottom: 30px;
            overflow: hidden;
        }
        .service-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .service-header h2 {
            font-size: 1.8em;
            text-transform: capitalize;
        }
        .service-stats {
            display: flex;
            gap: 20px;
        }
        .service-stat {
            text-align: center;
        }
        .service-stat .value {
            font-size: 1.5em;
            font-weight: bold;
        }
        .service-stat .label {
            font-size: 0.8em;
            opacity: 0.9;
        }
        .tests-table {
            width: 100%;
            border-collapse: collapse;
        }
        .tests-table thead {
            background: #f8f9fa;
        }
        .tests-table th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #495057;
            border-bottom: 2px solid #dee2e6;
        }
        .tests-table td {
            padding: 15px;
            border-bottom: 1px solid #dee2e6;
        }
        .tests-table tr:hover {
            background: #f8f9fa;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-badge.passed {
            background: #d4edda;
            color: #155724;
        }
        .status-badge.failed {
            background: #f8d7da;
            color: #721c24;
        }
        .duration {
            color: #6c757d;
            font-size: 0.9em;
        }
        .error-message {
            color: #dc3545;
            font-size: 0.9em;
            font-style: italic;
            margin-top: 5px;
        }
        .footer {
            background: #343a40;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 BDD Test Execution Report</h1>
            <div class="timestamp">📅 ${timestamp}</div>
        </div>
        
        <div class="summary">
            <div class="stat-card info">
                <div class="label">Total Scenarios</div>
                <div class="value">${report.summary.totalScenarios}</div>
            </div>
            <div class="stat-card success">
                <div class="label">Passed</div>
                <div class="value">${report.summary.totalPassed}</div>
            </div>
            <div class="stat-card danger">
                <div class="label">Failed</div>
                <div class="value">${report.summary.totalFailed}</div>
            </div>
            <div class="stat-card warning">
                <div class="label">Duration</div>
                <div class="value">${(report.summary.totalDuration / 1000).toFixed(1)}s</div>
            </div>
        </div>
        
        <div style="padding: 0 40px;">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${passRate}%">
                    ${passRate}% Pass Rate
                </div>
            </div>
        </div>
        
        <div class="services">
            ${report.serviceResults.map(service => `
                <div class="service-card">
                    <div class="service-header">
                        <h2>${service.service} API</h2>
                        <div class="service-stats">
                            <div class="service-stat">
                                <div class="value">${service.scenarios}</div>
                                <div class="label">Scenarios</div>
                            </div>
                            <div class="service-stat">
                                <div class="value">${service.passed}</div>
                                <div class="label">Passed</div>
                            </div>
                            <div class="service-stat">
                                <div class="value">${service.failed}</div>
                                <div class="label">Failed</div>
                            </div>
                            <div class="service-stat">
                                <div class="value">${(service.duration / 1000).toFixed(1)}s</div>
                                <div class="label">Duration</div>
                            </div>
                        </div>
                    </div>
                    <table class="tests-table">
                        <thead>
                            <tr>
                                <th style="width: 50%">Test Scenario</th>
                                <th style="width: 20%; text-align: center;">Status</th>
                                <th style="width: 15%; text-align: right;">Duration</th>
                                <th style="width: 15%; text-align: center;">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${service.report.tests.map((test, index) => `
                                <tr>
                                    <td>
                                        <strong>${index + 1}.</strong> ${test.name}
                                        ${test.error ? `<div class="error-message">❌ ${test.error}</div>` : ''}
                                    </td>
                                    <td style="text-align: center;">
                                        <span class="status-badge ${test.status}">${test.status === 'passed' ? '✓' : '✗'} ${test.status}</span>
                                    </td>
                                    <td style="text-align: right;">
                                        <span class="duration">${test.duration}ms</span>
                                    </td>
                                    <td style="text-align: center;">
                                        ${test.status === 'passed' ? '✅' : '⚠️'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Generated by Serverless BDD Test Framework</p>
            <p><a href="https://github.com/krimohshu/serveless_test_architecure" target="_blank">GitHub Repository</a></p>
        </div>
    </div>
</body>
</html>`;
}

// Main execution
const reportPath = process.argv[2] || './latest-report.json';

if (!fs.existsSync(reportPath)) {
  console.error(`❌ Report file not found: ${reportPath}`);
  console.log('\n💡 Usage: node scripts/generate-html-report.js [path-to-json-report]');
  console.log('   Example: node scripts/generate-html-report.js ./latest-report.json\n');
  process.exit(1);
}

try {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  const html = generateHTMLReport(report);
  
  const outputPath = reportPath.replace('.json', '.html');
  fs.writeFileSync(outputPath, html);
  
  console.log(`\n✅ HTML report generated successfully!`);
  console.log(`📄 Report file: ${outputPath}`);
  console.log(`📊 Summary: ${report.summary.totalPassed}/${report.summary.totalScenarios} tests passed (${((report.summary.totalPassed / report.summary.totalScenarios) * 100).toFixed(1)}%)`);
  console.log(`\n🌐 To view the report, run: open ${outputPath}\n`);
} catch (error) {
  console.error(`❌ Error generating report: ${error.message}`);
  process.exit(1);
}
