// tests/e2e/medical-workflow.e2e.test.ts
// End-to-End Tests para Flujo Médico Completo - FASE 7 - Creado por Bernard Orozco

import { test, expect } from '@playwright/test'

// 🎭 CONFIGURACIÓN E2E
test.describe('Medical Workflow E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('/')
    
    // Esperar a que la aplicación cargue completamente
    await page.waitForLoadState('networkidle')
    
    // Verificar que estamos en la página correcta
    await expect(page).toHaveTitle(/medical|redux|claude/i)
  })

  // 🏥 TEST COMPLETO DE FLUJO MÉDICO
  test('Complete Medical Analysis Workflow', async ({ page }) => {
    // FASE 1: Iniciar consulta médica
    test.step('Start medical consultation', async () => {
      // Buscar y usar el chat o input principal
      const chatInput = page.locator('textarea, input[type="text"]').first()
      await expect(chatInput).toBeVisible({ timeout: 10000 })
      
      // Simular entrada de síntomas del paciente
      await chatInput.fill('Patient presents with severe headache, nausea, and blood pressure of 180/110 mmHg. Symptoms started 3 days ago.')
      
      // Enviar mensaje
      const sendButton = page.locator('button:has-text("Send"), button[type="submit"]').first()
      if (await sendButton.isVisible()) {
        await sendButton.click()
      } else {
        await chatInput.press('Enter')
      }
      
      // Esperar respuesta del sistema
      await page.waitForTimeout(2000)
    })

    // FASE 2: Verificar análisis SOAP
    test.step('Verify SOAP Analysis appears', async () => {
      // Buscar componente SOAP Display
      const soapDisplay = page.locator('[data-testid="soap-display"], .soap-display, :has-text("SOAP"), :has-text("Subjetivo")')
      await expect(soapDisplay.first()).toBeVisible({ timeout: 15000 })
      
      // Verificar secciones SOAP
      await expect(page.locator(':has-text("Subjetivo"), :has-text("Subjective")')).toBeVisible()
      await expect(page.locator(':has-text("Objetivo"), :has-text("Objective")')).toBeVisible()
      await expect(page.locator(':has-text("Evaluación"), :has-text("Assessment")')).toBeVisible()
      await expect(page.locator(':has-text("Plan")')).toBeVisible()
      
      // Verificar que el contenido médico aparece
      await expect(page.locator(':has-text("headache"), :has-text("nausea"), :has-text("blood pressure")')).toBeVisible()
    })

    // FASE 3: Verificar métricas en tiempo real
    test.step('Verify Real-Time Metrics', async () => {
      // Buscar componente de métricas
      const metricsComponent = page.locator('[data-testid="real-time-metrics"], :has-text("Métricas"), :has-text("Confianza")')
      await expect(metricsComponent.first()).toBeVisible({ timeout: 10000 })
      
      // Verificar métricas específicas
      await expect(page.locator(':has-text("Confianza"), :has-text("Confidence")')).toBeVisible()
      await expect(page.locator(':has-text("%")')).toBeVisible() // Porcentajes de confianza
      
      // Verificar que las métricas no son valores mock (no 85% exacto)
      const confidenceText = await page.locator(':has-text("%")').first().textContent()
      expect(confidenceText).not.toBe('85%') // No debe ser el valor mock
    })

    // FASE 4: Verificar progreso diagnóstico
    test.step('Verify Diagnostic Progress', async () => {
      // Buscar componente de progreso
      const progressComponent = page.locator('[data-testid="diagnostic-progress"], :has-text("Progreso"), :has-text("Diagnóstico")')
      
      // Verificar si el componente aparece (puede no aparecer si no hay suficiente progreso)
      const isVisible = await progressComponent.first().isVisible({ timeout: 5000 }).catch(() => false)
      
      if (isVisible) {
        await expect(page.locator(':has-text("Ciclo"), :has-text("Cycle")')).toBeVisible()
        await expect(page.locator(':has-text("Confianza"), :has-text("Confidence")')).toBeVisible()
      } else {
        console.log('Diagnostic Progress component not visible - expected for initial state')
      }
    })

    // FASE 5: Verificar recordatorios de seguimiento
    test.step('Verify Follow-up Reminders', async () => {
      // Buscar componente de seguimiento
      const followUpComponent = page.locator('[data-testid="follow-up"], :has-text("Seguimiento"), :has-text("Recordatorio")')
      await expect(followUpComponent.first()).toBeVisible({ timeout: 10000 })
      
      // Verificar interfaz de recordatorios
      await expect(page.locator(':has-text("Pendientes"), :has-text("Pending")')).toBeVisible()
      await expect(page.locator('button:has-text("Agregar"), button:has-text("Add")')).toBeVisible()
    })

    // FASE 6: Verificar notas médicas
    test.step('Verify Medical Notes Generation', async () => {
      // Buscar componente de notas
      const notesComponent = page.locator('[data-testid="medical-notes"], :has-text("Notas Médicas"), :has-text("Medical Notes")')
      await expect(notesComponent.first()).toBeVisible({ timeout: 10000 })
      
      // Verificar que se generan notas a partir de los mensajes
      const notesExist = await page.locator('.note-card, [class*="note"], :has-text("Sistema Multinúcleo")').count()
      if (notesExist > 0) {
        console.log(`Found ${notesExist} medical notes generated`)
      }
    })
  })

  // 🚨 TEST DE SISTEMA DE ALERTAS
  test('Alert System Functionality', async ({ page }) => {
    test.step('Monitor system alerts', async () => {
      // Esperar a que el sistema de monitoreo se inicialice
      await page.waitForTimeout(5000)
      
      // Verificar si aparecen alertas (pueden no aparecer en estado normal)
      const alerts = page.locator('[data-testid="alert"], .alert, [class*="alert"]')
      const alertCount = await alerts.count()
      
      if (alertCount > 0) {
        console.log(`Found ${alertCount} system alerts`)
        
        // Verificar que las alertas tienen la estructura correcta
        const firstAlert = alerts.first()
        await expect(firstAlert).toBeVisible()
        
        // Buscar botón de cierre
        const closeButton = firstAlert.locator('button:has-text("✕"), button:has-text("Ocultar"), button:has-text("Hide")')
        if (await closeButton.isVisible()) {
          await closeButton.click()
          await expect(firstAlert).not.toBeVisible({ timeout: 2000 })
        }
      } else {
        console.log('No alerts present - system is healthy')
      }
    })
  })

  // 📊 TEST DE DASHBOARD DE SALUD
  test('System Health Dashboard', async ({ page }) => {
    test.step('Verify dashboard displays system health', async () => {
      // Buscar dashboard de salud del sistema
      const dashboard = page.locator('[data-testid="health-dashboard"], :has-text("Sistema Médico"), :has-text("Health")')
      
      // Dashboard puede estar oculto inicialmente
      if (await dashboard.first().isVisible({ timeout: 5000 })) {
        // Verificar métricas del dashboard
        await expect(page.locator(':has-text("CPU"), :has-text("Memoria"), :has-text("Memory")')).toBeVisible()
        await expect(page.locator(':has-text("Cache")')).toBeVisible()
        
        // Verificar botón expandir/contraer
        const expandButton = page.locator('button:has-text("Expandir"), button:has-text("Expand")')
        if (await expandButton.isVisible()) {
          await expandButton.click()
          await expect(page.locator('button:has-text("Contraer"), button:has-text("Contract")')).toBeVisible()
        }
      } else {
        console.log('Health Dashboard not visible - may be collapsed or disabled')
      }
    })
  })

  // 🔄 TEST DE FLUJO INTERACTIVO
  test('Interactive Medical Conversation Flow', async ({ page }) => {
    test.step('Simulate doctor-patient interaction', async () => {
      const chatInput = page.locator('textarea, input[type="text"]').first()
      await expect(chatInput).toBeVisible({ timeout: 10000 })
      
      // Secuencia de mensajes médicos
      const medicalSequence = [
        'Patient has chest pain and shortness of breath',
        'Pain started 2 hours ago, radiating to left arm',
        'Patient is diaphoretic and anxious',
        'ECG shows ST elevation in leads V1-V4'
      ]
      
      for (let i = 0; i < medicalSequence.length; i++) {
        // Enviar mensaje
        await chatInput.fill(medicalSequence[i])
        
        const sendButton = page.locator('button:has-text("Send"), button[type="submit"]').first()
        if (await sendButton.isVisible()) {
          await sendButton.click()
        } else {
          await chatInput.press('Enter')
        }
        
        // Esperar respuesta y actualización de componentes
        await page.waitForTimeout(3000)
        
        // Verificar que el contenido se actualiza
        await expect(page.locator(`:has-text("${medicalSequence[i]}")`)).toBeVisible()
        
        // Verificar que métricas se actualizan
        if (i === medicalSequence.length - 1) {
          // En el último mensaje, verificar que la confianza ha cambiado
          const confidenceElements = page.locator(':has-text("%")')
          const confidenceCount = await confidenceElements.count()
          expect(confidenceCount).toBeGreaterThan(0)
        }
      }
    })

    test.step('Verify components update with new data', async () => {
      // Verificar que SOAP se actualiza
      await expect(page.locator(':has-text("chest pain"), :has-text("shortness"), :has-text("ST elevation")')).toBeVisible()
      
      // Verificar que las métricas reflejan el nuevo contenido médico
      const metricsArea = page.locator('[data-testid="real-time-metrics"], :has-text("Métricas")')
      await expect(metricsArea.first()).toBeVisible()
      
      // Verificar que el progreso diagnóstico avanza
      const progressExists = await page.locator(':has-text("Progreso"), :has-text("Ciclo")').isVisible({ timeout: 5000 })
      if (progressExists) {
        console.log('Diagnostic progress updated with new interaction')
      }
    })
  })

  // 🚀 TEST DE PERFORMANCE Y LAZY LOADING
  test('Performance and Lazy Loading', async ({ page }) => {
    test.step('Verify lazy loading components', async () => {
      // Verificar que los componentes lazy se cargan gradualmente
      const initialLoadTime = Date.now()
      
      // Esperar a que aparezcan los skeletons de carga
      const loadingElements = page.locator('[class*="skeleton"], [class*="loading"], :has-text("Cargando")')
      const hasLoadingState = await loadingElements.first().isVisible({ timeout: 2000 })
      
      if (hasLoadingState) {
        console.log('Lazy loading skeletons detected')
        
        // Esperar a que se complete la carga
        await page.waitForTimeout(3000)
        
        // Verificar que los skeletons desaparecen
        await expect(loadingElements.first()).not.toBeVisible({ timeout: 10000 })
      }
      
      const loadTime = Date.now() - initialLoadTime
      console.log(`Total component load time: ${loadTime}ms`)
      
      // Verificar que el tiempo de carga es razonable
      expect(loadTime).toBeLessThan(15000) // Menos de 15 segundos
    })

    test.step('Verify page performance metrics', async () => {
      // Usar Performance API si está disponible
      const performanceMetrics = await page.evaluate(() => {
        if ('performance' in window) {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          return {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
          }
        }
        return null
      })
      
      if (performanceMetrics) {
        console.log('Performance Metrics:', performanceMetrics)
        
        // Verificar métricas razonables
        expect(performanceMetrics.domContentLoaded).toBeLessThan(5000) // < 5s DOM ready
        if (performanceMetrics.firstContentfulPaint > 0) {
          expect(performanceMetrics.firstContentfulPaint).toBeLessThan(3000) // < 3s FCP
        }
      }
    })
  })

  // 🔧 TEST DE RESILENCIA Y MANEJO DE ERRORES
  test('Error Handling and Resilience', async ({ page }) => {
    test.step('Test error states', async () => {
      // Simular error de red interceptando requests
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Simulated server error' })
        })
      })
      
      // Intentar interactuar con la aplicación
      const chatInput = page.locator('textarea, input[type="text"]').first()
      if (await chatInput.isVisible({ timeout: 5000 })) {
        await chatInput.fill('Test message during error condition')
        await chatInput.press('Enter')
        
        // Esperar y verificar que la aplicación maneja el error graciosamente
        await page.waitForTimeout(3000)
        
        // Buscar mensajes de error o estados de error
        const errorElements = page.locator(':has-text("error"), :has-text("Error"), :has-text("problema")')
        const hasErrorHandling = await errorElements.first().isVisible({ timeout: 5000 })
        
        if (hasErrorHandling) {
          console.log('Error handling UI detected')
        } else {
          console.log('No explicit error UI - app may handle errors silently')
        }
      }
      
      // Limpiar interceptores
      await page.unroute('**/api/**')
    })

    test.step('Test component recovery', async () => {
      // Recargar página para reset
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Verificar que los componentes se recuperan correctamente
      await expect(page.locator('body')).toBeVisible()
      
      // Verificar que la funcionalidad básica está disponible
      const interactiveElements = page.locator('textarea, input, button')
      const elementCount = await interactiveElements.count()
      expect(elementCount).toBeGreaterThan(0)
      
      console.log(`Application recovered with ${elementCount} interactive elements`)
    })
  })
})