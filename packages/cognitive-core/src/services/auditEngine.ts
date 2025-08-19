// src/services/auditEngine.ts
// Creado por Bernard Orozco
import { AuditEntry, AuditLevel, AuditCategory, SessionAudit } from '../types/audit'
import { DecisionItem, DecisionType, DecisionStatus } from '../types/decisional'
import { nanoid } from '@reduxjs/toolkit'

export class MedicalAuditEngine {
  private sessionAudit: SessionAudit
  
  constructor(sessionId: string = nanoid()) {
    this.sessionAudit = {
      sessionId,
      startTime: Date.now(),
      totalDecisions: 0,
      auditEntries: [],
      overallAssessment: {
        clinicalCoherence: 100,
        safetyScore: 100,
        decisionQuality: 100,
        recommendationLevel: 'safe'
      }
    }
  }

  // Audit individual decision
  auditDecision(decision: DecisionItem, previousDecisions: DecisionItem[]): AuditEntry[] {
    const auditEntries: AuditEntry[] = []
    
    // 1. Clinical Safety Check
    const safetyAudit = this.performSafetyCheck(decision)
    if (safetyAudit) auditEntries.push(safetyAudit)
    
    // 2. Consistency Check with previous decisions
    if (previousDecisions.length > 0) {
      const consistencyAudit = this.checkConsistency(decision, previousDecisions)
      if (consistencyAudit) auditEntries.push(consistencyAudit)
    }
    
    // 3. Clinical Reasoning Quality
    const reasoningAudit = this.auditClinicalReasoning(decision)
    if (reasoningAudit) auditEntries.push(reasoningAudit)
    
    // 4. Priority vs Symptoms Alignment
    const priorityAudit = this.auditPriorityAlignment(decision)
    if (priorityAudit) auditEntries.push(priorityAudit)
    
    // Update session audit
    this.sessionAudit.auditEntries.push(...auditEntries)
    this.sessionAudit.totalDecisions++
    this.updateOverallAssessment()
    
    return auditEntries
  }

  private performSafetyCheck(decision: DecisionItem): AuditEntry | null {
    if (decision.type !== DecisionType.DIAGNOSIS) return null
    
    const diagnosisDecision = decision.decision as any
    const redFlags = diagnosisDecision.red_flags || []
    const priority = diagnosisDecision.priority
    
    // Critical safety check
    if (redFlags.length > 0 && priority === 'low') {
      return {
        id: nanoid(),
        timestamp: Date.now(),
        level: AuditLevel.CRITICAL,
        category: AuditCategory.SAFETY_CHECK,
        decisionId: decision.id,
        message: 'CRITICAL: Red flags identified but priority set to LOW',
        details: {
          originalDecision: diagnosisDecision,
          reasoning: 'Red flags indicate potential serious conditions that require urgent attention',
          recommendations: ['Escalate priority to HIGH or CRITICAL', 'Review red flag assessment', 'Consider immediate referral'],
          riskFactors: redFlags
        },
        metaAnalysis: {
          consistencyScore: 20,
          confidenceChange: -50,
          clinicalSoundness: 30,
          followUpRequired: true
        }
      }
    }
    
    // Warning for missing red flag assessment
    if (!redFlags && priority === 'high') {
      return {
        id: nanoid(),
        timestamp: Date.now(),
        level: AuditLevel.WARNING,
        category: AuditCategory.SAFETY_CHECK,
        decisionId: decision.id,
        message: 'High priority case without red flag assessment',
        details: {
          originalDecision: diagnosisDecision,
          reasoning: 'High priority cases should have explicit red flag evaluation',
          recommendations: ['Review for potential red flags', 'Document why high priority assigned'],
          riskFactors: ['incomplete_assessment']
        },
        metaAnalysis: {
          consistencyScore: 70,
          confidenceChange: -10,
          clinicalSoundness: 75,
          followUpRequired: true
        }
      }
    }
    
    return null
  }

