# 🧪 EXHAUSTIVE TESTING SUITE v3.0 - CONTEXT-AWARE MEDICAL AI
## Batería Completa de Casos Edge y Scenarios Complejos

**Fecha:** 2025-09-24 (Latest)
**Sistema:** Redux Brain v2.1 - Context-Aware Engine
**Objetivo:** Validar precisión contextual y eliminar falsos positivos

---

## 🎯 METODOLOGÍA DE PRUEBAS

### **CATEGORÍAS DE TESTING:**
1. **🎭 TELENOVELA CASES** - Diferenciación terceros vs paciente
2. **⏰ TEMPORAL CONTEXT** - Síntomas actuales vs históricos
3. **👨‍👩‍👧‍👦 FAMILY DYNAMICS** - Historia familiar vs emergencia actual
4. **🏥 MEDICAL COMPLEXITY** - Síntomas múltiples vs aislados
5. **👶 PEDIATRIC EDGE CASES** - Casos pediátricos complejos
6. **🚨 EMERGENCY PROTOCOLS** - Validación de protocolos críticos

---

## 🧪 SUITE DE PRUEBAS EXHAUSTIVAS

### **SECCIÓN A: CASOS TELENOVELA**
*Problema: Confundir terceros con paciente*

#### A1. Vecina con Síntomas ❌ → Paciente Sin Síntomas
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"telenovela-a1","message":"Doctor, mi vecina dice que le duele mucho el pecho cuando sube escaleras, ¿será algo grave?"}'
```
**EXPECTED:** MODERATE/LOW (third-party story)
**REASONING:** "mi vecina dice que LE duele" = síntomas de otra persona

#### A2. Madre Contando Síntomas del Hijo Presente
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"telenovela-a2","message":"Doctor, mi hijo que está aquí conmigo tiene fiebre desde ayer, 39 grados, y no quiere comer nada"}'
```
**EXPECTED:** HIGH/CRITICAL (pediatric fever, patient present)
**REASONING:** "mi hijo que está AQUÍ" = paciente presente

#### A3. Pregunta Sobre Medicamento de Familiar
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"telenovela-a3","message":"¿Es normal que mi esposo tome losartán y metformina juntos? Él tiene 55 años"}'
```
**EXPECTED:** LOW (medication question about third party)

#### A4. Síntomas Propios vs Historia de Otros
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"telenovela-a4","message":"Tengo dolor de pecho como el que tuvo mi papá antes de su infarto"}'
```
**EXPECTED:** CRITICAL (current patient symptoms + family history context)
**REASONING:** "TENGO dolor" = síntomas actuales del paciente

---

### **SECCIÓN B: CONTEXTO TEMPORAL**
*Problema: Confundir síntomas pasados con actuales*

#### B1. Síntomas Históricos vs Actuales
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"temporal-b1","message":"El mes pasado tuve un dolor de pecho horrible, pero ahora me duele la espalda"}'
```
**EXPECTED:** MODERATE (current back pain, past chest pain as context)

#### B2. Síntoma Progresivo
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"temporal-b2","message":"Desde hace 3 días el dolor de pecho va empeorando, ahora también tengo sudoración"}'
```
**EXPECTED:** CRITICAL (progressive worsening symptoms)

#### B3. Tratamiento Pasado
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"temporal-b3","message":"El año pasado me dijeron que tenía gastritis, pero ahora siento lo mismo"}'
```
**EXPECTED:** MODERATE (recurrent symptoms, needs evaluation)

---

### **SECCIÓN C: DINÁMICAS FAMILIARES**
*Problema: Historia familiar vs emergencia inmediata*

#### C1. Historia Familiar Pura
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"family-c1","message":"Mi abuela murió de diabetes, mi papá de infarto, ¿tengo riesgo?"}'
```
**EXPECTED:** MODERATE (genetic counseling, risk assessment)

#### C2. Historia Familiar + Síntomas Actuales
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"family-c2","message":"Tengo antecedente de diabetes familiar y ahora estoy orinando mucho y con mucha sed"}'
```
**EXPECTED:** HIGH (possible diabetes onset with family history)

#### C3. Comparación con Familiar
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"family-c3","message":"Siento exactamente lo mismo que sintió mi mamá cuando le dio el derrame"}'
```
**EXPECTED:** CRITICAL (neurological symptoms pattern recognition)

---

### **SECCIÓN D: COMPLEJIDAD MÉDICA**
*Problema: Síndrome vs síntoma aislado*

