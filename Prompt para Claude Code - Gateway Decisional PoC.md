# Prompt para Claude Code - Gateway Decisional PoC

## Contexto
Tengo un proyecto Next.js con Redux ya funcionando. Necesito agregar un PoC visual de un "Gateway Decisional" que muestre decisiones estructuradas de LLMs en tiempo real.

## Objetivo
La página divide la pantalla en dos:
- **Izquierda**: Chat médico simple, que ya tenemos.
- **Derecha**: Visualización en tiempo real de decisiones estructuradas del Redux store

## Requisitos Técnicos

### Redux Store
Necesito dos slices:
1. **decisions**: Almacena decisiones estructuradas (JSON only, no texto)
   - items: array de {id, provider, type, decision, confidence, latency, timestamp}
   - activeProvider: string (claude|openai|local)
   - loading: boolean

2. **chat**: Mensajes simples
   - messages: array de {role, content, decisionId?}

### Hook Principal
`useDecisionalGateway` que:
- Intercepta mensajes del usuario
- Ejecuta llamada a useClaudeChat (1 segundo delay)
- Retorna decisión estructurada mock:
  - Para "diagnosis": {differentials: [], priority: string, tests: []}
  - Para "validation": {approved: boolean, flags: []}
- Agrega decisión al store con metadata
- Maneja fallback si falla

### UI Component
Split screen con:

**Panel Izquierdo (Chat)**:
- Lo que ya tenemos

**Panel Derecho (Decisiones)**:
- Cards mostrando:
  - Total decisiones (contador grande)
  - Provider activo (badge coloreado)
  - Confidence promedio (porcentaje)
- Timeline vertical de decisiones:
  - Timestamp
  - Provider badge (purple=claude, green=openai, gray=local)
  - JSON formateado de la decisión
  - Confidence % y latency ms
- Al final: Redux state viewer (JSON en terminal style)

### Comportamiento
1. Usuario escribe síntomas
2. Sistema detecta si es "diagnosis" o "validation" por keywords
3. Muestra "Processing decision..." 
4. Después de Xs, agrega decisión estructurada
5. Panel derecho se actualiza instantáneamente

### Estilo Visual
- Tailwind CSS
- Panel chat: fondo gris claro
- Decisiones: cards blancos con bordes
- Provider badges: colores distintivos
- Redux state: terminal negro con texto verde
- Responsive pero optimizado para desktop

## Datos Mock
Cuando se pida diagnosis, retornar por ejemplo:
```json
{
  "differentials": ["Migraine", "Tension Headache"],
  "priority": "medium",
  "tests_needed": ["CBC", "MRI"]
}
```

Cuando se pida validation, retornar:
```json
{
  "approved": true,
  "flags": [],
  "urgency": 3
}
```

## Importante
- Decisiones SIEMPRE estructuradas (JSON), nunca texto
- Mostrar metadata: provider usado, confidence, latency
- Redux state debe ser visible y actualizado en tiempo real
- Fallback automático si "falla" (simular con 20% probabilidad)

## Resultado Esperado
Una visualización clara de cómo un gateway decisional:
1. Abstrae múltiples providers
2. Retorna solo decisiones estructuradas
3. Mantiene transparencia total vía Redux
4. Maneja fallbacks automáticamente
5. Trackea metadata de cada decisión

El usuario debe poder ver claramente el "thinking" del sistema transformado en decisiones JSON, no en texto.