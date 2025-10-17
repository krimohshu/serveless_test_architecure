import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { createSuccessResponse, createErrorResponse } from '../../src/utils/response';

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
    'serverless-typescript-apis-dev-userTestRunner',
    'serverless-typescript-apis-dev-productTestRunner', 
    'serverless-typescript-apis-dev-orderTestRunner'
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
          
          return {
            service: serviceName,
            status: result.statusCode === 200 ? 'success' : 'failed',
            duration: testDuration,
            scenarios: result.body ? JSON.parse(result.body)?.scenarios || 0 : 0,
            passed: result.body ? JSON.parse(result.body)?.passed || 0 : 0,
            failed: result.body ? JSON.parse(result.body)?.failed || 0 : 0,
            report: result.body ? JSON.parse(result.body)?.report : null
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
    
    // Store consolidated report in S3 (if bucket exists)
    try {
      const reportKey = `test-reports/${new Date().toISOString().split('T')[0]}/consolidated-report-${Date.now()}.json`;
      
      const putCommand = new PutObjectCommand({
        Bucket: process.env.REPORTS_BUCKET || 'serverless-test-reports',
        Key: reportKey,
        Body: JSON.stringify(consolidatedReport, null, 2),
        ContentType: 'application/json'
      });
      
      await s3Client.send(putCommand);
      consolidatedReport.reportUrl = `s3://${process.env.REPORTS_BUCKET || 'serverless-test-reports'}/${reportKey}`;
      
      console.log(`📊 Consolidated report stored: ${consolidatedReport.reportUrl}`);
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
      report: consolidatedReport
    });
    
  } catch (error) {
    console.error('❌ Test Orchestrator failed:', error);
    return createErrorResponse(500, 'Test orchestration failed', error);
  }
};