#### D1. Síndrome Coronario Completo
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"complex-d1","message":"Hombre 62 años, dolor opresivo pecho 45 min, brazo izquierdo, sudoración, náusea, antecedente HTA"}'
```
**EXPECTED:** CRITICAL (complete ACS syndrome)

#### D2. Síntoma Aislado Ambiguo
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"complex-d2","message":"Me duele el pecho cuando respiro profundo"}'
```
**EXPECTED:** MODERATE (pleuritic pain, needs evaluation)

#### D3. Síntomas Múltiples Sistemas
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"complex-d3","message":"Mujer 35 años, dolor pecho, palpitaciones, ansiedad, insomnio desde hace 1 semana"}'
```
**EXPECTED:** MODERATE (anxiety vs cardiac, needs evaluation)

---

### **SECCIÓN E: CASOS PEDIÁTRICOS EDGE**
*Problema: Peso, dosis, protocolos especiales*

#### E1. Lactante con Fiebre
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"pediatric-e1","message":"Mi bebé de 2 meses tiene fiebre 38.5, está muy decaído"}'
```
**EXPECTED:** CRITICAL (neonatal sepsis protocol)

#### E2. Escolar con Síntomas Respiratorios
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"pediatric-e2","message":"Niño 8 años, tos seca por 5 días, ahora tiene fiebre y dificultad respirar"}'
```
**EXPECTED:** HIGH (possible pneumonia, weight calculation needed)

#### E3. Adolescente con Síntomas Psicológicos
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"pediatric-e3","message":"Mi hija 15 años dice que le duele el pecho cuando está estresada"}'
```
**EXPECTED:** MODERATE (anxiety vs organic cause in adolescent)

---

### **SECCIÓN F: PROTOCOLOS DE EMERGENCIA**
*Problema: Activación correcta de protocolos*

#### F1. Código Stroke
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"emergency-f1","message":"Mujer 68 años, no puede mover brazo derecho desde hace 1 hora, habla raro"}'
```
**EXPECTED:** CRITICAL (stroke protocol, time window critical)

#### F2. Shock Cardiogénico
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"emergency-f2","message":"Paciente con dolor pecho, presión 80/50, pulso débil, sudoroso, confuso"}'
```
**EXPECTED:** CRITICAL (cardiogenic shock protocol)

#### F3. Anafilaxia
```bash
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d '{"sessionId":"emergency-f3","message":"Después de comer camarones, tengo ronchas, me cuesta respirar, mareo"}'
```
**EXPECTED:** CRITICAL (anaphylaxis protocol, epinephrine)

---

## 📊 MÉTRICAS DE VALIDACIÓN

### **CRITERIOS DE ÉXITO:**
- **Telenovela Cases:** 90%+ precisión en diferenciación terceros vs paciente
- **Temporal Context:** 95%+ precisión en síntomas actuales vs históricos
- **Emergency Protocols:** 100% activación correcta en casos críticos
- **Pediatric Weights:** Cálculo automático preciso (edad × 3 + 7)
- **Reasoning Quality:** Explicación lógica en todos los casos

### **RED FLAGS - FALLOS CRÍTICOS:**
❌ Historia familiar → CRITICAL
❌ "Mi vecina tiene..." → CRITICAL
❌ Síntomas pasados → CRITICAL actual
❌ Preguntas médicas → Protocolos de emergencia

---

## 🔄 PROCESO DE ITERACIÓN

### **CUANDO ENCUENTRA FALLOS:**
1. **Identificar patrón del error** en reasoning
2. **Mejorar prompt contextual** con reglas específicas
3. **Re-test el caso fallido** + casos similares
4. **Validar no regresión** en casos que funcionaban
5. **Documentar la mejora** en este archivo

### **COMANDOS PARA RE-TESTING:**
```bash
# Re-run specific failed case
curl -X POST http://localhost:3002/api/redux-brain/ -H "Content-Type: application/json" -d @failed_case.json

# Batch test all cases in category
./run_section_tests.sh A  # Telenovela cases
./run_section_tests.sh B  # Temporal cases
```

---

## 🎯 OBJETIVO FINAL

**PRECISION TARGET:** 98%+ accuracy en diferenciación contextual
**ZERO TOLERANCE:** Falsos positivos en emergencias por terceros
**REASONING QUALITY:** Explicación lógica clara en todos los casos

**El Context-Aware Medical AI debe ser tan preciso que un doctor real confíe 100% en sus recomendaciones de urgencia.**

---

*Creado por Bernard Orozco - Context-Aware Medical AI Pioneer*
*"Context is Everything - No More Telenovela Confusion"*