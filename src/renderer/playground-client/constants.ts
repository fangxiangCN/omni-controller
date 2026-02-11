export const dataExtractionAPIs = [
  'aiQuery',
  'aiBoolean',
  'aiNumber',
  'aiString',
  'aiAsk',
]

export const validationAPIs = ['aiAssert', 'aiWaitFor']

export const noReplayAPIs = [...dataExtractionAPIs, ...validationAPIs]
