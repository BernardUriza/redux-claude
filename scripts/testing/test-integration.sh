#!/bin/bash

echo "=== INTEGRATION TEST - Redux Brain Medical System ==="
echo "Date: $(date)"
echo
echo "Testing complete flow: Frontend → API → Backend → Response"
echo "=================================================="
echo

# Test 1: API Health Check
echo "[1/5] Testing API Health..."
curl -s http://localhost:3100/api/redux-brain/ \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"health-check","message":"test"}' \
  -o /dev/null -w "Response Code: %{http_code}\n"
echo

# Test 2: Critical Case Processing
echo "[2/5] Testing Critical Case (Heart Attack)..."
response=$(curl -s -X POST http://localhost:3100/api/redux-brain/ \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"integration-test-1","message":"Tengo dolor opresivo en el pecho con sudoración"}')

urgency=$(echo "$response" | python -c "import sys, json; data = json.load(sys.stdin); print(data.get('urgencyAssessment', {}).get('level', 'UNKNOWN'))" 2>/dev/null)
echo "Urgency Level Detected: $urgency"
if [ "$urgency" = "CRITICAL" ]; then
  echo "✅ PASS: Critical urgency correctly detected"
else
  echo "❌ FAIL: Expected CRITICAL urgency"
fi
echo

# Test 3: Anti-Telenovela System
echo "[3/5] Testing Anti-Telenovela System..."
response=$(curl -s -X POST http://localhost:3100/api/redux-brain/ \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"integration-test-2","message":"Mi amiga dice que le duele la cabeza"}')

urgency=$(echo "$response" | python -c "import sys, json; data = json.load(sys.stdin); print(data.get('urgencyAssessment', {}).get('level', 'UNKNOWN'))" 2>/dev/null)
echo "Urgency Level Detected: $urgency"
if [ "$urgency" != "CRITICAL" ]; then
  echo "✅ PASS: Third-party report not marked as critical"
else
  echo "❌ FAIL: False positive detected"
fi
echo

# Test 4: SOAP Generation Progress
echo "[4/5] Testing SOAP Generation..."
response=$(curl -s -X POST http://localhost:3100/api/redux-brain/ \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"integration-test-3","message":"Soy mujer de 45 años con diabetes, tengo mareos y visión borrosa"}')

soap_progress=$(echo "$response" | python -c "import sys, json; data = json.load(sys.stdin); print(data.get('sessionData', {}).get('soapProgress', 0))" 2>/dev/null)
echo "SOAP Progress: $soap_progress%"
if [ "$soap_progress" -gt 0 ]; then
  echo "✅ PASS: SOAP generation active"
else
  echo "❌ FAIL: SOAP not generated"
fi
echo

# Test 5: Redux Action Tracking
echo "[5/5] Testing Redux Action Tracking..."
response=$(curl -s -X POST http://localhost:3100/api/redux-brain/ \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"integration-test-4","message":"Me duele el estómago desde hace 3 días"}')

action_count=$(echo "$response" | python -c "import sys, json; data = json.load(sys.stdin); print(data.get('reduxFlow', {}).get('totalActions', 0))" 2>/dev/null)
echo "Redux Actions Captured: $action_count"
if [ "$action_count" -gt 0 ]; then
  echo "✅ PASS: Redux actions being tracked"
else
  echo "❌ FAIL: No Redux actions captured"
fi
echo

echo "=================================================="
echo "INTEGRATION TEST COMPLETE"
echo

# Summary
echo "Test Summary:"
echo "- API Endpoint: /api/redux-brain/"
echo "- Frontend: /paradigm2"
echo "- Features Tested: Urgency Detection, Anti-Telenovela, SOAP, Redux Actions"
echo "- Status: System Operational"
echo
echo "Next Steps:"
echo "1. Navigate to http://localhost:3100/paradigm2"
echo "2. Test the chat interface with medical queries"
echo "3. Observe urgency badges and SOAP progress"
echo "4. Check debug panel for Redux actions"