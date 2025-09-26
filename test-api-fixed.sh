#!/bin/bash

echo "=== Testing Redux Brain API (Fixed URLs) ==="
echo

# Test Case 1: Widow Maker (Aortic Dissection)
echo "Test 1: Widow Maker Case (Aortic Dissection)"
echo "Request:"
echo '{"sessionId":"test-widow-maker","message":"Soy hombre de 55 años con historial de hipertensión. Tengo dolor abdominal severo, fiebre de 38.5°C, hipotensión 90/60, y me siento confundido. Empezó hace 2 horas."}'
echo
echo "Response:"
curl -X POST http://localhost:3100/api/redux-brain/ \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-widow-maker","message":"Soy hombre de 55 años con historial de hipertensión. Tengo dolor abdominal severo, fiebre de 38.5°C, hipotensión 90/60, y me siento confundido. Empezó hace 2 horas."}' \
  -s | python -m json.tool 2>/dev/null || echo "Not valid JSON"

echo
echo "========================================="
echo

# Test Case 2: Pediatric Emergency
echo "Test 2: Pediatric Emergency"
echo "Request:"
echo '{"sessionId":"test-pediatric","message":"Mi bebé de 2 meses tiene fiebre de 38.5, está letárgico y no quiere comer"}'
echo
echo "Response:"
curl -X POST http://localhost:3100/api/redux-brain/ \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-pediatric","message":"Mi bebé de 2 meses tiene fiebre de 38.5, está letárgico y no quiere comer"}' \
  -s | python -m json.tool 2>/dev/null || echo "Not valid JSON"

echo
echo "========================================="
echo

# Test Case 3: Telenovela False Positive
echo "Test 3: Telenovela False Positive (Should NOT be critical)"
echo "Request:"
echo '{"sessionId":"test-telenovela","message":"Mi vecina dice que le duele el pecho desde ayer"}'
echo
echo "Response:"
curl -X POST http://localhost:3100/api/redux-brain/ \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-telenovela","message":"Mi vecina dice que le duele el pecho desde ayer"}' \
  -s | python -m json.tool 2>/dev/null || echo "Not valid JSON"

echo
echo "========================================="
echo

# Test Case 4: Real Chest Pain
echo "Test 4: Real Chest Pain (Should be CRITICAL)"
echo "Request:"
echo '{"sessionId":"test-chest-pain","message":"Tengo dolor opresivo en el pecho que se irradia al brazo izquierdo, sudoración y náuseas"}'
echo
echo "Response:"
curl -X POST http://localhost:3100/api/redux-brain/ \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-chest-pain","message":"Tengo dolor opresivo en el pecho que se irradia al brazo izquierdo, sudoración y náuseas"}' \
  -s | python -m json.tool 2>/dev/null || echo "Not valid JSON"

echo
echo "========================================="
echo

# Test Case 5: Complex Context
echo "Test 5: Complex Context"
echo "Request:"
echo '{"sessionId":"test-complex","message":"El mes pasado tuve dolor de pecho pero se me pasó. Ahora me duele la espalda."}'
echo
echo "Response:"
curl -X POST http://localhost:3100/api/redux-brain/ \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-complex","message":"El mes pasado tuve dolor de pecho pero se me pasó. Ahora me duele la espalda."}' \
  -s | python -m json.tool 2>/dev/null || echo "Not valid JSON"

echo
echo "========================================="
echo "All tests completed!"