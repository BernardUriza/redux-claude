// Test script to verify response parsing in useMedicalChat
const path = require('path');

// Import the compiled hook
const hookPath = path.join(__dirname, 'packages/cognitive-core/dist/hooks/useMedicalChatEvolved.js');
console.log('Loading hook from:', hookPath);

// Simulate the response from callClaudeForDecision
const mockResponse = {
  decision: {
    "message": "Entiendo que el paciente presenta síntomas de COVID-19. Para poder brindar un análisis más completo, necesito recabar algunos datos adicionales.",
    "inferences": [],
    "suggested_actions": ["Solicitar datos demográficos"],
    "confidence_level": "high",
    "requires_user_input": true,
    "conversation_stage": "gathering"
  },
  confidence: 0.9,
  success: true
};

console.log('\n=== TEST: Response Parsing ===');
console.log('Input response.decision:', JSON.stringify(mockResponse.decision, null, 2));

// Simulate the extraction logic from useMedicalChatEvolved
let messageContent;

if (typeof mockResponse.decision === 'object' && mockResponse.decision !== null) {
  // Priority order: message > content > text_response > full object as string
  if ('message' in mockResponse.decision) {
    messageContent = mockResponse.decision.message;
    console.log('\n✅ Found "message" field');
  } else if ('content' in mockResponse.decision) {
    messageContent = mockResponse.decision.content;
    console.log('\n✅ Found "content" field');
  } else if ('text_response' in mockResponse.decision) {
    messageContent = mockResponse.decision.text_response;
    console.log('\n✅ Found "text_response" field');
  } else {
    // Fallback: stringify the entire object if no message field found
    messageContent = JSON.stringify(mockResponse.decision);
    console.log('\n⚠️ No message field found, stringifying entire object');
  }
} else {
  messageContent = String(mockResponse.decision);
  console.log('\n⚠️ decision is not an object, converting to string');
}

console.log('\n=== RESULT ===');
console.log('Extracted message content:', messageContent);
console.log('\n=== EXPECTED ===');
console.log('Should be just the message text, not JSON');

// Test with actual hook code
console.log('\n=== CHECKING ACTUAL HOOK FILE ===');
const fs = require('fs');
const hookContent = fs.readFileSync(hookPath, 'utf8');

// Check if the parsing logic exists in the compiled file
const hasMessageExtraction = hookContent.includes("'message' in response.decision");
const hasContentExtraction = hookContent.includes("'content' in response.decision");
const hasTextResponseExtraction = hookContent.includes("'text_response' in response.decision");

console.log('Has message extraction logic:', hasMessageExtraction);
console.log('Has content extraction logic:', hasContentExtraction);
console.log('Has text_response extraction logic:', hasTextResponseExtraction);

if (!hasMessageExtraction) {
  console.log('\n❌ ERROR: The compiled hook file does not have the message extraction logic!');
  console.log('The build might have failed or the file was not properly updated.');
}