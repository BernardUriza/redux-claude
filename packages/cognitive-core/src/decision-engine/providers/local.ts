// src/decision-engine/providers/local.ts
// Adaptador local/mock para desarrollo - Bernard Orozco

import type { ProviderAdapter } from '../core/types'

export class LocalAdapter implements ProviderAdapter {
  readonly name = 'local' as const
  readonly isAvailable = true

  async makeRequest(
    systemPrompt: string,
    userPrompt: string,
    signal?: AbortSignal
  ): Promise<{ content: string; success: boolean; error?: string }> {
    // Simulate API delay
    await this.delay(500 + Math.random() * 1000)

    if (signal?.aborted) {
      return {
        content: '',
        success: false,
        error: 'Request aborted',
      }
    }

    try {
      // Extract decision type from prompts
      const decisionType = this.extractDecisionType(systemPrompt, userPrompt)
      const mockResponse = this.generateMockResponse(decisionType, userPrompt)

      return {
        content: JSON.stringify(mockResponse, null, 2),
        success: true,
      }
    } catch (error) {
      return {
        content: '',
        success: false,
        error: `Local adapter error: ${error}`,
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    return true
  }

  private extractDecisionType(systemPrompt: string, userPrompt: string): string {
    const prompt = (systemPrompt + userPrompt).toLowerCase()

    if (prompt.includes('diagnosis') || prompt.includes('differential')) return 'diagnosis'
    if (prompt.includes('triage') || prompt.includes('acuity')) return 'triage'
    if (prompt.includes('validation') || prompt.includes('review')) return 'validation'
    if (prompt.includes('treatment') || prompt.includes('medication')) return 'treatment'
    if (prompt.includes('documentation') || prompt.includes('soap')) return 'documentation'

    return 'diagnosis' // Default
  }

  private generateMockResponse(decisionType: string, userInput: string): any {
    const commonSymptoms = this.extractSymptoms(userInput)

    switch (decisionType) {
      case 'diagnosis':
        return {
          differentials: [
            {
              condition: 'Upper Respiratory Infection',
              icd10: 'J06.9',
              probability: 0.7,
              evidence:
                commonSymptoms.length > 0 ? commonSymptoms : ['fever', 'cough', 'runny nose'],
            },
            {
              condition: 'Viral Syndrome',
              icd10: 'B34.9',
              probability: 0.3,
              evidence: ['viral symptoms', 'self-limiting course'],
            },
          ],
          tests_recommended: ['Rapid strep test', 'Complete blood count if febrile'],
          red_flags: [],
          urgency_level: 4,
          next_steps: ['Symptomatic treatment', 'Follow up if worsening'],
        }

      case 'triage':
        return {
          acuity_level: 4,
          disposition: 'standard',
          time_to_physician: '1hour',
          required_resources: ['basic examination', 'possible lab work'],
          warning_signs: [],
        }

      case 'validation':
        return {
          valid: true,
          concerns: [],
          risk_assessment: {
            level: 'low',
            factors: ['routine presentation', 'stable vital signs'],
          },
          requires_human_review: false,
          recommendations: ['Standard care protocol appropriate'],
        }

      case 'treatment':
        return {
          medications: [
            {
              drug: 'Acetaminophen',
              dosage: '500mg',
              frequency: 'every 6 hours',
              duration: 'as needed',
              contraindications: ['liver disease'],
            },
          ],
          procedures: [],
          lifestyle_modifications: ['rest', 'increased fluid intake', 'avoid smoking'],
          monitoring_plan: ['symptom improvement in 3-5 days', 'return if fever >101.5F persists'],
        }

      case 'documentation':
        return {
          soap: {
            subjective: `Patient presents with ${commonSymptoms.join(', ')} of recent onset.`,
            objective:
              'Vital signs stable. Physical examination reveals mild findings consistent with viral upper respiratory symptoms.',
            assessment: 'Upper respiratory infection, likely viral etiology.',
            plan: 'Symptomatic treatment with acetaminophen as needed. Rest and hydration. Return if symptoms worsen or persist.',
          },
          icd10_codes: ['J06.9'],
          billing_codes: ['99213'],
          follow_up_required: false,
        }

      default:
        return {
          mock_response: true,
          message: 'Local adapter mock response',
          decision_type: decisionType,
        }
    }
  }

  private extractSymptoms(input: string): string[] {
    const symptoms = []
    const text = input.toLowerCase()

    if (text.includes('fever') || text.includes('temperature')) symptoms.push('fever')
    if (text.includes('cough')) symptoms.push('cough')
    if (text.includes('headache')) symptoms.push('headache')
    if (text.includes('sore throat')) symptoms.push('sore throat')
    if (text.includes('runny nose') || text.includes('congestion'))
      symptoms.push('nasal congestion')
    if (text.includes('fatigue') || text.includes('tired')) symptoms.push('fatigue')
    if (text.includes('nausea')) symptoms.push('nausea')
    if (text.includes('pain')) symptoms.push('pain')

    return symptoms
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
