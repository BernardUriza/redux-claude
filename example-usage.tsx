// 🧪 Example Usage: Medical Data Extractor en acción
// Caso: "Hombre con dolor de estómago"

import {
  useIterativeMedicalExtraction,
  extractMedicalDataThunk,
  continueExtractionThunk,
  selectExtractionSummary,
  selectCompletenessPercentage,
  selectFocusAreas,
  checkCompleteness,
  validateExtraction,
} from '@redux-claude/cognitive-core'

// ===== EJEMPLO DE USO EN COMPONENTE REACT =====

export function MedicalExtractionExample() {
  const {
    extractionState,
    currentIteration,
    completenessPercentage,
    isNOMCompliant,
    focusAreas,
    extractedData,
    startExtraction,
    continueExtraction,
    shouldContinue,
    canProceedToSOAP,
  } = useIterativeMedicalExtraction()

  // Simulación del caso real
  const handleTestCase = async () => {
    const sessionId = 'test_session_stomach_pain'

    console.log('🔄 Starting extraction process...')

    // Iteration 1: "hombre con dolor de estómago"
    await startExtraction('Paciente masculino presenta dolor de estómago', sessionId)

    console.log(`📊 After Iteration 1:`)
    console.log(`- State: ${extractionState}`)
    console.log(`- Completeness: ${completenessPercentage}%`)
    console.log(`- NOM Compliant: ${isNOMCompliant}`)
    console.log(`- Focus Areas: ${focusAreas.join(', ')}`)
    console.log(`- Should Continue: ${shouldContinue}`)

    if (shouldContinue) {
      // Iteration 2: "15 años"
      await continueExtraction('El paciente tiene 15 años de edad')

      console.log(`📊 After Iteration 2:`)
      console.log(`- Completeness: ${completenessPercentage}%`)
      console.log(`- Focus Areas: ${focusAreas.join(', ')}`)
    }

    if (shouldContinue) {
      // Iteration 3: "escala 7, desde la mañana"
      await continueExtraction(
        'El dolor tiene intensidad de 7 en escala de 1-10 y lo presenta desde la mañana'
      )

      console.log(`📊 After Iteration 3:`)
      console.log(`- Completeness: ${completenessPercentage}%`)
      console.log(`- Focus Areas: ${focusAreas.join(', ')}`)
    }

    if (shouldContinue) {
      // Iteration 4: "si se duerme se le quita"
      await continueExtraction('El dolor mejora cuando el paciente duerme o descansa')

      console.log(`📊 After Iteration 4:`)
      console.log(`- Completeness: ${completenessPercentage}%`)
      console.log(`- Can Proceed to SOAP: ${canProceedToSOAP}`)
    }

    // Validation final
    if (extractedData) {
      const validation = validateExtraction(extractedData, currentIteration, 5)
      console.log(`🛡️ Final Validation:`)
      console.log(`- Valid: ${validation.isValid}`)
      console.log(`- Confidence: ${validation.confidence}`)
      console.log(`- Recommendation: ${validation.recommendation}`)

      if (validation.recommendation === 'proceed_to_soap') {
        console.log('🎯 ¡Listo para generar SOAP!')
        console.log('📋 Extracted Data:', JSON.stringify(extractedData, null, 2))
      }
    }
  }

  return (
    <div>
      <button onClick={handleTestCase}>🧪 Test Case: Hombre con dolor de estómago</button>

      {/* Estado actual */}
      <div className="extraction-status">
        <h3>📊 Extraction Status</h3>
        <p>State: {extractionState}</p>
        <p>Iteration: {currentIteration}/5</p>
        <p>Completeness: {completenessPercentage}%</p>
        <p>NOM Compliant: {isNOMCompliant ? '✅' : '❌'}</p>
        <p>Can Proceed to SOAP: {canProceedToSOAP ? '✅' : '❌'}</p>
      </div>

      {/* Focus areas */}
      {focusAreas.length > 0 && (
        <div className="focus-areas">
          <h3>🚨 Areas needing attention:</h3>
          <ul>
            {focusAreas.map(area => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Extracted data */}
      {extractedData && (
        <div className="extracted-data">
          <h3>📋 Extracted Data</h3>
          <pre>{JSON.stringify(extractedData, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

// ===== EJEMPLO DE USO DIRECTO CON DISPATCH =====

export async function directExtractionExample(dispatch: any) {
  const sessionId = 'direct_test_session'

  try {
    // Dispatch directo del thunk
    const result = await dispatch(
      extractMedicalDataThunk({
        patientInput:
          'Paciente masculino de 15 años con dolor de estómago intensidad 7/10 desde la mañana, mejora con descanso',
        sessionId,
        isInitial: true,
      })
    ).unwrap()

    console.log('🎯 Extraction Result:', result)

    // Análisis de completitud
    const completeness = checkCompleteness(result.extractedData)

    console.log('📊 Completeness Analysis:')
    console.log(`- Total Score: ${completeness.totalScore}%`)
    console.log(`- Demographic Score: ${completeness.demographicScore}/40`)
    console.log(`- Clinical Score: ${completeness.clinicalScore}/30`)
    console.log(`- Context Score: ${completeness.contextScore}/30`)
    console.log(`- NOM Compliant: ${completeness.nomCompliant}`)
    console.log(`- Ready for SOAP: ${completeness.readyForSOAP}`)
    console.log(`- Missing Fields: ${completeness.missingFields.join(', ')}`)

    return result
  } catch (error) {
    console.error('❌ Extraction failed:', error)
    throw error
  }
}

// ===== EXPECTED OUTPUT PARA EL TEST CASE =====

const EXPECTED_OUTPUT = {
  demographics: {
    patient_age_years: 15,
    patient_gender: 'masculino',
    confidence_demographic: 0.95,
  },
  clinical_presentation: {
    chief_complaint: 'dolor de estómago',
    primary_symptoms: ['dolor abdominal', 'dolor de estómago'],
    anatomical_location: 'estómago/abdomen',
    confidence_symptoms: 0.9,
  },
  symptom_characteristics: {
    duration_description: 'desde la mañana',
    pain_intensity_scale: 7,
    pain_characteristics: ['dolor abdominal'],
    aggravating_factors: null,
    relieving_factors: ['dormir', 'descanso'],
    associated_symptoms: null,
    temporal_pattern: 'matutino',
    confidence_context: 0.85,
  },
  extraction_metadata: {
    overall_completeness_percentage: 90,
    demographic_complete: true,
    clinical_complete: true,
    context_complete: true,
    nom_compliant: true,
    ready_for_soap_generation: true,
    missing_critical_fields: [],
    extraction_timestamp: '2025-01-28T05:48:30.000Z',
    claude_model_used: 'claude-sonnet-4',
  },
}

console.log('✅ Expected completeness: 90%')
console.log('✅ Expected NOM compliance: true')
console.log('✅ Expected SOAP readiness: true')
console.log('✅ Expected iterations: 3-4')
console.log('✅ Expected recommendation: PROCEED_TO_SOAP')