  private checkConsistency(current: DecisionItem, previous: DecisionItem[]): AuditEntry | null {
    const lastDecision = previous[previous.length - 1]
    
    // Check for contradictory diagnoses
    if (current.type === DecisionType.DIAGNOSIS && lastDecision.type === DecisionType.DIAGNOSIS) {
      const currentDifferentials = (current.decision as any).differentials || []
      const lastDifferentials = (lastDecision.decision as any).differentials || []
      
      const hasOverlap = currentDifferentials.some((diff: string) => 
        lastDifferentials.some((lastDiff: string) => 
          diff.toLowerCase().includes(lastDiff.toLowerCase()) || 
          lastDiff.toLowerCase().includes(diff.toLowerCase())
        )
      )
      
      if (!hasOverlap && previous.length > 0) {
        return {
          id: nanoid(),
          timestamp: Date.now(),
          level: AuditLevel.WARNING,
          category: AuditCategory.CONTRADICTION,
          decisionId: current.id,
          message: 'No diagnostic overlap with previous assessment',
          details: {
            originalDecision: current.decision,
            conflictingDecision: lastDecision.decision,
            reasoning: 'Complete change in differential diagnosis without clear clinical evolution',
            recommendations: ['Review clinical progression', 'Document reasoning for diagnostic shift', 'Consider if new information justifies change'],
            riskFactors: ['diagnostic_inconsistency', 'potential_missed_diagnosis']
          },
          metaAnalysis: {
            consistencyScore: 40,
            confidenceChange: -20,
            clinicalSoundness: 60,
            followUpRequired: true
          }
        }
      }
    }
    
    return null
  }

  private auditClinicalReasoning(decision: DecisionItem): AuditEntry | null {
    if (decision.type === DecisionType.DIAGNOSIS) {
      const diagnosisDecision = decision.decision as any
      const clinicalNotes = diagnosisDecision.clinical_notes
      const testsNeeded = diagnosisDecision.tests_needed || []
      const confidenceFactors = diagnosisDecision.confidence_factors || []
      
      if (!clinicalNotes || clinicalNotes.length < 10) {
        return {
          id: nanoid(),
          timestamp: Date.now(),
          level: AuditLevel.WARNING,
          category: AuditCategory.CLINICAL_REASONING,
          decisionId: decision.id,
          message: 'Insufficient clinical reasoning documentation',
          details: {
            originalDecision: diagnosisDecision,
            reasoning: 'Clinical decisions require clear documentation of reasoning process',
            recommendations: ['Provide detailed clinical reasoning', 'Document decision-making process', 'Include supporting evidence'],
            riskFactors: ['poor_documentation', 'unclear_reasoning']
          },
          metaAnalysis: {
            consistencyScore: 60,
            confidenceChange: -15,
            clinicalSoundness: 50,
            followUpRequired: true
          }
        }
      }
      
      if (testsNeeded.length === 0 && decision.confidence < 80) {
        return {
          id: nanoid(),
          timestamp: Date.now(),
          level: AuditLevel.INFO,
          category: AuditCategory.QUALITY_ASSURANCE,
          decisionId: decision.id,
          message: 'Low confidence diagnosis without confirmatory testing',
          details: {
            originalDecision: diagnosisDecision,
            reasoning: 'Low confidence diagnoses typically benefit from additional testing',
            recommendations: ['Consider diagnostic tests to increase confidence', 'Review differential diagnosis', 'Plan follow-up assessment'],
            riskFactors: ['diagnostic_uncertainty']
          },
          metaAnalysis: {
            consistencyScore: 80,
            confidenceChange: 0,
            clinicalSoundness: 70,
            followUpRequired: false
          }
        }
      }
    }
    
    return null
  }

