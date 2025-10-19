import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { createSuccessResponse, createErrorResponse } from '../../src/utils/response';

// HTML Report Generation Function
function generateHTMLReport(report: ConsolidatedReport): string {
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
        .download-badge {
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            display: inline-block;
            margin-top: 10px;
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
                            ${service.report.tests.map((test: any, index: number) => `
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
            <p style="margin-top: 10px; font-size: 0.9em;">
                Report stored in S3: ${report.reportUrl || 'N/A'}
            </p>
        </div>
    </div>
</body>
</html>`;
}

interface TestResult {
  service: string;
  status: 'success' | 'failed' | 'error';
  duration: number;
  scenarios: number;
  passed: number;
  failed: number;
  report?: any;
  error?: string;
}

interface ConsolidatedReport {
  timestamp: string;
  summary: {
    totalServices: number;
    totalScenarios: number;
    totalPassed: number;
    totalFailed: number;
    totalDuration: number;
    overallStatus: 'success' | 'failed';
  };
  serviceResults: TestResult[];
  reportUrl?: string;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const lambdaClient = new LambdaClient({ region: 'eu-west-2' });
  const s3Client = new S3Client({ region: 'eu-west-2' });
  
  const testFunctions = [
    process.env.USER_TEST_FUNCTION || 'serverless-rest-apis-tests-dev-userTestRunner',
    process.env.PRODUCT_TEST_FUNCTION || 'serverless-rest-apis-tests-dev-productTestRunner', 
    process.env.ORDER_TEST_FUNCTION || 'serverless-rest-apis-tests-dev-orderTestRunner'
  ];

  try {
    console.log('🚀 Starting Test Orchestrator');
    console.log(`Testing ${testFunctions.length} services in parallel`);
    
    const startTime = Date.now();
    
    // Execute all test functions in parallel
    const testPromises = testFunctions.map(async (functionName) => {
      const serviceName = functionName.split('-').pop()?.replace('TestRunner', '') || 'unknown';
      
      try {
        console.log(`🧪 Invoking test for ${serviceName} service`);
        
        const invokeCommand = new InvokeCommand({
          FunctionName: functionName,
          InvocationType: 'RequestResponse',
          Payload: JSON.stringify({
            baseUrl: process.env.API_BASE_URL || 'https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev'
          })
        });
        
        const testStartTime = Date.now();
        const response = await lambdaClient.send(invokeCommand);
        const testDuration = Date.now() - testStartTime;
        
        if (response.Payload) {
          const result = JSON.parse(Buffer.from(response.Payload).toString());
          
          // Parse the body which contains the actual test results
          const bodyData = result.body ? JSON.parse(result.body) : null;
          const testData = bodyData?.data || bodyData || {};
          
          return {
            service: serviceName,
            status: result.statusCode === 200 ? 'success' : 'failed',
            duration: testDuration,
            scenarios: testData.scenarios || 0,
            passed: testData.passed || 0,
            failed: testData.failed || 0,
            report: testData.report || null
          } as TestResult;
        }
        
        return {
          service: serviceName,
          status: 'error',
          duration: testDuration,
          scenarios: 0,
          passed: 0,
          failed: 0,
          error: 'Empty response from test function'
        } as TestResult;
        
      } catch (error) {
        console.error(`❌ Error testing ${serviceName}:`, error);
        return {
          service: serviceName,
          status: 'error',
          duration: 0,
          scenarios: 0,
          passed: 0,
          failed: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        } as TestResult;
      }
    });
    
    // Wait for all tests to complete
    const testResults = await Promise.all(testPromises);
    const totalDuration = Date.now() - startTime;
    
    // Aggregate results
    const consolidatedReport: ConsolidatedReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalServices: testResults.length,
        totalScenarios: testResults.reduce((sum, result) => sum + result.scenarios, 0),
        totalPassed: testResults.reduce((sum, result) => sum + result.passed, 0),
        totalFailed: testResults.reduce((sum, result) => sum + result.failed, 0),
        totalDuration,
        overallStatus: testResults.every(result => result.status === 'success') ? 'success' : 'failed'
      },
      serviceResults: testResults
    };
    
    // Store consolidated report in S3 (both JSON and HTML)
    let jsonReportUrl = '';
    let htmlReportUrl = '';
    
    try {
      const bucketName = process.env.REPORTS_BUCKET || 'serverless-test-reports';
      const timestamp = Date.now();
      const datePrefix = new Date().toISOString().split('T')[0];
      const baseKey = `test-reports/${datePrefix}/consolidated-report-${timestamp}`;
      
      // Upload JSON report
      const jsonKey = `${baseKey}.json`;
      const putJsonCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: jsonKey,
        Body: JSON.stringify(consolidatedReport, null, 2),
        ContentType: 'application/json'
      });
      await s3Client.send(putJsonCommand);
      jsonReportUrl = `s3://${bucketName}/${jsonKey}`;
      console.log(`📊 JSON report stored: ${jsonReportUrl}`);
      
      // Generate and upload HTML report
      const htmlKey = `${baseKey}.html`;
      const htmlContent = generateHTMLReport({
        ...consolidatedReport,
        reportUrl: jsonReportUrl
      });
      
      const putHtmlCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: htmlKey,
        Body: htmlContent,
        ContentType: 'text/html'
      });
      await s3Client.send(putHtmlCommand);
      htmlReportUrl = `s3://${bucketName}/${htmlKey}`;
      console.log(`� HTML report stored: ${htmlReportUrl}`);
      
      // Update consolidated report with URLs
      consolidatedReport.reportUrl = jsonReportUrl;
      (consolidatedReport as any).htmlReportUrl = htmlReportUrl;
      
    } catch (s3Error) {
      console.warn('⚠️ Could not store report in S3:', s3Error);
    }
    
    // Log summary
    console.log('📊 Test Execution Summary:');
    console.log(`   Services Tested: ${consolidatedReport.summary.totalServices}`);
    console.log(`   Total Scenarios: ${consolidatedReport.summary.totalScenarios}`);
    console.log(`   Passed: ${consolidatedReport.summary.totalPassed}`);
    console.log(`   Failed: ${consolidatedReport.summary.totalFailed}`);
    console.log(`   Duration: ${consolidatedReport.summary.totalDuration}ms`);
    console.log(`   Overall Status: ${consolidatedReport.summary.overallStatus.toUpperCase()}`);
    
    testResults.forEach(result => {
      const statusEmoji = result.status === 'success' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
      console.log(`   ${statusEmoji} ${result.service}: ${result.passed}/${result.scenarios} scenarios passed (${result.duration}ms)`);
    });
    
    return createSuccessResponse({
      message: 'Test orchestration completed',
      report: consolidatedReport,
      reports: {
        json: jsonReportUrl,
        html: htmlReportUrl,
        htmlPublicUrl: htmlReportUrl ? `https://${process.env.REPORTS_BUCKET || 'serverless-test-reports'}.s3.${process.env.AWS_REGION || 'eu-west-2'}.amazonaws.com/${htmlReportUrl.split(`${process.env.REPORTS_BUCKET || 'serverless-test-reports'}/`)[1]}` : ''
      }
    });
    
  } catch (error) {
    console.error('❌ Test Orchestrator failed:', error);
    return createErrorResponse(500, 'Test orchestration failed', error);
  }
};