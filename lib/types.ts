export type ResearchTrack = 'osint' | 'ach' | 'semiotics' | 'contagion';

export type SectorType = 'telecom' | 'finance' | 'aviation' | 'energy' | 'media';

export type ScenarioId = 'adaptation' | 'fragmentation' | 'fragility';

export type HypothesisId =
  | 'human_error'
  | 'infra_failure'
  | 'cyber_attack'
  | 'disinfo_cascade';

export type ReliabilityGrade = 'A1' | 'B2' | 'C3' | 'D4';

export type EvidencePolarity = 'falsifies' | 'neutral' | 'supports';

export type ThreatMechanismId =
  | 'bgp_spof'
  | 'algo_contagion'
  | 'narrative_swarm'
  | 'supply_choke'
  | 'ai_amplification';

export type PlatformLayerId =
  | 'cloud_routing'
  | 'financial_hft'
  | 'social_swarm'
  | 'energy_maritime'
  | 'discourse_media';

export interface GeoCoordinates {
  lat: number;
  lng: number;
  city: string;
  regionCode: string;
  asnOrHub: string;
}

export interface ACHEvidenceMap {
  human_error: { polarity: EvidencePolarity; weight: number; note: string };
  infra_failure: { polarity: EvidencePolarity; weight: number; note: string };
  cyber_attack: { polarity: EvidencePolarity; weight: number; note: string };
  disinfo_cascade: { polarity: EvidencePolarity; weight: number; note: string };
}

export interface ScenarioDelta {
  adaptation: number;
  fragmentation: number;
  fragility: number;
}

export type EpistemicTier =
  | 'documented'
  | 'plausible'
  | 'disputed'
  | 'speculative'
  | 'symbolic';

export type QKeyDomainId =
  | 'antiquity'
  | 'premodern'
  | 'extraterrestrials'
  | 'nazi_era'
  | 'mk_ultra'
  | 'depopulation'
  | 'false_flags'
  | 'weather_warfare'
  | 'trump_era';

export type AppLocale = 'ar' | 'en' | 'fr' | 'id' | 'vi';

export interface LiveEvent {
  id: string;
  sequence: number;
  timestamp: string;
  elapsedMinutes: number;
  title: string;
  summary: string;
  technicalDetails: string;
  sector: SectorType;
  track: ResearchTrack;
  threatMechanism: ThreatMechanismId;
  platformLayer: PlatformLayerId;
  coordinates: GeoCoordinates;
  sourceName: string;
  reliabilityGrade: ReliabilityGrade;
  epistemicTier?: EpistemicTier;
  qKeyDomain?: QKeyDomainId;
  spofNode: string;
  bgpAnomalyFlag: boolean;
  latencySpikeMs: number;
  marketImpactBps: number;
  disinfoVelocity: number;
  parentEventId: string | null;
  achEvidence: ACHEvidenceMap;
  scenarioDelta: ScenarioDelta;
  redTeamCounter: string;
  filmScene?: FilmSceneBeat;
  aiAnalyzed?: boolean;
}

export interface TrajectoryNode {
  id: string;
  label: string;
  sublabel: string;
  kind: 'event' | 'spof' | 'scenario' | 'forecast';
  x: number;
  y: number;
  sector?: SectorType;
  track?: ResearchTrack;
  scenarioId?: ScenarioId;
  threatMechanism?: ThreatMechanismId;
  reliabilityGrade?: ReliabilityGrade;
  active: boolean;
  sequence?: number;
}

export interface TrajectoryEdge {
  id: string;
  from: string;
  to: string;
  kind: 'causal' | 'spof_link' | 'scenario_projection' | 'forecast_vector';
  weight: number;
  label?: string;
  highlighted: boolean;
}

export interface TrajectoryGraph {
  nodes: TrajectoryNode[];
  edges: TrajectoryEdge[];
  activeSpofs: { name: string; eventCount: number; sectors: SectorType[] }[];
}

export interface ScenarioProbabilities {
  adaptation: number;
  fragmentation: number;
  fragility: number;
  dominant: ScenarioId;
  resilienceIndex: number;
  disinfoPressure: number;
  contagionRiskBps: number;
}

export interface MathEquationStep {
  id: string;
  name: string;
  formula: string;
  computedValue: number;
  unit: string;
  interpretation: string;
}

export interface MathTrajectoryMetrics {
  piConstant: number;
  piPhaseHarmonic: number;
  entropyBasePi: number;
  crossMapResonance: number;
  qanonClusterCoupling: number;
  economistVectorIndex: number;
  nextCascadeRiskPct: number;
  totalGeodesicSpanKm: number;
  equationSteps: MathEquationStep[];
}

