import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filePath, fileContent } = await req.json();

    if (!filePath || !fileContent) {
      return Response.json({ error: 'filePath and fileContent are required' }, { status: 400 });
    }

    // Call LLM to analyze code for bugs
    const analysisResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert code reviewer specializing in finding and fixing bugs in JavaScript/React code.

Analyze the following code file for potential bugs, runtime errors, null safety issues, type mismatches, missing checks, and other vulnerabilities.

File: ${filePath}

Code to analyze:
\`\`\`javascript
${fileContent}
\`\`\`

Provide your analysis in the following JSON format:
{
  "bugs": [
    {
      "line": <line number>,
      "severity": "critical|high|medium|low",
      "issue": "<description of the bug>",
      "suggestion": "<how to fix it>",
      "fixedCode": "<corrected code snippet>"
    }
  ],
  "summary": "<overall assessment>",
  "riskLevel": "critical|high|medium|low"
}

Focus on:
- Null/undefined safety (missing null checks, optional chaining)
- Array type guards (checking if array before using array methods)
- Missing property access safety
- Type mismatches
- Logic errors
- Potential runtime crashes`,
      response_json_schema: {
        type: 'object',
        properties: {
          bugs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                line: { type: 'number' },
                severity: { type: 'string' },
                issue: { type: 'string' },
                suggestion: { type: 'string' },
                fixedCode: { type: 'string' }
              }
            }
          },
          summary: { type: 'string' },
          riskLevel: { type: 'string' }
        }
      },
    });

    return Response.json(analysisResult);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});