  private auditPriorityAlignment(decision: DecisionItem): AuditEntry | null {
    if (decision.type === DecisionType.DIAGNOSIS) {
      const diagnosisDecision = decision.decision as any
      const priority = diagnosisDecision.priority
      const followUpTimeframe = diagnosisDecision.follow_up_timeframe
      
      // Check priority vs follow-up alignment
      const priorityTimeframeMap: Record<string, string[]> = {
        'critical': ['immediate'],
        'high': ['immediate', '24hours'],
        'medium': ['24hours', '48hours', '1week'],
        'low': ['1week', 'routine']
      }
      
      const expectedTimeframes = priorityTimeframeMap[priority] || []
      
      if (!expectedTimeframes.includes(followUpTimeframe)) {
        return {
          id: nanoid(),
          timestamp: Date.now(),
          level: AuditLevel.WARNING,
          category: AuditCategory.DECISION_REVIEW,
          decisionId: decision.id,
          message: `Priority-timeframe mismatch: ${priority} priority with ${followUpTimeframe} follow-up`,
          details: {
            originalDecision: diagnosisDecision,
            reasoning: 'Priority level should align with follow-up timeframe requirements',
            recommendations: [`Adjust priority to match ${followUpTimeframe} timeframe`, `Or adjust timeframe to match ${priority} priority`],
            riskFactors: ['priority_mismatch', 'delayed_care']
          },
          metaAnalysis: {
            consistencyScore: 50,
            confidenceChange: -10,
            clinicalSoundness: 60,
            followUpRequired: true
          }
        }
      }
    }
    
    return null
  }

  private updateOverallAssessment(): void {
    const entries = this.sessionAudit.auditEntries
    const criticalCount = entries.filter(e => e.level === AuditLevel.CRITICAL).length
    const warningCount = entries.filter(e => e.level === AuditLevel.WARNING).length
    
    // Calculate scores
    const totalDecisions = this.sessionAudit.totalDecisions
    const criticalPenalty = (criticalCount / Math.max(totalDecisions, 1)) * 50
    const warningPenalty = (warningCount / Math.max(totalDecisions, 1)) * 20
    
    this.sessionAudit.overallAssessment.clinicalCoherence = Math.max(0, 100 - criticalPenalty - warningPenalty)
    this.sessionAudit.overallAssessment.safetyScore = Math.max(0, 100 - (criticalCount * 30) - (warningCount * 10))
    this.sessionAudit.overallAssessment.decisionQuality = Math.max(0, 100 - criticalPenalty - warningPenalty)
    
    // Determine recommendation level
    if (criticalCount > 0) {
      this.sessionAudit.overallAssessment.recommendationLevel = 'clinical_oversight_needed'
    } else if (warningCount > 2) {
      this.sessionAudit.overallAssessment.recommendationLevel = 'review_required'
    } else {
      this.sessionAudit.overallAssessment.recommendationLevel = 'safe'
    }
  }

  getSessionAudit(): SessionAudit {
    return { ...this.sessionAudit }
  }

  generateAuditReport(): string {
    const audit = this.sessionAudit
    const assessment = audit.overallAssessment
    
    return `
MEDICAL DECISION AUDIT REPORT
=============================
Session: ${audit.sessionId}
Duration: ${Math.round((Date.now() - audit.startTime) / 1000 / 60)} minutes
Total Decisions: ${audit.totalDecisions}

OVERALL ASSESSMENT:
- Clinical Coherence: ${assessment.clinicalCoherence}%
- Safety Score: ${assessment.safetyScore}%
- Decision Quality: ${assessment.decisionQuality}%
- Recommendation: ${assessment.recommendationLevel.toUpperCase()}

AUDIT ENTRIES: ${audit.auditEntries.length}
- Critical: ${audit.auditEntries.filter(e => e.level === AuditLevel.CRITICAL).length}
- Warnings: ${audit.auditEntries.filter(e => e.level === AuditLevel.WARNING).length}
- Info: ${audit.auditEntries.filter(e => e.level === AuditLevel.INFO).length}

${audit.auditEntries.map(entry => `
[${entry.level.toUpperCase()}] ${entry.message}
Category: ${entry.category}
Clinical Soundness: ${entry.metaAnalysis.clinicalSoundness}%
Recommendations: ${entry.details.recommendations.join(', ')}
`).join('\n')}
`
  }
}

// Singleton instance
export const auditEngine = new MedicalAuditEngine()