export interface PlatformImpactSummary {
  id: PlatformLayerId;
  label: string;
  eventCount: number;
  pressurePct: number;
  dominantThreat: ThreatMechanismId;
}

export interface GeodesicArc {
  id: string;
  fromEventId: string;
  toEventId: string;
  fromCoords: GeoCoordinates;
  toCoords: GeoCoordinates;
  distanceKm: number;
  piPropagationIndex: number;
  highlighted: boolean;
}

export interface ForecastBranch {
  id: string;
  horizonLabel: string;
  etaMinutes: number;
  title: string;
  threatMechanism: ThreatMechanismId;
  targetScenario: ScenarioId;
  probability: number;
  mapLinkSummary: string;
  triggerCondition: string;
  projectedCoords: GeoCoordinates;
}

export interface HypothesisRanking {
  id: HypothesisId;
  label: string;
  description: string;
  falsificationScore: number;
  supportCount: number;
  falsifyCount: number;
  rank: number;
  isMostLikely: boolean;
}

export interface FilmSceneBeat {
  id: string;
  act: 'I' | 'II' | 'III';
  sceneNumber: number;
  timecode: string;
  location: string;
  title: string;
  protagonists: string;
  groundedReality: string;
  dramaticConflict: string;
  dialogueExcerpt: string;
  linkedEventId: string;
  dominantScenarioAtBeat: ScenarioId;
}

export interface SemioticMarker {
  id: string;
  artifactId: 'economist_2027' | 'narrative_map';
  code: string;
  title: string;
  visualElement: string;
  institutionalMeaning: string;
  macroIndicator: string;
  linkedScenario: ScenarioId;
  linkedThreat: ThreatMechanismId;
  piWeight: number;
  pairedMarkerId: string;
  xPercent: number;
  yPercent: number;
}

export interface EventDraftInput {
  title: string;
  summary: string;
  sector: SectorType;
  track: ResearchTrack;
  threatMechanism: ThreatMechanismId;
  platformLayer?: PlatformLayerId;
  epistemicTier?: EpistemicTier;
  qKeyDomain?: QKeyDomainId;
  city?: string;
  lat?: number;
  lng?: number;
  sourceName: string;
  reliabilityGrade: ReliabilityGrade;
  spofNode: string;
  parentEventId: string | null;
  marketImpactBps: number;
  latencySpikeMs: number;
  disinfoVelocity: number;
}

export interface RedTeamNote {
  id: string;
  eventId: string;
  authorRole: string;
  challenge: string;
  alternativeHypothesis: HypothesisId;
  createdAt: string;
}

export interface CommunityComment {
  id: string;
  eventId: string;
  authorHandle: string;
  kycVerified: boolean;
  tier: EpistemicTier;
  qKeyDomain: QKeyDomainId;
  body: string;
  createdAt: string;
}

export type SelectedMapItem =
  | { kind: 'event'; id: string }
  | { kind: 'forecast'; id: string }
  | { kind: 'global_signal'; id: string }
  | { kind: 'encrypted_node'; id: string };

export interface ScenarioStageStep {
  phase: string;
  title: string;
  detail: string;
  timeframe: string;
}

export interface FullScenarioDossier {
  kind: 'event' | 'forecast' | 'global_signal' | 'encrypted_node';
  id: string;
  badgeLabel: string;
  headline: string;
  subheadline: string;
  city: string;
  coordinatesLabel: string;
  platformLabel: string;
  threatLabel: string;
  epistemicTier: EpistemicTier;
  qKeyDomain: QKeyDomainId;
  scenarioId: ScenarioId;
  scenarioTitle: string;
  scenarioProbability: number;
  executiveNarrative: string;
  stages: ScenarioStageStep[];
  triggerOrCause: string;
  earlyWarning: string;
  dualMapInsight: string;
  backendSummary: string;
  filmScene: FilmSceneBeat;
  sourceEvent?: LiveEvent;
  sourceForecast?: ForecastBranch;
}

export interface GematriaResult {
  phrase: string;
  normalized: string;
  letterCount: number;
  englishOrdinal: number;
  reverseOrdinal: number;
  fullReduction: number;
  digitalRoot: number;
  reverseFullReduction: number;
  englishSumerian: number;
  jewishLatin: number;
  ordinalSumCheck: number;
  mirroredValues: number[];
}

export interface GematriaCollision {
  termA: string;
  cipherA: string;
  termB: string;
  cipherB: string;
  value: number;
}

export interface CoincidenceStats {
  ciphers: number;
  words: number;
  targets: number;
  rangeSize: number;
  trials: number;
  matchProbabilityPct: number;
}

export interface QClockProjection {
  dayOffset: number;
  sector: number;
  ring: number;
  angleDeg: number;
  radialMatchOffset: number;
  oppositeSector: number;
  oppositeAngleDeg: number;
  oppositeDayOffset: number;
}

export interface VortexStep {
  exponent: number;
  powerOfTwo: number;
  digitalRoot: number;
}

export interface RiskScenarioInput {
  id?: string;
  title: string;
  threatCategory: 'supply_choke' | 'web_exploit' | 'ai_ransomware' | 'payment_liquidity';
  severity: number; // 1-10
  probabilityPct: number; // 1-100
  dependencyFactor: number; // 1-10
  estimatedUsdCost: number;
  piUsdMedianPrice: number;
  oracleSpreadPct: number;
}

export interface GeneratedSolutionBundle {
  riskScorePct: number;
  riskLevel: 'critical' | 'high' | 'moderate';
  oracleStatus: 'healthy' | 'spread_warning';
  estimatedPiCost: number;
  precautionarySteps: string[];
  mcpAgentCode: string;
  agentsMarkdown: string;
  soloHostManifest: string;
  sorobanContractCode: string;
  subscriptionSpecJson: string;
}

export interface GovernanceProposal {
  id: string;
  title: string;
  kind: 'mcp_agent' | 'soroban_contract' | 'pirc2_subscription';
  riskScorePct: number;
  pricePi: number;
  status: 'sandbox_passed' | 'voting' | 'staged_rollout';
  votesFor: number;
  votesAgainst: number;
  quorumRequired: number;
  summary: string;
  artifactSnippet: string;
}

export type MapLayerKey =
  | 'live_events'
  | 'global_sensors'
  | 'subsea_chokepoints'
  | 'encrypted_maps';

export type TimeRangeKey = '1h' | '6h' | '24h' | '48h' | '7d' | 'all';

export type RegionViewKey = 'global' | 'mena' | 'europe' | 'americas' | 'asia';

export interface GlobalSensedSignal {
  id: string;
  source: 'USGS_Seismic' | 'NASA_EONET' | 'OSINT_Relay';
  category: 'seismic' | 'natural_hazard' | 'cyber_infra' | 'maritime';
  title: string;
  locationName: string;
  lat: number;
  lng: number;
  magnitudeOrSeverity: number;
  severityLabel: string;
  publishedAtIso: string;
  ageHours: number;
  url?: string;
  gematriaOrdinal: number;
  gematriaReduction: number;
  piResonanceIndex: number;
  nearestEncryptedId: string;
  distanceToEncryptedKm: number;
  epistemicTier: EpistemicTier;
}

export interface EncryptedMapNode {
  id: string;
  mapSource: 'great_awakening' | 'economist_2027' | 'q_web' | 'baal_grid';
  codeSymbol: string;
  titleAr: string;
  titleEn: string;
  city: string;
  lat: number;
  lng: number;
  gematriaPhrase: string;
  qClockSector: number;
  piHarmonicFactor: number;
  verifiedInfraFactAr: string;
  codedNarrativeReadingAr: string;
  epistemicTier: EpistemicTier;
  qKeyDomain: QKeyDomainId;
}

export interface SubseaCableSpan {
  id: string;
  name: string;
  from: { lat: number; lng: number; city: string };
  to: { lat: number; lng: number; city: string };
  capacityTbps: number;
  status: 'nominal' | 'elevated_watch';
}

export interface ChokepointNode {
  id: string;
  nameAr: string;
  nameEn: string;
  lat: number;
  lng: number;
  dailyOilFlowPct: number;
  status: 'monitoring' | 'elevated' | 'critical';
}

export interface SignalCorrelationMatch {
  signalId: string;
  signalTitle: string;
  encryptedNodeId: string;
  encryptedTitle: string;
  distanceKm: number;
  piCouplingScore: number;
  qClockAligned: boolean;
}

export type CloudAgentMode =
  | 'hermes_hunter'
  | 'solohost_defender'
  | 'cipher_sentinel';

export interface CloudAgentRunResult {
  runId: string;
  agentMode: CloudAgentMode;
  executedIn: 'cloud_serverless_no_pc';
  startedAtUtc: string;
  region: RegionViewKey;
  compositeRiskPct: number;
  gematriaSignature: {
    phrase: string;
    ordinal: number;
    fullReduction: number;
    sumerian: number;
  };
  qClockSector: number;
  nearestCorrelations: SignalCorrelationMatch[];
  missionBriefAr: string;
  missionBriefEn: string;
  missionBriefLocalized?: string;
  recommendedActions: string[];
  sha256Proof: string;
  x402Settlement: {
    scheme: 'batch-settlement';
    microFeePi: string;
    txHash: string;
  };
  usedGemini: boolean;
}
