const state = {
  mode: "guarded",
  activeTab: "overview",
  uiLanguage: localStorage.getItem("research-intel-ui-language") || "en",
  providerOptions: [],
  defaultProvider: "openai",
  defaultModel: "gpt-5.5",
  runtimeProvider: null,
  runtimeModel: null,
  selectedBaseVisualId: null,
  stagedUploadFiles: [],
  currentCase: null,
  currentUser: null,
  cases: [],
  users: []
};

const translations = {
  en: {
    uiLanguageLabel: "Interface language",
    secureAccess: "Secure Access",
    appTitle: "UAEICP Employee Intelligence Workspace",
    authCopy: "Sign in to review internal documents, service requests, circulars, policy material, and employee tasks with grounded AI support.",
    emailLabel: "Email",
    passwordLabel: "Password",
    signIn: "Sign In",
    signOut: "Sign Out",
    researchWorkspace: "UAEICP Workspace",
    newWorkspace: "New Workspace",
    analyzeNewSet: "Start an employee workspace",
    workspaceTitle: "Workspace title",
    workspaceTitlePlaceholder: "Policy circular / service request / internal memo",
    workspaceType: "Workspace type",
    workspaceTypeGeneral: "Employee support",
    workspaceTypeStartup: "Employee support",
    workspaceTypeHelp: "Use one workspace for UAEICP documents, requests, policies, memos, circulars, and employee task support.",
    workspaceLanguage: "Workspace language",
    workspaceLanguageHelp: "Analysis and answers will be generated in this language.",
    analysisDepth: "Analysis depth",
    analysisDepthQuick: "Quick",
    analysisDepthDeep: "Deep",
    analysisDepthHelp: "Quick gets you to a grounded first pass faster. Deep spends more time on retrieval and reasoning.",
    guarded: "Guarded",
    unguarded: "Unguarded",
    guardedHelp: "Evidence-first analysis for defensible summaries, missing requirements, contradictions, and grounded employee answers.",
    unguardedHelp: "Exploratory analysis for possible interpretations, process improvements, anomalies, and next-step options.",
    documentsLabel: "Documents",
    documentsHelp: "Select multiple files at once, or add more files in separate picks before analyzing.",
    analysisFocus: "Analysis focus",
    analysisFocusHelp: "One secure workspace for UAEICP employees to analyze documents, summarize service requests, compare policy material, draft internal outputs, and ask follow-up questions.",
    providerLabel: "Provider",
    modelLabel: "Model",
    askWorkspace: "Ask The Workspace",
    answerGenerated: "Answer generated.",
    answerCached: "Answer returned from cache.",
    noQuestionsYet: "No questions asked yet.",
    keyPoints: "Key points",
    supportingPoints: "Supporting points",
    counterpoints: "Counterpoints",
    speculativeLeads: "Speculative leads",
    nextQuestions: "Next questions",
    uncertaintyHandling: "Uncertainty handling",
    verificationRequired: "Verification required",
    citationPending: "Citation pending",
    noDocumentsSelected: "No documents selected yet.",
    uploadAnalyze: "Upload And Analyze"
  },
  ar: {
    uiLanguageLabel: "\u0644\u063a\u0629 \u0627\u0644\u0648\u0627\u062c\u0647\u0629",
    secureAccess: "\u062f\u062e\u0648\u0644 \u0622\u0645\u0646",
    appTitle: "\u0645\u0633\u0627\u062d\u0629 \u0630\u0643\u0627\u0621 \u0645\u0648\u0638\u0641\u064a UAEICP",
    authCopy: "\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0627\u0644\u062f\u0627\u062e\u0644\u064a\u0629 \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062a \u0648\u0627\u0644\u062a\u0639\u0627\u0645\u064a\u0645 \u0648\u0627\u0644\u0633\u064a\u0627\u0633\u0627\u062a \u0648\u0645\u0647\u0627\u0645 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646 \u0628\u062f\u0639\u0645 \u0630\u0643\u0627\u0621 \u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0645\u0633\u062a\u0646\u062f \u0625\u0644\u0649 \u0627\u0644\u0623\u062f\u0644\u0629.",
    emailLabel: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
    passwordLabel: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    signIn: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
    signOut: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c",
    researchWorkspace: "\u0645\u0633\u0627\u062d\u0629 UAEICP",
    newWorkspace: "\u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644 \u062c\u062f\u064a\u062f\u0629",
    analyzeNewSet: "\u0627\u0628\u062f\u0623 \u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644 \u0644\u0644\u0645\u0648\u0638\u0641",
    workspaceTitle: "\u0639\u0646\u0648\u0627\u0646 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0639\u0645\u0644",
    workspaceTitlePlaceholder: "\u062a\u0639\u0645\u064a\u0645 / \u0637\u0644\u0628 \u062e\u062f\u0645\u0629 / \u0645\u0630\u0643\u0631\u0629 \u062f\u0627\u062e\u0644\u064a\u0629",
    workspaceType: "\u0646\u0648\u0639 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0639\u0645\u0644",
    workspaceTypeGeneral: "\u062f\u0639\u0645 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646",
    workspaceTypeStartup: "\u062f\u0639\u0645 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646",
    workspaceTypeUnified: "\u062f\u0639\u0645 \u0645\u0648\u0638\u0641\u064a UAEICP",
    workspaceTypeHelp: "\u0627\u0633\u062a\u062e\u062f\u0645 \u0645\u0633\u0627\u062d\u0629 \u0648\u0627\u062d\u062f\u0629 \u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a UAEICP \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062a \u0648\u0627\u0644\u0633\u064a\u0627\u0633\u0627\u062a \u0648\u0627\u0644\u0645\u0630\u0643\u0631\u0627\u062a \u0648\u0627\u0644\u062a\u0639\u0627\u0645\u064a\u0645 \u0648\u0645\u0647\u0627\u0645 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646.",
    workspaceLanguage: "\u0644\u063a\u0629 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0639\u0645\u0644",
    workspaceLanguageHelp: "\u0633\u064a\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062a\u062d\u0644\u064a\u0644 \u0648\u0627\u0644\u0625\u062c\u0627\u0628\u0627\u062a \u0628\u0647\u0630\u0647 \u0627\u0644\u0644\u063a\u0629.",
    analysisDepth: "\u0639\u0645\u0642 \u0627\u0644\u062a\u062d\u0644\u064a\u0644",
    analysisDepthQuick: "\u0633\u0631\u064a\u0639",
    analysisDepthDeep: "\u0639\u0645\u064a\u0642",
    analysisDepthHelp: "\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0633\u0631\u064a\u0639 \u064a\u0639\u0637\u064a \u0642\u0631\u0627\u0621\u0629 \u0623\u0648\u0644\u064a\u0629 \u0623\u0633\u0631\u0639. \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0639\u0645\u064a\u0642 \u064a\u062e\u0635\u0635 \u0648\u0642\u062a\u064b\u0627 \u0623\u0643\u0628\u0631 \u0644\u0644\u0627\u0633\u062a\u0631\u062c\u0627\u0639 \u0648\u0627\u0644\u0627\u0633\u062a\u062f\u0644\u0627\u0644.",
    guarded: "\u0645\u0642\u064a\u0651\u062f",
    unguarded: "\u063a\u064a\u0631 \u0645\u0642\u064a\u0651\u062f",
    guardedHelp: "\u062a\u062d\u0644\u064a\u0644 \u064a\u0639\u062a\u0645\u062f \u0639\u0644\u0649 \u0627\u0644\u0623\u062f\u0644\u0629 \u0623\u0648\u0644\u064b\u0627 \u0644\u0644\u0645\u0644\u062e\u0635\u0627\u062a \u0648\u0627\u0644\u0645\u062a\u0637\u0644\u0628\u0627\u062a \u0627\u0644\u0646\u0627\u0642\u0635\u0629 \u0648\u0627\u0644\u062a\u0639\u0627\u0631\u0636\u0627\u062a \u0648\u0627\u0644\u0625\u062c\u0627\u0628\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0629 \u0625\u0644\u0649 \u0627\u0644\u0645\u0644\u0641\u0627\u062a.",
    unguardedHelp: "\u062a\u062d\u0644\u064a\u0644 \u0627\u0633\u062a\u0643\u0634\u0627\u0641\u064a \u0644\u0644\u062a\u0641\u0633\u064a\u0631\u0627\u062a \u0627\u0644\u0645\u062d\u062a\u0645\u0644\u0629 \u0648\u0627\u0644\u062a\u062d\u0633\u064a\u0646\u0627\u062a \u0648\u0645\u0648\u0627\u0637\u0646 \u0627\u0644\u063a\u0645\u0648\u0636 \u0648\u062e\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u062e\u0637\u0648\u0627\u062a \u0627\u0644\u062a\u0627\u0644\u064a\u0629.",
    documentsLabel: "\u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a",
    documentsHelp: "\u064a\u0645\u0643\u0646\u0643 \u0627\u062e\u062a\u064a\u0627\u0631 \u0639\u062f\u0629 \u0645\u0644\u0641\u0627\u062a \u062f\u0641\u0639\u0629 \u0648\u0627\u062d\u062f\u0629\u060c \u0623\u0648 \u0625\u0636\u0627\u0641\u0629 \u0645\u0644\u0641\u0627\u062a \u0623\u062e\u0631\u0649 \u0642\u0628\u0644 \u0628\u062f\u0621 \u0627\u0644\u062a\u062d\u0644\u064a\u0644.",
    analysisFocus: "\u0646\u0637\u0627\u0642 \u0627\u0644\u062a\u062d\u0644\u064a\u0644",
    analysisFocusHelp: "\u0645\u0633\u0627\u062d\u0629 \u0622\u0645\u0646\u0629 \u0644\u0645\u0648\u0638\u0641\u064a UAEICP \u0644\u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a\u060c \u062a\u0644\u062e\u064a\u0635 \u0637\u0644\u0628\u0627\u062a \u0627\u0644\u062e\u062f\u0645\u0629\u060c \u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u0633\u064a\u0627\u0633\u0627\u062a\u060c \u0625\u0639\u062f\u0627\u062f \u0627\u0644\u0645\u062e\u0631\u062c\u0627\u062a \u0627\u0644\u062f\u0627\u062e\u0644\u064a\u0629\u060c \u0648\u0637\u0631\u062d \u0623\u0633\u0626\u0644\u0629 \u0645\u062a\u0627\u0628\u0639\u0629.",
    providerLabel: "\u0645\u0632\u0648\u062f \u0627\u0644\u0646\u0645\u0648\u0630\u062c",
    modelLabel: "\u0627\u0644\u0646\u0645\u0648\u0630\u062c",
    askWorkspace: "\u0627\u0633\u0623\u0644 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0639\u0645\u0644",
    answerGenerated: "\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0625\u062c\u0627\u0628\u0629.",
    answerCached: "\u062a\u0645\u062a \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0625\u062c\u0627\u0628\u0629 \u0645\u0646 \u0627\u0644\u0630\u0627\u0643\u0631\u0629 \u0627\u0644\u0645\u0624\u0642\u062a\u0629.",
    noQuestionsYet: "\u0644\u0645 \u064a\u062a\u0645 \u0637\u0631\u062d \u0623\u064a \u0623\u0633\u0626\u0644\u0629 \u0628\u0639\u062f.",
    keyPoints: "\u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
    supportingPoints: "\u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u062f\u0627\u0639\u0645\u0629",
    counterpoints: "\u0646\u0642\u0627\u0637 \u0645\u0642\u0627\u0628\u0644\u0629",
    speculativeLeads: "\u0627\u062d\u062a\u0645\u0627\u0644\u0627\u062a \u0627\u0633\u062a\u0643\u0634\u0627\u0641\u064a\u0629",
    nextQuestions: "\u0623\u0633\u0626\u0644\u0629 \u062a\u0627\u0644\u064a\u0629",
    uncertaintyHandling: "\u0627\u0644\u062a\u0639\u0627\u0645\u0644 \u0645\u0639 \u0639\u062f\u0645 \u0627\u0644\u064a\u0642\u064a\u0646",
    verificationRequired: "\u062a\u062a\u0637\u0644\u0628 \u0645\u0631\u0627\u062c\u0639\u0629",
    citationPending: "\u0627\u0644\u0627\u0633\u062a\u0634\u0647\u0627\u062f \u0642\u064a\u062f \u0627\u0644\u0625\u0636\u0627\u0641\u0629",
    noDocumentsSelected: "\u0644\u0645 \u064a\u062a\u0645 \u0627\u062e\u062a\u064a\u0627\u0631 \u0623\u064a \u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0628\u0639\u062f.",
    uploadAnalyze: "\u0627\u0631\u0641\u0639 \u0648\u062d\u0644\u0651\u0644"
  }
};

const authScreen = document.querySelector("#auth-screen");
const appScreen = document.querySelector("#app-screen");
const healthPill = document.querySelector("#health-pill");
const adminHint = document.querySelector("#admin-hint");
const loginForm = document.querySelector("#login-form");
const loginStatus = document.querySelector("#login-status");
const logoutButton = document.querySelector("#logout-button");
const authLanguageSelect = document.querySelector("#auth-language-select");
const appLanguageSelect = document.querySelector("#app-language-select");

const currentUserName = document.querySelector("#current-user-name");
const currentUserRole = document.querySelector("#current-user-role");
const profileForm = document.querySelector("#profile-form");
const profileStatus = document.querySelector("#profile-status");
const adminPanel = document.querySelector("#admin-panel");
const userForm = document.querySelector("#user-form");
const userStatus = document.querySelector("#user-status");
const userList = document.querySelector("#user-list");

const caseForm = document.querySelector("#case-form");
const documentsInput = document.querySelector("#documents");
const selectedFiles = document.querySelector("#selected-files");
const formStatus = document.querySelector("#form-status");
const historyList = document.querySelector("#history-list");
const llmProviderSelect = document.querySelector("#llm-provider");
const llmModelSelect = document.querySelector("#llm-model");

const workspace = document.querySelector("#workspace");
const workspacePanel = document.querySelector(".workspace-panel");
const emptyState = document.querySelector("#empty-state");
const workspaceCrumb = document.querySelector("#workspace-crumb");
const workspaceTitle = document.querySelector("#workspace-title");
const workspaceSubtitle = document.querySelector("#workspace-subtitle");
const workspaceMode = document.querySelector("#workspace-mode");
const workspaceDepth = document.querySelector("#workspace-depth");
const workspaceTypePill = document.querySelector("#workspace-type-pill");
const workspaceLanguagePill = document.querySelector("#workspace-language-pill");
const workspaceProviderPill = document.querySelector("#workspace-provider-pill");
const workspaceModelPill = document.querySelector("#workspace-model-pill");
const workspaceFileCount = document.querySelector("#workspace-file-count");
const workspaceOwner = document.querySelector("#workspace-owner");
const workspaceConfidence = document.querySelector("#workspace-confidence");
const workspaceStatus = document.querySelector("#workspace-status");
const reanalyzeButton = document.querySelector("#reanalyze-button");
const exportButton = document.querySelector("#export-button");
const archiveButton = document.querySelector("#archive-button");
const deleteButton = document.querySelector("#delete-button");
const quickReanalyzeButton = document.querySelector("#quick-reanalyze-button");
const quickExportButton = document.querySelector("#quick-export-button");
const quickArchiveButton = document.querySelector("#quick-archive-button");
const quickDeleteButton = document.querySelector("#quick-delete-button");
const workspaceActionStatus = document.querySelector("#workspace-action-status");
const workspaceProgress = document.querySelector("#workspace-progress");
const questionForm = document.querySelector("#question-form");
const questionInput = document.querySelector("#question-input");
const qaStatus = document.querySelector("#qa-status");
const qaList = document.querySelector("#qa-list");
const chatProgress = document.querySelector("#chat-progress");
const reviewForm = document.querySelector("#review-form");
const reviewStatusText = document.querySelector("#review-status-text");
const reviewList = document.querySelector("#review-list");
const agentTaskForm = document.querySelector("#agent-task-form");
const agentTaskTitleInput = document.querySelector("#agent-task-title");
const agentOutputFilenameInput = document.querySelector("#agent-output-filename");
const agentOutputFormatInput = document.querySelector("#agent-output-format");
const agentLlmProviderSelect = document.querySelector("#agent-llm-provider");
const agentLlmModelSelect = document.querySelector("#agent-llm-model");
const agentTaskInstructionsInput = document.querySelector("#agent-task-instructions");
const agentTaskStatus = document.querySelector("#agent-task-status");
const agentTaskProgress = document.querySelector("#agent-task-progress");
const agentTaskList = document.querySelector("#agent-task-list");
const visualForm = document.querySelector("#visual-form");
const visualTypeInput = document.querySelector("#visual-type");
const visualGenerationModeInput = document.querySelector("#visual-generation-mode");
const visualAspectRatioInput = document.querySelector("#visual-aspect-ratio");
const visualPromptInput = document.querySelector("#visual-prompt");
const visualStatus = document.querySelector("#visual-status");
const visualProgress = document.querySelector("#visual-progress");
const visualGallery = document.querySelector("#visual-gallery");
const visualBaseNote = document.querySelector("#visual-base-note");

const summaryText = document.querySelector("#summary-text");
const theoryText = document.querySelector("#theory-text");
const uncertaintyText = document.querySelector("#uncertainty-text");
const metricFindings = document.querySelector("#metric-findings");
const metricEvidence = document.querySelector("#metric-evidence");
const metricContradictions = document.querySelector("#metric-contradictions");
const metricQuestions = document.querySelector("#metric-questions");
const scorecardList = document.querySelector("#scorecard-list");
const strengthsList = document.querySelector("#strengths-list");
const weaknessesList = document.querySelector("#weaknesses-list");
const opportunitiesList = document.querySelector("#opportunities-list");
const risksList = document.querySelector("#risks-list");
const prioritiesList = document.querySelector("#priorities-list");
const ingestionSummary = document.querySelector("#ingestion-summary");
const groundingSummary = document.querySelector("#grounding-summary");
const findingsList = document.querySelector("#findings-list");
const evidenceList = document.querySelector("#evidence-list");
const contradictionsList = document.querySelector("#contradictions-list");
const entitiesList = document.querySelector("#entities-list");
const timelineList = document.querySelector("#timeline-list");
const questionsList = document.querySelector("#questions-list");
const suggestedList = document.querySelector("#suggested-list");
const warningsList = document.querySelector("#warnings-list");
const promptChipList = document.querySelector("#prompt-chip-list");
const fileLibraryList = document.querySelector("#file-library-list");
const statActive = document.querySelector("#stat-active");
const statIndexed = document.querySelector("#stat-indexed");
const statAnalyses = document.querySelector("#stat-analyses");
const statSources = document.querySelector("#stat-sources");
const newWorkspaceButton = document.querySelector("#new-workspace-button");

document.querySelectorAll(".workspace-tab").forEach((button) => {
  button.addEventListener("click", () => setActiveTab(button.dataset.tab || "overview", { scrollIntoView: true }));
});
if (newWorkspaceButton) {
  newWorkspaceButton.addEventListener("click", () => {
    document.querySelector("#case-title").scrollIntoView({ behavior: "smooth", block: "center" });
    document.querySelector("#case-title").focus();
  });
}

document.querySelectorAll(".mode-button").forEach((button) => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    syncModeButtons();
  });
});

documentsInput.addEventListener("change", mergeSelectedFiles);
llmProviderSelect.addEventListener("change", () => {
  renderModelOptions(llmProviderSelect.value);
  state.runtimeProvider = llmProviderSelect.value;
  state.runtimeModel = llmModelSelect.value;
});
llmModelSelect.addEventListener("change", () => {
  state.runtimeProvider = llmProviderSelect.value;
  state.runtimeModel = llmModelSelect.value;
});
if (agentLlmProviderSelect) {
  agentLlmProviderSelect.addEventListener("change", () => {
    renderAgentModelOptions(agentLlmProviderSelect.value);
  });
}
if (agentOutputFormatInput) {
  agentOutputFormatInput.addEventListener("change", () => {
    syncAgentProviderForOutputFormat();
  });
}
authLanguageSelect.addEventListener("change", () => setUiLanguage(authLanguageSelect.value));
appLanguageSelect.addEventListener("change", () => setUiLanguage(appLanguageSelect.value));
loginForm.addEventListener("submit", login);
logoutButton.addEventListener("click", logout);
caseForm.addEventListener("submit", createCase);
reanalyzeButton.addEventListener("click", rerunAnalysis);
exportButton.addEventListener("click", exportWorkspace);
archiveButton.addEventListener("click", archiveWorkspace);
deleteButton.addEventListener("click", deleteWorkspace);
if (quickReanalyzeButton) quickReanalyzeButton.addEventListener("click", rerunAnalysis);
if (quickExportButton) quickExportButton.addEventListener("click", exportWorkspace);
if (quickArchiveButton) quickArchiveButton.addEventListener("click", archiveWorkspace);
if (quickDeleteButton) quickDeleteButton.addEventListener("click", deleteWorkspace);
questionForm.addEventListener("submit", askQuestion);
profileForm.addEventListener("submit", saveProfile);
userForm.addEventListener("submit", createUser);
reviewForm.addEventListener("submit", saveReview);
if (agentTaskForm) {
  agentTaskForm.addEventListener("submit", runAgentTask);
}
if (visualForm) {
  visualForm.addEventListener("submit", generateVisual);
}
document.querySelectorAll(".agent-prompt-chip").forEach((button) => {
  button.addEventListener("click", () => {
    if (agentTaskTitleInput) {
      agentTaskTitleInput.value = button.dataset.agentTitle || "";
    }
    if (agentTaskInstructionsInput) {
      agentTaskInstructionsInput.value = button.dataset.agentInstructions || "";
      agentTaskInstructionsInput.focus();
    }
    if (agentOutputFormatInput && button.dataset.agentFormat) {
      agentOutputFormatInput.value = button.dataset.agentFormat;
    }
    if (agentLlmProviderSelect && button.dataset.agentProvider) {
      agentLlmProviderSelect.value = button.dataset.agentProvider;
      renderAgentModelOptions(button.dataset.agentProvider);
      const providerConfig = getProviderConfig(button.dataset.agentProvider);
      if (providerConfig && !providerConfig.enabled) {
        setStatus(agentTaskStatus, "Claude is recommended for this deck, but ANTHROPIC_API_KEY is not configured yet.", true);
      }
    } else {
      syncAgentProviderForOutputFormat();
    }
    if (agentOutputFilenameInput && button.dataset.agentFilename) {
      agentOutputFilenameInput.value = button.dataset.agentFilename;
    }
  });
});
if (visualGenerationModeInput) {
  visualGenerationModeInput.addEventListener("change", syncVisualGenerationMode);
}
document.querySelectorAll(".visual-preset-chip").forEach((button) => {
  button.addEventListener("click", () => {
    if (visualPromptInput) {
      visualPromptInput.value = button.dataset.visualPrompt || "";
      visualPromptInput.focus();
    }
  });
});

let progressTimer = null;

async function boot() {
  setUiLanguage(state.uiLanguage);
  await loadHealth();
  await restoreSession();
}

async function loadHealth() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    state.providerOptions = data.providerOptions || [];
    state.defaultProvider = data.defaults?.provider || "openai";
    state.defaultModel = data.defaults?.model || "gpt-5.5";
    state.runtimeProvider = state.defaultProvider;
    state.runtimeModel = state.defaultModel;
    healthPill.textContent = data.configured
      ? `${String(data.provider || "openai").toUpperCase()} ready - model ${data.model}`
      : "Add OPENAI_API_KEY or enable Ollama in .env before using the app";
    healthPill.classList.add(data.configured ? "ready" : "missing");
    adminHint.textContent = `Default admin: ${data.adminEmail} / ChangeMe123! unless overridden in .env`;
    adminHint.classList.remove("hidden");
  if (llmProviderSelect) {
    llmProviderSelect.value = state.defaultProvider;
    renderModelOptions(state.defaultProvider, state.defaultModel);
  }
  initializeAgentModelSelector();
  state.runtimeProvider = state.defaultProvider;
  state.runtimeModel = state.defaultModel;
  } catch (_error) {
    healthPill.textContent = "Could not reach the local server";
    healthPill.classList.add("missing");
  }
}

async function restoreSession() {
  try {
    const response = await fetch("/api/auth/me");
    if (!response.ok) {
      showAuthScreen();
      return;
    }

    const data = await response.json();
    state.currentUser = data.user;
    showAppScreen();
    await loadCases();
    if (state.currentUser.role === "admin") {
      await loadUsers();
    }
  } catch (_error) {
    showAuthScreen();
  }
}

async function login(event) {
  event.preventDefault();
  setButtonLoading(document.querySelector("#login-button"), true, "Signing In...");
  setStatus(loginStatus, "Signing in...");

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: document.querySelector("#login-email").value,
        password: document.querySelector("#login-password").value
      })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed.");
    }

    state.currentUser = data.user;
    loginForm.reset();
    showAppScreen();
    await loadCases();
    if (state.currentUser.role === "admin") {
      await loadUsers();
    }
  } catch (error) {
    setStatus(loginStatus, error.message || "Login failed.", true);
  } finally {
    setButtonLoading(document.querySelector("#login-button"), false, "Sign In");
  }
}

async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  state.currentUser = null;
  state.currentCase = null;
  state.cases = [];
  state.users = [];
  clearWorkspace();
  showAuthScreen();
}

async function loadCases(selectCaseId, options = {}) {
  const response = await fetch("/api/cases");
  const data = await response.json();

  if (!response.ok) {
    setStatus(formStatus, data.error || "Could not load history.", true);
    return;
  }

  state.cases = data.cases;
  renderSidebarStats();
  renderHistory();

  const targetCaseId = selectCaseId || (state.currentCase ? state.currentCase.id : null);
  if (targetCaseId) {
    await loadCase(targetCaseId, options);
  } else {
    clearWorkspace();
  }
}

async function loadCase(caseId, options = {}) {
  const response = await fetch(`/api/cases/${caseId}`);
  const data = await response.json();

  if (!response.ok) {
    setStatus(formStatus, data.error || "Could not load workspace.", true);
    return;
  }

  state.currentCase = data;
  state.mode = data.mode;
  document.querySelector("#workspace-type").value = data.workspaceType || "general";
  syncWorkspaceLanguageToInterface();
  document.querySelector("#analysis-depth").value = data.analysisDepth || "quick";
  const preserveRuntimeModel = Boolean(options.preserveRuntimeModel);
  const nextProvider = preserveRuntimeModel
    ? (options.provider || state.runtimeProvider || data.llmProvider || state.defaultProvider)
    : (data.llmProvider || state.defaultProvider);
  const nextModel = preserveRuntimeModel
    ? (options.model || state.runtimeModel || data.llmModel || state.defaultModel)
    : (data.llmModel || state.defaultModel);
  if (llmProviderSelect) {
    llmProviderSelect.value = nextProvider;
    renderModelOptions(nextProvider, nextModel);
  }
  state.runtimeProvider = llmProviderSelect.value;
  state.runtimeModel = llmModelSelect.value;
  syncModeButtons();
  if (!document.querySelector(`.workspace-tab[data-tab="${state.activeTab}"]`)) {
    state.activeTab = "overview";
  }
  renderCase(data);
  renderHistory();
}

async function loadUsers() {
  const response = await fetch("/api/users");
  const data = await response.json();

  if (!response.ok) {
    return;
  }

  state.users = data.users;
  renderUsers();
}

async function createUser(event) {
  event.preventDefault();
  setButtonLoading(document.querySelector("#create-user-button"), true, tr("creatingUser"));
  setStatus(userStatus, tr("creatingUser"));

  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: document.querySelector("#user-name").value,
        email: document.querySelector("#user-email").value,
        password: document.querySelector("#user-password").value,
        role: document.querySelector("#user-role").value
      })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "User creation failed.");
    }

    userForm.reset();
    setStatus(userStatus, tr("userCreated"));
    await loadUsers();
  } catch (error) {
    setStatus(userStatus, error.message || tr("userCreationFailed"), true);
  } finally {
    setButtonLoading(document.querySelector("#create-user-button"), false, tr("createUser"));
  }
}

function renderUsers() {
  userList.innerHTML = state.users.length
    ? state.users
        .map(
          (user) => `
            <div class="history-item">
              <strong>${escapeHtml(user.name)}</strong>
              <span>${escapeHtml(user.email)}</span>
              <span>${escapeHtml(user.role)}</span>
            </div>
          `
        )
        .join("")
    : `<div class="history-empty">${escapeHtml(tr("noUsersYet"))}</div>`;
}

async function createCase(event) {
  event.preventDefault();

  const files = state.stagedUploadFiles.slice();
  const intakeText = String(document.querySelector("#intake-text")?.value || "").trim();
  if (!files.length && !intakeText) {
    setStatus(formStatus, state.uiLanguage === "ar" ? "أضف مستندات أو اكتب وصفًا للمشروع أولًا." : "Add documents or enter a project brief first.", true);
    return;
  }

  const payload = new FormData();
  payload.append("mode", state.mode);
  payload.append("workspaceType", document.querySelector("#workspace-type").value);
  payload.append("workspaceLanguage", getActiveWorkspaceLanguage());
  payload.append("title", document.querySelector("#case-title").value);
  payload.append("analysisDepth", document.querySelector("#analysis-depth").value);
  payload.append("llmProvider", llmProviderSelect.value);
  payload.append("llmModel", llmModelSelect.value);
  payload.append("intakeText", intakeText);
  files.forEach((file) => payload.append("documents", file));

  setStatus(formStatus, state.uiLanguage === "ar" ? "جارٍ رفع الملفات وبناء مساحة العمل..." : "Uploading files and building the workspace...");
  startProgress([
    state.uiLanguage === "ar" ? "جارٍ التحقق من تنسيقات الملفات ودفعة الرفع..." : "Validating formats and upload batch...",
    state.uiLanguage === "ar" ? "جارٍ رفع المستندات..." : "Uploading documents...",
    state.uiLanguage === "ar" ? "جارٍ فهرسة المستندات للاسترجاع..." : "Indexing documents for retrieval...",
    state.uiLanguage === "ar" ? "جارٍ تشغيل تحليل موثق بالاستشهادات..." : "Running citation-grounded analysis..."
  ]);
  setButtonLoading(document.querySelector("#analyze-button"), true, tr("analyzing"));

  try {
    const response = await fetch("/api/cases", {
      method: "POST",
      body: payload
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Workspace creation failed.");
    }

    const result = await waitForJob(data.jobId, formStatus);
    await loadCase(result.caseId);
    caseForm.reset();
    state.stagedUploadFiles = [];
    documentsInput.value = "";
    renderSelectedFiles();
    setStatus(formStatus, state.uiLanguage === "ar" ? "اكتمل تحليل مساحة العمل." : "Workspace analysis complete.");
  } catch (error) {
    setStatus(formStatus, error.message || (state.uiLanguage === "ar" ? "فشل إنشاء مساحة العمل." : "Workspace creation failed."), true);
  } finally {
    stopProgress();
    setButtonLoading(document.querySelector("#analyze-button"), false, tr("uploadAnalyze"));
  }
}

async function rerunAnalysis() {
  if (!state.currentCase) {
    return;
  }

  document.querySelector(".workspace-action-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  setStatus(workspaceActionStatus, state.uiLanguage === "ar" ? `جارٍ إعادة تشغيل تحليل ${formatModeLabel(state.mode)}...` : `Re-running ${state.mode} analysis...`);
  setActiveTab("overview", { scrollIntoView: true });
  startProgress([
    state.uiLanguage === "ar" ? "جارٍ تحديث سياق الاسترجاع..." : "Refreshing retrieval context...",
    state.uiLanguage === "ar" ? "جارٍ إعادة فحص الأدلة والاستشهادات..." : "Re-checking evidence and citations...",
    state.uiLanguage === "ar" ? "جارٍ إعادة احتساب لوحة التحليل..." : "Recomputing analysis dashboard..."
  ], workspaceProgress);
  setButtonLoading(reanalyzeButton, true, tr("reanalyzing"));
  setButtonLoading(quickReanalyzeButton, true, tr("reanalyzing"));

  try {
    const response = await fetch(`/api/cases/${state.currentCase.id}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: state.mode,
        workspaceType: document.querySelector("#workspace-type").value,
        workspaceLanguage: getActiveWorkspaceLanguage(),
        analysisDepth: document.querySelector("#analysis-depth").value,
        llmProvider: llmProviderSelect.value,
        llmModel: llmModelSelect.value
      })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Re-analysis failed.");
    }

    const result = await waitForJob(data.jobId, workspaceActionStatus);
    await loadCase(result.caseId);
    setStatus(workspaceActionStatus, state.uiLanguage === "ar" ? "تم تحديث التحليل." : "Analysis refreshed.");
  } catch (error) {
    setStatus(workspaceActionStatus, error.message || (state.uiLanguage === "ar" ? "فشلت إعادة التحليل." : "Re-analysis failed."), true);
  } finally {
    stopProgress(workspaceProgress);
    setButtonLoading(reanalyzeButton, false, tr("rerunAnalysis"));
    setButtonLoading(quickReanalyzeButton, false, tr("rerunAnalysis"));
  }
}

async function askQuestion(event) {
  event.preventDefault();

  if (!state.currentCase) {
    setStatus(qaStatus, state.uiLanguage === "ar" ? "أنشئ مساحة عمل أو افتح واحدة قبل طرح الأسئلة." : "Create or open a workspace before asking questions.", true);
    return;
  }

  const question = questionInput.value.trim();
  if (!question) {
    setStatus(qaStatus, state.uiLanguage === "ar" ? "اكتب سؤالًا أولًا." : "Type a question first.", true);
    return;
  }

  setStatus(qaStatus, state.uiLanguage === "ar" ? "جارٍ تشغيل سؤال وجواب على المستندات..." : "Running document Q&A...");
  startProgress([
    state.uiLanguage === "ar" ? "جارٍ البحث داخل مجموعة المستندات..." : "Searching the document set...",
    state.uiLanguage === "ar" ? "جارٍ مقارنة الأدلة عبر المصادر..." : "Comparing evidence across sources...",
    state.uiLanguage === "ar" ? "جارٍ إعداد إجابة موثقة..." : "Preparing a cited answer..."
  ]);
  setButtonLoading(document.querySelector("#ask-button"), true, state.uiLanguage === "ar" ? "جارٍ التفكير..." : "Thinking...");

  try {
    const activeProvider = llmProviderSelect.value;
    const activeModel = llmModelSelect.value;
    const response = await fetch(`/api/cases/${state.currentCase.id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: state.mode,
        workspaceLanguage: getActiveWorkspaceLanguage(),
        llmProvider: activeProvider,
        llmModel: activeModel,
        question
      })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Question failed.");
    }

    state.currentCase.qa = [data, ...(state.currentCase.qa || [])];
    renderQa(state.currentCase.qa);
    questionInput.value = "";
    state.runtimeProvider = activeProvider;
    state.runtimeModel = activeModel;
    await loadCases(state.currentCase.id, { preserveRuntimeModel: true, provider: activeProvider, model: activeModel });
    setStatus(qaStatus, data.cached ? tr("answerCached") : tr("answerGenerated"));
  } catch (error) {
    setStatus(qaStatus, error.message || "Question failed.", true);
  } finally {
    stopProgress();
    setButtonLoading(document.querySelector("#ask-button"), false, tr("askWorkspace"));
  }
}

async function runAgentTask(event) {
  event.preventDefault();

  if (!state.currentCase) {
    setStatus(agentTaskStatus, "Open a workspace before launching an agent task.", true);
    return;
  }

  const title = (agentTaskTitleInput?.value || "").trim();
  const instructions = (agentTaskInstructionsInput?.value || "").trim();
  const outputFilename = (agentOutputFilenameInput?.value || "").trim();
  const inferredFormat = inferAgentOutputFormat(instructions, agentOutputFormatInput?.value || "markdown");
  if (agentOutputFormatInput) {
    agentOutputFormatInput.value = inferredFormat;
  }
  if (inferredFormat === "pptx") {
    syncAgentProviderForOutputFormat();
  }
  const outputFormat = inferredFormat;
  const agentProvider = agentLlmProviderSelect?.value || llmProviderSelect.value;
  const agentModel = agentLlmModelSelect?.value || llmModelSelect.value;
  if (!instructions) {
    setStatus(agentTaskStatus, "Describe the task you want the agent to complete first.", true);
    return;
  }

    setActiveTab("studio", { scrollIntoView: true });
  setStatus(agentTaskStatus, "Launching workspace agent...");
  startProgress([
    "Reviewing workspace context...",
    "Preparing the deliverable...",
    "Saving the output file..."
  ], agentTaskProgress);
  setButtonLoading(document.querySelector("#run-agent-task-button"), true, "Running...");

  try {
    const response = await fetch(`/api/cases/${state.currentCase.id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        instructions,
        outputFilename,
        outputFormat,
        workspaceLanguage: getActiveWorkspaceLanguage(),
        llmProvider: agentProvider,
        llmModel: agentModel
      })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Agent task failed.");
    }

    const result = await waitForJob(data.jobId, agentTaskStatus, agentTaskProgress);
    await loadCase(result.caseId, {
      preserveRuntimeModel: true,
      provider: state.runtimeProvider || llmProviderSelect.value,
      model: state.runtimeModel || llmModelSelect.value
    });
    setActiveTab("studio");
    setStatus(agentTaskStatus, "Agent output saved to this workspace.");
    if (agentTaskForm) {
      agentTaskForm.reset();
    }
    initializeAgentModelSelector();
  } catch (error) {
    setStatus(agentTaskStatus, error.message || "Agent task failed.", true);
  } finally {
    stopProgress(agentTaskProgress);
    setButtonLoading(document.querySelector("#run-agent-task-button"), false, "Run Agent Task");
  }
}

function inferAgentOutputFormat(instructions, selectedFormat) {
  const text = String(instructions || "").toLowerCase();
  if (/\b(powerpoint|ppt|pptx|presentation|slide deck|slides)\b/.test(text)) {
    return "pptx";
  }
  return selectedFormat || "markdown";
}

async function generateVisual(event) {
  event.preventDefault();

  if (!state.currentCase) {
    setStatus(visualStatus, "Open a workspace before generating visuals.", true);
    return;
  }

  const prompt = visualPromptInput.value.trim();
  if (!prompt) {
    setStatus(visualStatus, "Describe what visual you want to generate first.", true);
    return;
  }

  setActiveTab("studio", { scrollIntoView: true });
  setStatus(visualStatus, "Generating visual concept...");
  setProgressState(visualProgress, "Preparing visual brief...");
  setButtonLoading(document.querySelector("#generate-visual-button"), true, "Generating...");

  try {
    const shouldStartNew = visualGenerationModeInput?.value === "new";
    const response = await fetch(`/api/cases/${state.currentCase.id}/visuals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visualType: visualTypeInput.value,
        aspectRatio: visualAspectRatioInput.value,
        prompt,
        sourceVisualId: shouldStartNew ? "" : (state.selectedBaseVisualId || "")
      })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Visual generation failed.");
    }

    const result = await waitForJob(data.jobId, visualStatus, visualProgress);
    await loadCase(result.caseId);
    setStatus(visualStatus, "Visual generated and saved to this workspace.");
  } catch (error) {
    setStatus(visualStatus, error.message || "Visual generation failed.", true);
  } finally {
    setProgressState(visualProgress, "");
    setButtonLoading(document.querySelector("#generate-visual-button"), false, "Generate Or Refine Visual");
  }
}

function syncVisualGenerationMode() {
  if (!visualGenerationModeInput || !visualBaseNote) {
    return;
  }
  if (visualGenerationModeInput.value === "new") {
    visualBaseNote.textContent = "This request will ignore the current visual and generate a brand new concept.";
  } else {
    const active = (state.currentCase?.visuals || []).find((item) => item.id === state.selectedBaseVisualId) || (state.currentCase?.visuals || [])[0];
    visualBaseNote.textContent = active
      ? `Refining from: ${active.type || "visual"} created ${new Date(active.createdAt).toLocaleString()}`
      : "If this workspace already has a visual, new prompts will refine the selected base image.";
  }
}

function renderCase(record) {
  if (workspacePanel) {
    workspacePanel.classList.remove("hidden");
  }
  emptyState.classList.add("hidden");
  workspace.classList.remove("hidden");
  state.currentCase = record;
  syncWorkspaceActionButtons();

  workspaceTitle.textContent = record.title;
  if (workspaceCrumb) {
    workspaceCrumb.textContent = `${state.uiLanguage === "ar" ? "مساحة العمل" : "Workspace"} / ${formatWorkspaceType(record.workspaceType || "general")} / ${record.title}`;
  }
  if (workspaceSubtitle) {
    workspaceSubtitle.textContent = `${formatWorkspaceType(record.workspaceType || "general")} · ${formatModeLabel(record.mode)} · ${formatDepthLabel(record.analysisDepth || "quick")}`;
  }
  workspaceMode.textContent = formatModeLabel(record.mode);
  workspaceDepth.textContent = formatDepthLabel(record.analysisDepth || "quick");
  if (workspaceTypePill) {
    workspaceTypePill.textContent = formatWorkspaceType(record.workspaceType || "general");
  }
  if (workspaceSubtitle) {
    workspaceSubtitle.textContent = `${formatWorkspaceType(record.workspaceType || "general")} · ${formatModeLabel(record.mode)} · ${formatDepthLabel(record.analysisDepth || "quick")}`;
  }
  if (workspaceLanguagePill) {
    workspaceLanguagePill.textContent = formatWorkspaceLanguage(getActiveWorkspaceLanguage());
  }
  if (workspaceProviderPill) {
    workspaceProviderPill.textContent = formatProviderLabel(record.llmProvider || state.defaultProvider);
  }
  if (workspaceModelPill) {
    workspaceModelPill.textContent = record.llmModel || state.defaultModel;
  }
  workspaceFileCount.textContent = formatItemCount(record.files.length, "fileSingular", "filePlural");
  if (workspaceOwner) {
    workspaceOwner.textContent = record.ownerEmail;
  }
  workspaceConfidence.textContent = formatConfidence(record.analysis.overall_confidence || "possible");
  workspaceStatus.textContent = formatWorkspaceStatus(record.status || "ready");

  summaryText.textContent = normalizeText(record.analysis.summary);
  theoryText.textContent = normalizeText(record.analysis.working_theory);
  uncertaintyText.textContent = normalizeText(
    record.analysis.uncertainty_note || tr("humanVerificationRecommended")
  );
  metricFindings.textContent = String(record.analysis.findings.length);
  metricEvidence.textContent = String(record.analysis.evidence.length);
  metricContradictions.textContent = String(record.analysis.contradictions.length);
  metricQuestions.textContent = String(record.analysis.open_questions.length);
  scorecardList.innerHTML = renderScorecard(record.analysis.scorecard || []);
  strengthsList.innerHTML = renderBullets(record.analysis.strengths || []);
  weaknessesList.innerHTML = renderBullets(record.analysis.weaknesses || []);
  opportunitiesList.innerHTML = renderBullets(record.analysis.opportunities || []);
  risksList.innerHTML = renderBullets(record.analysis.risks || []);
  prioritiesList.innerHTML = renderStack(record.analysis.development_priorities || [], (item) => `
    <div class="stack-item">
      <h4>${escapeHtml(item.area)}</h4>
      <p>${escapeHtml(normalizeText(item.action))}</p>
      <div class="citation-line">${escapeHtml(item.citation_reference || tr("documentGroundedRecommendation"))}</div>
      <span class="severity-chip ${item.urgency === "high" ? "critical" : item.urgency === "medium" ? "moderate" : "minor"}">${escapeHtml(capitalize(item.urgency || "low"))} ${escapeHtml(tr("priority"))}</span>
    </div>
  `);

  ingestionSummary.innerHTML = `
    <div class="stack-item">
      <h4>${record.ingestion?.supportedFiles || record.files.length} ${escapeHtml(tr("supportedFilesIndexed"))}</h4>
      <p>${escapeHtml(tr("formatsLabel"))}: ${escapeHtml((record.ingestion?.formats || []).join(", ") || tr("unknown"))}</p>
    </div>
  `;

  groundingSummary.innerHTML = `
    <div class="stack-item">
      <h4>${escapeHtml(tr("ragActiveTitle"))}</h4>
      <p>${escapeHtml(tr("ragActiveCopy"))}</p>
    </div>
    <div class="stack-item">
      <h4>${escapeHtml(formatDepthLabel(record.analysisDepth || "quick"))} ${escapeHtml(tr("depthWorkflowTitleSuffix"))}</h4>
      <p>${record.analysisDepth === "deep"
        ? escapeHtml(tr("deepDepthCopy"))
        : escapeHtml(tr("quickDepthCopy"))}</p>
    </div>
  `;

  findingsList.innerHTML = renderStack(record.analysis.findings.slice(0, 3), (item) => `
    <div class="stack-item">
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(normalizeText(item.detail))}</p>
      <div class="citation-line">${escapeHtml(item.citation_reference || item.source_file)}</div>
      <span class="confidence-chip ${item.confidence || "possible"}">${escapeHtml(formatConfidence(item.confidence || "possible"))}</span>
      <span class="source-chip">${escapeHtml(item.source_file)}</span>
    </div>
  `);

  evidenceList.innerHTML = renderStack(record.analysis.evidence.slice(0, 3), (item) => `
    <div class="stack-item">
      <h4>${escapeHtml(normalizeText(item.claim))}</h4>
      <p>${escapeHtml(normalizeText(item.importance))}</p>
      <div class="citation-line">${escapeHtml(item.citation_reference || item.source_file)}</div>
      <span class="confidence-chip ${item.confidence || "possible"}">${escapeHtml(formatConfidence(item.confidence || "possible"))}</span>
      <span class="source-chip">${escapeHtml(item.source_file)}</span>
    </div>
  `);

  contradictionsList.innerHTML = renderStack(record.analysis.contradictions.slice(0, 2), (item) => `
    <div class="stack-item">
      <h4>${escapeHtml(item.issue)}</h4>
      <p>${escapeHtml(normalizeText(item.why_it_matters))}</p>
      <span class="severity-chip ${item.severity}">${escapeHtml(item.severity)} ${escapeHtml(tr("severity"))}</span>
    </div>
  `);

  entitiesList.innerHTML = record.analysis.entities.length
    ? record.analysis.entities
        .slice(0, 8)
        .map(
          (item) => `
            <div class="tag">
              <strong>${escapeHtml(item.name)}</strong>
              <span>${escapeHtml(item.type)}</span>
              <span>${escapeHtml(normalizeText(item.significance))}</span>
            </div>
          `
        )
        .join("")
    : `<p>${escapeHtml(tr("noEntitiesExtracted"))}</p>`;

  timelineList.innerHTML = renderStack(record.analysis.timeline.slice(0, 4), (item) => `
    <div class="timeline-item">
      <div class="timeline-date">${escapeHtml(item.date_or_period)}</div>
      <div class="timeline-body">
      <p>${escapeHtml(normalizeText(item.event))}</p>
      <span class="source-chip">${escapeHtml(item.source_file)}</span>
      </div>
    </div>
  `);

  questionsList.innerHTML = renderBullets(record.analysis.open_questions);
  suggestedList.innerHTML = renderBullets(record.analysis.suggested_questions);
  warningsList.innerHTML = renderBullets(record.analysis.warnings);
  renderPromptChips(record.analysis.suggested_questions || []);
  renderFileLibrary(record.files || []);
  renderTasks(record.tasks || []);
  renderVisuals(record.visuals || []);
  renderQa(record.qa || []);
  renderReviews(record.reviews || []);
  setActiveTab(state.activeTab || "overview");
}

function renderTasks(items) {
  if (!agentTaskList) {
    return;
  }

  agentTaskList.innerHTML = items.length
    ? items.map((item) => `
      <article class="stack-item agent-task-item">
        <div class="history-item-top">
          <div>
            <h4>${escapeHtml(item.title || "Agent task")}</h4>
            <p>${escapeHtml(normalizeText(item.outputSummary || item.instructions || ""))}</p>
          </div>
          <span class="history-status ${escapeHtml(item.status || "queued")}">${escapeHtml(formatWorkspaceStatus(item.status || "queued"))}</span>
        </div>
        <div class="visual-card-meta">
          <span>${escapeHtml(formatProviderLabel(item.llmProvider || state.defaultProvider))}</span>
          <span>${escapeHtml(item.llmModel || state.defaultModel)}</span>
          <span>${escapeHtml(new Date(item.createdAt).toLocaleString())}</span>
        </div>
        <div class="visual-card-actions">
          ${item.outputUrl ? `<a class="ghost-button" href="${escapeHtml(item.outputUrl)}" target="_blank" rel="noreferrer">${item.outputFormat === "pptx" ? "Download PowerPoint" : "Open Output"}</a>` : ""}
        </div>
      </article>
    `).join("")
    : `<div class="stack-item"><p>No agent tasks yet. Launch one above to generate a workspace-based file.</p></div>`;
}

function renderVisuals(items) {
  if (!visualGallery) {
    return;
  }

  if (!items.length) {
    state.selectedBaseVisualId = null;
  } else if (!state.selectedBaseVisualId || !items.some((item) => item.id === state.selectedBaseVisualId)) {
    state.selectedBaseVisualId = items[0].id;
  }

  if (visualGenerationModeInput && !items.length) {
    visualGenerationModeInput.value = "new";
  }
  syncVisualGenerationMode();

  visualGallery.innerHTML = items.length
    ? items.map((item) => `
      <article class="visual-card${item.id === state.selectedBaseVisualId ? " active" : ""}">
        <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.type)}" class="visual-image" />
        <div class="visual-card-body">
          <div class="history-item-top">
            <strong>${escapeHtml(capitalize(item.type || "visual"))}</strong>
            <span class="source-chip">${escapeHtml(item.aspectRatio || "1:1")}</span>
          </div>
          <p>${escapeHtml(normalizeText(item.prompt || ""))}</p>
          <div class="visual-card-meta">
            <span>${escapeHtml(item.model || "gpt-image-1")}</span>
            <span>${escapeHtml(new Date(item.createdAt).toLocaleString())}</span>
          </div>
          <div class="visual-card-actions">
            <button class="ghost-button" type="button" data-select-visual="${escapeHtml(item.id)}">${item.id === state.selectedBaseVisualId ? "Using As Base" : "Use As Base"}</button>
            <a class="ghost-button" href="${escapeHtml(item.imageUrl)}" target="_blank" rel="noreferrer">Open</a>
          </div>
        </div>
      </article>
    `).join("")
    : `<div class="stack-item"><p>No visuals generated yet. Use the studio above when you want logo, cup, packaging, or mockup concepts.</p></div>`;

  visualGallery.querySelectorAll("[data-select-visual]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedBaseVisualId = button.getAttribute("data-select-visual");
      if (visualGenerationModeInput) {
        visualGenerationModeInput.value = "refine";
      }
      renderVisuals(items);
    });
  });
}

function renderQa(items) {
  qaList.innerHTML = items.length
    ? items.map((item) => renderQaItem(item)).join("")
    : `<div class="stack-item"><p>${escapeHtml(tr("noQuestionsYet"))}</p></div>`;
}

function renderQaItem(item) {
  const answer = item.answer;
  const mainAnswer = normalizeText(answer.short_answer || answer.answer || "");
  const keyPoints = Array.isArray(answer.key_points)
    ? answer.key_points.map((point) => typeof point === "string"
      ? { point, evidence_strength: answer.overall_confidence || answer.confidence || "possible", citation_reference: "" }
      : point)
    : [];
  const support = answer.supporting_points.length
    ? `
      <div>
        <p class="list-title">${escapeHtml(tr("supportingPoints"))}</p>
        <div class="qa-support">
          ${answer.supporting_points
            .map(
              (point) => `
                <div class="qa-support-item">
                  <p>${escapeHtml(normalizeText(point.point))}</p>
                  <p><strong>${escapeHtml(point.source_file)}</strong> - ${escapeHtml(normalizeText(point.source_excerpt))}</p>
                  <div class="citation-line">${escapeHtml(point.citation_reference || point.source_file)}</div>
                  <span class="confidence-chip ${point.evidence_strength || "possible"}">${escapeHtml(formatConfidence(point.evidence_strength || "possible"))}</span>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
    `
    : "";

  const counterpoints = answer.counterpoints.length
    ? `<div><p class="list-title">${escapeHtml(tr("counterpoints"))}</p>${renderFullBullets(answer.counterpoints)}</div>`
    : "";

  const speculative = answer.speculative_leads.length
    ? `<div><p class="list-title">${escapeHtml(tr("speculativeLeads"))}</p>${renderFullBullets(answer.speculative_leads)}</div>`
    : "";

  const nextQuestions = answer.next_questions.length
    ? `<div><p class="list-title">${escapeHtml(tr("nextQuestions"))}</p>${renderFullBullets(answer.next_questions)}</div>`
    : "";

  const renderedKeyPoints = keyPoints.length
    ? `
      <div>
        <p class="list-title">${escapeHtml(tr("keyPoints"))}</p>
        <div class="key-point-list">
          ${keyPoints
            .map(
              (point, index) => `
                <div class="key-point-item">
                  <div class="key-point-number">${index + 1}</div>
                  <div class="key-point-text">
                    <strong>${escapeHtml(normalizeText(point.point))}</strong>
                    <div class="citation-line">${escapeHtml(point.citation_reference || tr("citationPending"))}</div>
                    <span class="confidence-chip ${point.evidence_strength || "possible"}">${escapeHtml(formatConfidence(point.evidence_strength || "possible"))}</span>
                  </div>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
    `
    : "";

  return `
    <article class="qa-item">
      <div class="qa-top">
        <div class="qa-question">${escapeHtml(normalizeText(item.question))}</div>
        <span class="qa-mode ${escapeHtml(item.mode)}">${escapeHtml(formatModeLabel(item.mode))}</span>
      </div>
      <div class="qa-main-answer">
        <p>${escapeHtml(mainAnswer)}</p>
      </div>
      <div>
        <span class="confidence-chip ${answer.overall_confidence || answer.confidence || "possible"}">${escapeHtml(formatConfidence(answer.overall_confidence || answer.confidence || "possible"))}</span>
        <span class="source-chip">${escapeHtml(answer.verification_note || tr("verificationRequired"))}</span>
      </div>
      <div class="stack-item">
        <h4>${escapeHtml(tr("uncertaintyHandling"))}</h4>
        <p>${escapeHtml(normalizeText(answer.uncertainty_note || tr("answerVerificationNote")))}</p>
      </div>
      ${renderedKeyPoints}
      ${support}
      ${counterpoints}
      ${speculative}
      ${nextQuestions}
    </article>
  `;
}

function renderHistory() {
  historyList.innerHTML = state.cases.length
    ? state.cases
        .map((item) => {
          const active = state.currentCase && item.id === state.currentCase.id ? " active" : "";
          return `
            <article class="history-item${active}">
              <div class="history-item-top">
                <button class="history-open-button" type="button" data-case-id="${escapeHtml(item.id)}">
                  <strong>${escapeHtml(item.title)}</strong>
                </button>
                <span class="history-status ${escapeHtml(item.status || "ready")}">${escapeHtml(formatWorkspaceStatus(item.status || "ready"))}</span>
              </div>
              <span>${escapeHtml(formatProviderLabel(item.llmProvider || state.defaultProvider))} - ${escapeHtml(item.llmModel || state.defaultModel)}</span>
              <span>${escapeHtml(formatWorkspaceType(item.workspaceType || "general"))} - ${escapeHtml(formatModeLabel(item.mode))}${item.analysisDepth ? ` - ${escapeHtml(formatDepthLabel(item.analysisDepth))}` : ""}</span>
              <span>${escapeHtml(formatItemCount(item.fileCount, "fileSingular", "filePlural"))} - ${escapeHtml(formatItemCount(item.questionCount, "questionSingular", "questionPlural"))}</span>
              ${state.currentUser.role === "admin" ? `<span>${escapeHtml(tr("ownerLabel"))}: ${escapeHtml(item.ownerEmail)}</span>` : ""}
              <div class="history-actions">
                <button class="ghost-button" type="button" data-case-id="${escapeHtml(item.id)}">${escapeHtml(tr("openWorkspace"))}</button>
                <button class="ghost-button danger-button" type="button" data-delete-case-id="${escapeHtml(item.id)}" data-case-title="${escapeHtml(item.title)}">${escapeHtml(tr("delete"))}</button>
              </div>
            </article>
          `;
        })
        .join("")
    : `<div class="history-empty">${escapeHtml(tr("noSavedWorkspacesYet"))}</div>`;

  historyList.querySelectorAll("[data-case-id]").forEach((button) => {
    button.addEventListener("click", () => loadCase(button.dataset.caseId));
  });
  historyList.querySelectorAll("[data-delete-case-id]").forEach((button) => {
    button.addEventListener("click", () => deleteWorkspaceById(button.dataset.deleteCaseId, button.dataset.caseTitle || ""));
  });
}

function renderSelectedFiles() {
  const files = state.stagedUploadFiles.slice();

  if (!files.length) {
    selectedFiles.className = "selected-files empty";
    selectedFiles.textContent = tr(selectedFiles.dataset.emptyTextKey || "noDocumentsSelected");
    return;
  }

  selectedFiles.className = "selected-files";
  selectedFiles.innerHTML = `
    <div class="stack-item">
      <strong>${escapeHtml(formatItemCount(files.length, "fileSingular", "filePlural"))} ${escapeHtml(tr("readyForAnalysis"))}</strong>
    </div>
    ${files
    .map((file, index) => {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      return `<span class="file-pill">${escapeHtml(file.name)} - ${sizeMb} MB <button type="button" data-remove-file="${index}">${escapeHtml(tr("remove"))}</button></span>`;
    })
    .join("")}
  `;

  selectedFiles.querySelectorAll("[data-remove-file]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.getAttribute("data-remove-file"));
      if (Number.isNaN(index)) {
        return;
      }
      state.stagedUploadFiles.splice(index, 1);
      renderSelectedFiles();
    });
  });
}

function mergeSelectedFiles() {
  const nextFiles = Array.from(documentsInput.files || []);
  if (!nextFiles.length) {
    return;
  }

  const existingKeys = new Set(
    state.stagedUploadFiles.map((file) => `${file.name}::${file.size}::${file.lastModified}`)
  );

  nextFiles.forEach((file) => {
    const key = `${file.name}::${file.size}::${file.lastModified}`;
    if (!existingKeys.has(key)) {
      state.stagedUploadFiles.push(file);
      existingKeys.add(key);
    }
  });

  documentsInput.value = "";
  renderSelectedFiles();
}

function renderModelOptions(provider, selectedModel) {
  if (!llmModelSelect) {
    return;
  }

  const selectedProvider = provider || state.defaultProvider || "openai";
  const providerConfig = (state.providerOptions || []).find((item) => item.value === selectedProvider);
  const models = providerConfig?.models || (selectedProvider === "ollama"
    ? ["qwen3:8b", "qwen3:14b", "qwen3:30b", "qwen3:32b", "qwen2.5:7b", "qwen2.5:14b", "qwen2.5:32b", "llama3.1:8b", "llama3.1:70b"]
    : selectedProvider === "anthropic"
      ? ["claude-opus-4-1-20250805", "claude-sonnet-4-20250514", "claude-3-7-sonnet-20250219"]
      : ["gpt-5.5", "gpt-5.4-mini", "gpt-5.4-nano", "gpt-5.1", "gpt-4.1"]);
  const nextModel = models.includes(selectedModel) ? selectedModel : models[0];

  llmModelSelect.innerHTML = models
    .map((model) => `<option value="${escapeHtml(model)}">${escapeHtml(model)}</option>`)
    .join("");
  llmModelSelect.value = nextModel;
}

function initializeAgentModelSelector() {
  if (!agentLlmProviderSelect || !agentLlmModelSelect) {
    return;
  }

  const preferredProvider = getProviderConfig("anthropic")?.enabled ? "anthropic" : state.defaultProvider || "openai";
  agentLlmProviderSelect.value = preferredProvider;
  renderAgentModelOptions(preferredProvider);
}

function renderAgentModelOptions(provider, selectedModel) {
  if (!agentLlmModelSelect) {
    return;
  }

  const selectedProvider = provider || agentLlmProviderSelect?.value || state.defaultProvider || "openai";
  const providerConfig = getProviderConfig(selectedProvider);
  const models = providerConfig?.models || fallbackModelsForProvider(selectedProvider);
  const nextModel = models.includes(selectedModel) ? selectedModel : models[0];
  agentLlmModelSelect.innerHTML = models
    .map((model) => `<option value="${escapeHtml(model)}">${escapeHtml(model)}</option>`)
    .join("");
  agentLlmModelSelect.value = nextModel;
}

function syncAgentProviderForOutputFormat() {
  if (!agentOutputFormatInput || !agentLlmProviderSelect) {
    return;
  }

  if (agentOutputFormatInput.value !== "pptx") {
    return;
  }

  const anthropicConfig = getProviderConfig("anthropic");
  if (anthropicConfig?.enabled) {
    agentLlmProviderSelect.value = "anthropic";
    renderAgentModelOptions("anthropic");
    setStatus(agentTaskStatus, "PowerPoint generation will use Claude.");
  } else {
    setStatus(agentTaskStatus, "Claude is selected for best PowerPoint output, but ANTHROPIC_API_KEY is not configured yet.", true);
  }
}

function getProviderConfig(provider) {
  return (state.providerOptions || []).find((item) => item.value === provider);
}

function fallbackModelsForProvider(provider) {
  return provider === "ollama"
    ? ["qwen3:8b", "qwen3:14b", "qwen3:30b", "qwen3:32b", "qwen2.5:7b", "qwen2.5:14b", "qwen2.5:32b", "llama3.1:8b", "llama3.1:70b"]
    : provider === "anthropic"
      ? ["claude-opus-4-1-20250805", "claude-sonnet-4-20250514", "claude-3-7-sonnet-20250219"]
      : ["gpt-5.5", "gpt-5.4-mini", "gpt-5.4-nano", "gpt-5.1", "gpt-4.1"];
}

function renderSidebarStats() {
  const activeCount = state.cases.filter((item) => item.status !== "archived").length;
  const indexedCount = state.cases.reduce((sum, item) => sum + Number(item.fileCount || 0), 0);
  const analysesCount = state.cases.length;
  const sourcesCount = state.cases.reduce((sum, item) => sum + Number(item.questionCount || 0), 0);

  if (statActive) {
    statActive.textContent = String(activeCount);
  }
  if (statIndexed) {
    statIndexed.textContent = String(indexedCount);
  }
  if (statAnalyses) {
    statAnalyses.textContent = String(analysesCount);
  }
  if (statSources) {
    statSources.textContent = String(sourcesCount);
  }
}

function renderScorecard(items) {
  return items.length
    ? items.map((item) => `
      <article class="scorecard-item">
        <div class="scorecard-top">
          <strong>${escapeHtml(item.label)}</strong>
          <span>${Math.round(Number(item.score) || 0)}</span>
        </div>
        <div class="scorecard-bar">
          <span style="width:${Math.max(0, Math.min(100, Number(item.score) || 0))}%"></span>
        </div>
        <p>${escapeHtml(normalizeText(item.rationale))}</p>
      </article>
    `).join("")
    : `<div class="stack-item"><p>${escapeHtml(tr("noScorecardYet"))}</p></div>`;
}

function renderPromptChips(items) {
  promptChipList.innerHTML = items.length
    ? items.slice(0, 6).map((item) => `<button class="prompt-chip" type="button">${escapeHtml(normalizeText(item))}</button>`).join("")
    : `<div class="stack-item"><p>${escapeHtml(tr("noSuggestedPromptsYet"))}</p></div>`;

  promptChipList.querySelectorAll(".prompt-chip").forEach((button) => {
    button.addEventListener("click", () => {
      questionInput.value = button.textContent || "";
      questionInput.scrollIntoView({ behavior: "smooth", block: "center" });
      questionInput.focus();
    });
  });
}

function renderFileLibrary(files) {
  fileLibraryList.innerHTML = files.length
    ? files.map((file) => `
      <article class="stack-item file-library-item">
        <div class="file-library-top">
          <div>
            <h4>${escapeHtml(file.name || file.filename || (state.uiLanguage === "ar" ? "مستند" : "Document"))}</h4>
            <p>${escapeHtml((file.type || file.extension || tr("unknown")).replace("application/", ""))}</p>
          </div>
          <div class="file-library-meta">
            <span class="source-chip">${escapeHtml(file.extractionMethod || tr("uploadedSource"))}</span>
            <span class="source-chip">${escapeHtml(formatFileSize(file.size || 0))}</span>
          </div>
        </div>
        <p>${escapeHtml(normalizeText(file.extractionPreview || tr("noLocalPreview")))}</p>
      </article>
    `).join("")
    : `<div class="stack-item"><p>${escapeHtml(tr("noUploadedFiles"))}</p></div>`;
}

function renderStack(items, renderer) {
  return items.length ? items.map(renderer).join("") : `<p>${escapeHtml(tr("noItemsReturned"))}</p>`;
}

function renderBullets(items) {
  return items.length
    ? `<ul class="plain-list">${items.slice(0, 4).map((item) => `<li>${escapeHtml(normalizeText(item))}</li>`).join("")}</ul>`
    : `<p>${escapeHtml(tr("noItemsReturned"))}</p>`;
}

function renderFullBullets(items) {
  return items.length
    ? `<ul class="plain-list">${items.map((item) => `<li>${escapeHtml(normalizeText(item))}</li>`).join("")}</ul>`
    : `<p>${escapeHtml(tr("noItemsReturned"))}</p>`;
}

function showAuthScreen() {
  authScreen.classList.remove("hidden");
  appScreen.classList.add("hidden");
  setStatus(loginStatus, "");
  syncLanguageSelects();
}

function showAppScreen() {
  authScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
  currentUserName.textContent = state.currentUser.name;
  currentUserRole.textContent = `${formatRoleLabel(state.currentUser.role)} - ${state.currentUser.email}`;
  document.querySelector("#profile-name").value = state.currentUser.name || "";
  document.querySelector("#profile-password").value = "";
  adminPanel.classList.toggle("hidden", state.currentUser.role !== "admin");
  syncLanguageSelects();
}

function clearWorkspace() {
  state.currentCase = null;
  if (workspacePanel) {
    workspacePanel.classList.add("hidden");
  }
  workspace.classList.add("hidden");
  emptyState.classList.add("hidden");
  syncWorkspaceActionButtons();
  workspaceTitle.textContent = tr("selectOrCreateWorkspace");
  if (workspaceCrumb) {
    workspaceCrumb.textContent = `${state.uiLanguage === "ar" ? "مساحة العمل" : "Workspace"} / ${tr("workspaceTypeUnified")}`;
  }
  if (workspaceSubtitle) {
    workspaceSubtitle.textContent = tr("defaultWorkspaceSubtitle");
  }
  document.querySelector("#workspace-type").value = "general";
  syncWorkspaceLanguageToInterface();
  document.querySelector("#analysis-depth").value = "quick";
  if (llmProviderSelect) {
    llmProviderSelect.value = state.defaultProvider;
    renderModelOptions(state.defaultProvider, state.defaultModel);
  }
  state.runtimeProvider = state.defaultProvider;
  state.runtimeModel = state.defaultModel;
  if (workspaceTypePill) {
    workspaceTypePill.textContent = "-";
  }
  if (workspaceLanguagePill) {
    workspaceLanguagePill.textContent = "-";
  }
  if (workspaceProviderPill) {
    workspaceProviderPill.textContent = "-";
  }
  if (workspaceModelPill) {
    workspaceModelPill.textContent = "-";
  }
  workspaceDepth.textContent = "-";
  workspaceConfidence.textContent = "-";
  workspaceStatus.textContent = "-";
  if (state.currentUser) {
    renderHistory();
  }
  promptChipList.innerHTML = "";
  fileLibraryList.innerHTML = "";
  if (visualGallery) {
    visualGallery.innerHTML = "";
  }
  state.selectedBaseVisualId = null;
  if (visualGenerationModeInput) {
    visualGenerationModeInput.value = "refine";
  }
  scorecardList.innerHTML = "";
  strengthsList.innerHTML = "";
  weaknessesList.innerHTML = "";
  opportunitiesList.innerHTML = "";
  risksList.innerHTML = "";
  prioritiesList.innerHTML = "";
  qaList.innerHTML = "";
  reviewList.innerHTML = "";
  if (agentTaskList) {
    agentTaskList.innerHTML = "";
  }
  setStatus(workspaceActionStatus, "");
  setStatus(visualStatus, "");
  setStatus(agentTaskStatus, "");
  setProgressState(visualProgress, "");
  setProgressState(agentTaskProgress, "");
  syncVisualGenerationMode();
}

function exportWorkspace() {
  if (!state.currentCase) {
    return;
  }
  window.location.href = `/api/cases/${state.currentCase.id}/export.md`;
}

async function archiveWorkspace() {
  if (!state.currentCase) {
    return;
  }

  document.querySelector(".workspace-action-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  setStatus(workspaceActionStatus, tr("archivingWorkspace"));
  try {
    const response = await fetch(`/api/cases/${state.currentCase.id}/archive`, { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Archive failed.");
    }
    state.currentCase = data.case;
    renderCase(state.currentCase);
    await loadCases(state.currentCase.id);
    setStatus(workspaceActionStatus, state.currentCase.status === "archived"
      ? tr("workspaceArchived")
      : (state.uiLanguage === "ar" ? "تم إلغاء الأرشفة." : "Workspace unarchived."));
  } catch (error) {
    setStatus(workspaceActionStatus, error.message || tr("archiveFailed"), true);
  }
}

async function deleteWorkspace() {
  if (!state.currentCase) {
    return;
  }

  await deleteWorkspaceById(state.currentCase.id, state.currentCase.title);
}

async function deleteWorkspaceById(caseId, title = "") {
  if (!caseId) {
    return;
  }

  const confirmed = window.confirm(tr("deleteConfirm").replace("{title}", title || tr("selectOrCreateWorkspace")));
  if (!confirmed) {
    return;
  }

  setStatus(workspaceActionStatus, tr("deletingWorkspace"));
  try {
    const response = await fetch(`/api/cases/${caseId}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Delete failed.");
    }

    const deletedId = data.deletedId;
    if (state.currentCase?.id === deletedId) {
      state.currentCase = null;
    }
    await loadCases();
    if (!state.currentCase || state.currentCase.id === deletedId) {
      clearWorkspace();
    }
    setStatus(workspaceActionStatus, tr("workspaceDeleted"));
  } catch (error) {
    setStatus(workspaceActionStatus, error.message || tr("deleteFailed"), true);
  }
}

async function saveProfile(event) {
  event.preventDefault();
  setButtonLoading(document.querySelector("#save-profile-button"), true, tr("savingProfile"));
  setStatus(profileStatus, tr("savingProfile"));

  try {
    const response = await fetch("/api/auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: document.querySelector("#profile-name").value,
        password: document.querySelector("#profile-password").value
      })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Profile update failed.");
    }

    state.currentUser = data.user;
    showAppScreen();
    setStatus(profileStatus, tr("profileUpdated"));
  } catch (error) {
    setStatus(profileStatus, error.message || tr("profileUpdateFailed"), true);
  } finally {
    setButtonLoading(document.querySelector("#save-profile-button"), false, tr("saveProfile"));
  }
}

function syncModeButtons() {
  document.querySelectorAll(".mode-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.mode);
  });
}

function setActiveTab(tab, options = {}) {
  const safeTab = document.querySelector(`.workspace-tab[data-tab="${tab}"]`) ? tab : "overview";
  state.activeTab = safeTab;
  document.querySelectorAll(".workspace-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === safeTab);
  });
  const visibleSections = new Set([safeTab]);
  document.querySelectorAll(".workspace-section").forEach((section) => {
    section.classList.toggle("hidden", !visibleSections.has(section.dataset.section));
  });
  if (options.scrollIntoView) {
    const target = document.querySelector(`.workspace-section[data-section="${safeTab}"]`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

function setButtonLoading(button, loading, label) {
  if (!button) {
    return;
  }
  button.disabled = loading;
  button.textContent = label;
}

function syncWorkspaceActionButtons() {
  if (!state.currentCase) {
    [reanalyzeButton, exportButton, archiveButton, deleteButton, quickReanalyzeButton, quickExportButton, quickArchiveButton, quickDeleteButton]
      .forEach((button) => {
        if (button) {
          button.disabled = true;
        }
      });
    if (archiveButton) archiveButton.textContent = "Archive";
    if (quickArchiveButton) quickArchiveButton.textContent = "Archive";
    return;
  }

  const isArchived = state.currentCase.status === "archived";
  const archiveLabel = isArchived ? "Unarchive" : "Archive";

  if (reanalyzeButton) reanalyzeButton.disabled = false;
  if (quickReanalyzeButton) quickReanalyzeButton.disabled = false;
  if (exportButton) exportButton.disabled = false;
  if (quickExportButton) quickExportButton.disabled = false;
  if (deleteButton) deleteButton.disabled = false;
  if (quickDeleteButton) quickDeleteButton.disabled = false;
  if (archiveButton) {
    archiveButton.disabled = false;
    archiveButton.textContent = archiveLabel;
  }
  if (quickArchiveButton) {
    quickArchiveButton.disabled = false;
    quickArchiveButton.textContent = archiveLabel;
  }
}

function setStatus(target, message, isError = false) {
  if (!target) {
    return;
  }
  target.textContent = message;
  target.style.color = isError ? "var(--accent)" : "var(--muted)";
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function tidyText(value, maxLength) {
  const normalized = normalizeText(value);
  if (!maxLength || normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function startProgress(steps, target = chatProgress) {
  stopProgress(target);
  if (!steps.length) {
    return;
  }

  let index = 0;
  setProgressState(target, steps[index]);
  progressTimer = setInterval(() => {
    index = Math.min(index + 1, steps.length - 1);
    setProgressState(target, steps[index]);
  }, 1200);
}

function stopProgress(target = chatProgress) {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }

  setProgressState(target, "");
}

function setProgressState(target, message) {
  if (!target) {
    return;
  }
  if (message) {
    target.textContent = message;
    target.classList.remove("hidden");
  } else {
    target.textContent = "";
    target.classList.add("hidden");
  }
}

async function waitForJob(jobId, statusTarget, progressTarget = chatProgress) {
  while (true) {
    const response = await fetch(`/api/jobs/${jobId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Job failed.");
    }

    if (data.step) {
      setStatus(statusTarget, data.step);
      setProgressState(progressTarget, data.step);
    }

    if (data.status === "completed") {
      return data.result;
    }

    if (data.status === "failed") {
      throw new Error(data.error || "Job failed.");
    }

    await new Promise((resolve) => setTimeout(resolve, 900));
  }
}

async function saveReview(event) {
  event.preventDefault();
  if (!state.currentCase) {
    setStatus(reviewStatusText, tr("reviewOpenFirst"), true);
    return;
  }

  setStatus(reviewStatusText, tr("savingReview"));
  try {
    const response = await fetch(`/api/cases/${state.currentCase.id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: document.querySelector("#review-status").value,
        note: document.querySelector("#review-note").value,
        targetType: "case",
        targetId: state.currentCase.id
      })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Review save failed.");
    }

    await loadCase(state.currentCase.id);
    reviewForm.reset();
    setStatus(reviewStatusText, tr("reviewSaved"));
  } catch (error) {
    setStatus(reviewStatusText, error.message || tr("reviewSaveFailed"), true);
  }
}

function renderReviews(items) {
  reviewList.innerHTML = items.length
    ? items
        .map(
          (item) => `
            <div class="stack-item">
              <h4>${escapeHtml(formatReviewStatus(item.status))}</h4>
              <p>${escapeHtml(normalizeText(item.note || tr("noNoteAdded")))}</p>
              <div class="citation-line">${escapeHtml(item.createdBy)} - ${escapeHtml(new Date(item.createdAt).toLocaleString())}</div>
            </div>
          `
        )
        .join("")
    : `<div class="stack-item"><p>${escapeHtml(tr("noHumanReviewNotesYet"))}</p></div>`;
}

function formatProviderLabel(value) {
  return value === "ollama" ? "Ollama" : value === "anthropic" ? "Anthropic" : "OpenAI";
}

function tr(key) {
  const localized = translations[state.uiLanguage]?.[key];
  if (localized && !/\?{3,}/.test(localized)) {
    return localized;
  }
  return translations.en[key] || key;
}

function setUiLanguage(language) {
  state.uiLanguage = language === "ar" ? "ar" : "en";
  localStorage.setItem("research-intel-ui-language", state.uiLanguage);
  document.documentElement.lang = state.uiLanguage;
  document.documentElement.dir = state.uiLanguage === "ar" ? "rtl" : "ltr";
  document.body.classList.toggle("rtl", state.uiLanguage === "ar");
  syncLanguageSelects();
  syncWorkspaceLanguageToInterface();
  applyTranslations();
  if (state.currentUser) {
    const roleLabel = state.currentUser.role === "admin"
      ? (state.uiLanguage === "ar" ? "\u0645\u0634\u0631\u0641" : "Admin")
      : (state.uiLanguage === "ar" ? "\u0645\u0633\u062a\u062e\u062f\u0645" : "User");
    currentUserRole.textContent = `${roleLabel} - ${state.currentUser.email}`;
  }
  if (state.currentCase) {
    renderCase(state.currentCase);
    renderHistory();
  } else {
    renderSelectedFiles();
  }
}

function syncLanguageSelects() {
  if (authLanguageSelect) {
    authLanguageSelect.value = state.uiLanguage;
  }
  if (appLanguageSelect) {
    appLanguageSelect.value = state.uiLanguage;
  }
}

function getActiveWorkspaceLanguage() {
  return state.uiLanguage === "ar" ? "ar" : "en";
}

function syncWorkspaceLanguageToInterface() {
  const workspaceLanguageSelect = document.querySelector("#workspace-language");
  if (workspaceLanguageSelect) {
    workspaceLanguageSelect.value = getActiveWorkspaceLanguage();
  }
}

Object.assign(translations.en, {
  workspaceTypeUnified: "UAEICP Employee Support",
  historyEyebrow: "History",
  savedWorkspaces: "Saved workspaces",
  profileEyebrow: "Profile",
  updateAccount: "Update your account",
  nameLabel: "Name",
  newPasswordLabel: "New password",
  passwordHelp: "Use at least 8 characters if you change it.",
  passwordKeepHint: "Leave blank to keep your current password",
  saveProfile: "Save Profile",
  adminEyebrow: "Admin",
  createUsers: "Create users",
  roleLabel: "Role",
  createUser: "Create User",
  usersLabel: "Users",
  currentWorkspace: "Current workspace",
  selectOrCreateWorkspace: "Select or create a workspace",
  defaultWorkspaceSubtitle: "Employee intelligence · Guarded mode · Quick depth",
  exportReport: "Export Report",
  archive: "Archive",
  delete: "Delete",
  rerunAnalysis: "Re-run analysis",
  howItWorks: "How it works",
  howItWorksCopy: "Create a workspace, upload files or write a brief, review the analysis, then ask follow-up questions. Each workspace keeps its chat, evidence trail, generated outputs, and review history.",
  modeLabel: "Mode",
  useCaseLabel: "Use Case",
  languageLabelShort: "Interface",
  providerLabelShort: "Provider",
  modelLabelShort: "Model",
  depthLabel: "Depth",
  filesLabelShort: "Files",
  confidenceLabel: "Confidence",
  statusLabel: "Status",
  chatEyebrow: "Chat",
  askWorkspaceInstantly: "Ask the workspace instantly",
  chatHelper: "Ask about requirements, missing information, policy conflicts, evidence, risks, next actions, or anything inside the uploaded files.",
  questionPlaceholder: "Ask a question about the request, policy, case, or uploaded files...",
  overviewTab: "Overview",
  filesTab: "Files",
  studioTab: "Studio",
  reviewTab: "Review",
  executiveBrief: "Executive Brief",
  mainTakeaway: "Main takeaway",
  workingAngle: "Working Angle",
  uncertainty: "Uncertainty",
  findingsLabel: "Findings",
  evidenceLabel: "Evidence",
  contradictionsLabel: "Contradictions",
  openQuestionsLabel: "Open Questions",
  evidenceBacked: "Evidence-backed",
  citedSources: "Cited sources",
  conflictsFound: "Conflicts found",
  requiresReview: "Requires review",
  readinessSnapshot: "Request Snapshot",
  scorecard: "Review scorecard",
  development: "Actions",
  buildNext: "What to do next",
  strengthsTitle: "Clear Points",
  strengthsSubtitle: "What is well supported",
  weaknessesTitle: "Gaps",
  weaknessesSubtitle: "What is missing or unclear",
  opportunitiesTitle: "Improvements",
  opportunitiesSubtitle: "Where the work can improve",
  risksTitle: "Risks",
  risksSubtitle: "Where to be careful",
  grounding: "Grounding",
  suggestedPrompts: "Suggested prompts",
  ragStatus: "RAG status",
  ingestion: "Ingestion",
  uploadReliability: "Upload reliability",
  signals: "Signals",
  keyFindings: "Key findings",
  bestEvidence: "Best evidence",
  reviewEyebrow: "Review",
  flow: "Flow",
  timelineTitle: "Timeline",
  reference: "Reference",
  entitiesTitle: "People, orgs, entities",
  nextSteps: "Next Steps",
  checkNext: "What to check next",
  warnings: "Warnings",
  ambiguityWatchouts: "Ambiguity and watchouts",
  sourceLibrary: "Source Library",
  uploadedDocuments: "Uploaded documents",
  humanReview: "Human Review",
  verificationWorkflow: "Verification workflow",
  statusField: "Status",
  reviewed: "Reviewed",
  needsFollowup: "Needs follow-up",
  verified: "Verified",
  noteLabel: "Note",
  reviewPlaceholder: "What did you verify or what still needs review?",
  saveReview: "Save Review",
  openQuestionsShort: "Open questions",
  noScorecardYet: "No scorecard yet.",
  noSuggestedPromptsYet: "No suggested prompts yet.",
  noUploadedFiles: "No uploaded files found.",
  noItemsReturned: "No items returned.",
  noEntitiesExtracted: "No entities extracted.",
  noLocalPreview: "No local preview available for this file type yet.",
  uploadedSource: "uploaded",
  readyForAnalysis: "ready for analysis",
  remove: "Remove",
  filesCount: "files",
  questionsCount: "questions",
  fileSingular: "file",
  filePlural: "files",
  questionSingular: "question",
  questionPlural: "questions",
  ownerLabel: "Owner",
  reviewOpenFirst: "Open a workspace first.",
  savingReview: "Saving review...",
  reviewSaved: "Review saved.",
  reviewSaveFailed: "Review save failed.",
  noHumanReviewNotesYet: "No human review notes yet.",
  noNoteAdded: "No note added.",
  humanVerificationRecommended: "Human verification is still recommended before relying on these conclusions.",
  answerVerificationNote: "Human verification is recommended for any decision based on this answer.",
  documentGroundedRecommendation: "Document-grounded recommendation",
  ragActiveTitle: "RAG-grounded analysis active",
  ragActiveCopy: "Answers use retrieved document chunks, cited excerpts, and confidence calibration before conclusions are shown.",
  depthWorkflowTitleSuffix: "depth workflow",
  deepDepthCopy: "Deeper retrieval and reasoning are enabled for heavier research passes.",
  quickDepthCopy: "Faster retrieval and lighter reasoning are enabled for a quick first pass.",
  supportedFilesIndexed: "supported files indexed",
  formatsLabel: "Formats",
  unknown: "unknown",
  priority: "priority",
  severity: "severity",
  creatingUser: "Creating user...",
  userCreated: "User created.",
  userCreationFailed: "User creation failed.",
  noUsersYet: "No users yet.",
  savingProfile: "Saving profile...",
  profileUpdated: "Profile updated.",
  profileUpdateFailed: "Profile update failed.",
  archivingWorkspace: "Archiving workspace...",
  workspaceArchived: "Workspace archived.",
  archiveFailed: "Archive failed.",
  deletingWorkspace: "Deleting workspace...",
  workspaceDeleted: "Workspace deleted.",
  deleteFailed: "Delete failed.",
  deleteConfirm: "Delete \"{title}\"? This cannot be undone.",
  analyzing: "Analyzing...",
  reanalyzing: "Re-analyzing...",
  noSavedWorkspacesYet: "No saved workspaces yet.",
  noDocuments: "0 documents",
  agentStudio: "Agent Studio",
  agentStudioTitle: "Create a file from this workspace",
  whatCreate: "What do you want to create?",
  agentInstructionsPlaceholder: "Example: prepare a compliance review, revised document, PowerPoint briefing, internal memo, checklist, or policy comparison from this workspace.",
  agentHelp: "Choose a suggestion or describe the file you need. The system will pick sensible defaults and save the output here.",
  powerPointDeck: "PowerPoint deck",
  complianceReview: "Compliance review",
  revisedDocument: "Draft revised document",
  internalMemo: "Internal memo",
  serviceChecklist: "Service checklist",
  caseSummary: "Case summary",
  policyComparison: "Policy comparison",
  advancedOptions: "Advanced options",
  taskTitle: "Task title",
  taskTitlePlaceholder: "Internal service memo",
  outputFileName: "Output file name",
  outputFileNamePlaceholder: "service-request-summary",
  outputFormat: "Output format",
  agentProvider: "Agent provider",
  agentModel: "Agent model",
  agentModelHelp: "For PowerPoint decks, Claude is recommended for slide structure and concise wording.",
  createFile: "Create File",
  openWorkspace: "Open",
  visualStudio: "Visual Studio",
  visualStudioTitle: "Generate internal communication visuals",
  generationMode: "Generation mode",
  refineCurrentVisual: "Refine current visual",
  generateNewVisual: "Generate something new",
  aspectRatio: "Aspect ratio",
  square: "Square",
  landscape: "Landscape",
  portrait: "Portrait",
  refinementBase: "Refinement base",
  refinementBaseHelp: "If this workspace already has a visual, new prompts will refine the selected base image.",
  visualPrompt: "Visual prompt",
  visualPromptPlaceholder: "Example: create a clean UAEICP-style infographic explaining the service workflow, required documents, and review steps. Then I can refine it further.",
  visualCreditHelp: "This uses extra AI credits and only runs when you click the button below. Keep prompting to refine the latest image until it looks right.",
  generateVisual: "Generate Or Refine Visual"
});

Object.assign(translations.ar, {
  uiLanguageLabel: "\u0644\u063a\u0629 \u0627\u0644\u0648\u0627\u062c\u0647\u0629",
  secureAccess: "\u062f\u062e\u0648\u0644 \u0622\u0645\u0646",
  appTitle: "\u0645\u0633\u0627\u062d\u0629 \u0630\u0643\u0627\u0621 \u0645\u0648\u0638\u0641\u064a UAEICP",
  authCopy: "\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0627\u0644\u062f\u0627\u062e\u0644\u064a\u0629 \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062a \u0648\u0627\u0644\u062a\u0639\u0627\u0645\u064a\u0645 \u0648\u0627\u0644\u0633\u064a\u0627\u0633\u0627\u062a \u0648\u0645\u0647\u0627\u0645 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646 \u0628\u062f\u0639\u0645 \u0630\u0643\u0627\u0621 \u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0645\u0633\u062a\u0646\u062f \u0625\u0644\u0649 \u0627\u0644\u0623\u062f\u0644\u0629.",
  emailLabel: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
  passwordLabel: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
  signIn: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
  signOut: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c",
  researchWorkspace: "\u0645\u0633\u0627\u062d\u0629 UAEICP",
  newWorkspace: "\u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644 \u062c\u062f\u064a\u062f\u0629",
  analyzeNewSet: "\u0627\u0628\u062f\u0623 \u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644 \u0644\u0644\u0645\u0648\u0638\u0641",
  workspaceTitle: "\u0639\u0646\u0648\u0627\u0646 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0639\u0645\u0644",
  workspaceTitlePlaceholder: "\u062a\u0639\u0645\u064a\u0645 / \u0637\u0644\u0628 \u062e\u062f\u0645\u0629 / \u0645\u0630\u0643\u0631\u0629 \u062f\u0627\u062e\u0644\u064a\u0629",
  workspaceType: "\u0646\u0648\u0639 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0639\u0645\u0644",
  workspaceTypeGeneral: "\u062f\u0639\u0645 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646",
  workspaceTypeStartup: "\u062f\u0639\u0645 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646",
  workspaceTypeHelp: "\u0627\u0633\u062a\u062e\u062f\u0645 \u0645\u0633\u0627\u062d\u0629 \u0648\u0627\u062d\u062f\u0629 \u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a UAEICP \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062a \u0648\u0627\u0644\u0633\u064a\u0627\u0633\u0627\u062a \u0648\u0627\u0644\u0645\u0630\u0643\u0631\u0627\u062a \u0648\u0627\u0644\u062a\u0639\u0627\u0645\u064a\u0645 \u0648\u0645\u0647\u0627\u0645 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646.",
  workspaceLanguage: "\u0644\u063a\u0629 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0639\u0645\u0644",
  workspaceLanguageHelp: "\u0633\u064a\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062a\u062d\u0644\u064a\u0644 \u0648\u0627\u0644\u0625\u062c\u0627\u0628\u0627\u062a \u0628\u0647\u0630\u0647 \u0627\u0644\u0644\u063a\u0629.",
  analysisDepth: "\u0639\u0645\u0642 \u0627\u0644\u062a\u062d\u0644\u064a\u0644",
  analysisDepthQuick: "\u0633\u0631\u064a\u0639",
  analysisDepthDeep: "\u0639\u0645\u064a\u0642",
  analysisDepthHelp: "\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0633\u0631\u064a\u0639 \u064a\u0639\u0637\u064a \u0642\u0631\u0627\u0621\u0629 \u0623\u0648\u0644\u064a\u0629 \u0623\u0633\u0631\u0639. \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0639\u0645\u064a\u0642 \u064a\u062e\u0635\u0635 \u0648\u0642\u062a\u064b\u0627 \u0623\u0643\u0628\u0631 \u0644\u0644\u0627\u0633\u062a\u0631\u062c\u0627\u0639 \u0648\u0627\u0644\u0627\u0633\u062a\u062f\u0644\u0627\u0644.",
  guarded: "\u0645\u0642\u064a\u0651\u062f",
  unguarded: "\u063a\u064a\u0631 \u0645\u0642\u064a\u0651\u062f",
  guardedHelp: "\u062a\u062d\u0644\u064a\u0644 \u064a\u0639\u062a\u0645\u062f \u0639\u0644\u0649 \u0627\u0644\u0623\u062f\u0644\u0629 \u0623\u0648\u0644\u064b\u0627 \u0644\u0644\u0645\u0644\u062e\u0635\u0627\u062a \u0648\u0627\u0644\u0645\u062a\u0637\u0644\u0628\u0627\u062a \u0627\u0644\u0646\u0627\u0642\u0635\u0629 \u0648\u0627\u0644\u062a\u0639\u0627\u0631\u0636\u0627\u062a \u0648\u0627\u0644\u0625\u062c\u0627\u0628\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0629 \u0625\u0644\u0649 \u0627\u0644\u0645\u0644\u0641\u0627\u062a.",
  unguardedHelp: "\u062a\u062d\u0644\u064a\u0644 \u0627\u0633\u062a\u0643\u0634\u0627\u0641\u064a \u0644\u0644\u062a\u0641\u0633\u064a\u0631\u0627\u062a \u0627\u0644\u0645\u062d\u062a\u0645\u0644\u0629 \u0648\u0627\u0644\u062a\u062d\u0633\u064a\u0646\u0627\u062a \u0648\u0645\u0648\u0627\u0637\u0646 \u0627\u0644\u063a\u0645\u0648\u0636 \u0648\u062e\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u062e\u0637\u0648\u0627\u062a \u0627\u0644\u062a\u0627\u0644\u064a\u0629.",
  documentsLabel: "\u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a",
  documentsHelp: "\u064a\u0645\u0643\u0646\u0643 \u0627\u062e\u062a\u064a\u0627\u0631 \u0639\u062f\u0629 \u0645\u0644\u0641\u0627\u062a \u062f\u0641\u0639\u0629 \u0648\u0627\u062d\u062f\u0629\u060c \u0623\u0648 \u0625\u0636\u0627\u0641\u0629 \u0645\u0644\u0641\u0627\u062a \u0623\u062e\u0631\u0649 \u0642\u0628\u0644 \u0628\u062f\u0621 \u0627\u0644\u062a\u062d\u0644\u064a\u0644.",
  analysisFocus: "\u0646\u0637\u0627\u0642 \u0627\u0644\u062a\u062d\u0644\u064a\u0644",
  analysisFocusHelp: "\u0645\u0633\u0627\u062d\u0629 \u0622\u0645\u0646\u0629 \u0644\u0645\u0648\u0638\u0641\u064a UAEICP \u0644\u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a\u060c \u062a\u0644\u062e\u064a\u0635 \u0637\u0644\u0628\u0627\u062a \u0627\u0644\u062e\u062f\u0645\u0629\u060c \u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u0633\u064a\u0627\u0633\u0627\u062a\u060c \u0625\u0639\u062f\u0627\u062f \u0627\u0644\u0645\u062e\u0631\u062c\u0627\u062a \u0627\u0644\u062f\u0627\u062e\u0644\u064a\u0629\u060c \u0648\u0637\u0631\u062d \u0623\u0633\u0626\u0644\u0629 \u0645\u062a\u0627\u0628\u0639\u0629.",
  providerLabel: "\u0645\u0632\u0648\u062f \u0627\u0644\u0646\u0645\u0648\u0630\u062c",
  modelLabel: "\u0627\u0644\u0646\u0645\u0648\u0630\u062c",
  askWorkspace: "\u0627\u0633\u0623\u0644 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0639\u0645\u0644",
  answerGenerated: "\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0625\u062c\u0627\u0628\u0629.",
  answerCached: "\u062a\u0645\u062a \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0625\u062c\u0627\u0628\u0629 \u0645\u0646 \u0627\u0644\u0630\u0627\u0643\u0631\u0629 \u0627\u0644\u0645\u0624\u0642\u062a\u0629.",
  noQuestionsYet: "\u0644\u0645 \u064a\u062a\u0645 \u0637\u0631\u062d \u0623\u064a \u0623\u0633\u0626\u0644\u0629 \u0628\u0639\u062f.",
  keyPoints: "\u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
  supportingPoints: "\u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u062f\u0627\u0639\u0645\u0629",
  counterpoints: "\u0646\u0642\u0627\u0637 \u0645\u0642\u0627\u0628\u0644\u0629",
  speculativeLeads: "\u0627\u062d\u062a\u0645\u0627\u0644\u0627\u062a \u0627\u0633\u062a\u0643\u0634\u0627\u0641\u064a\u0629",
  nextQuestions: "\u0623\u0633\u0626\u0644\u0629 \u062a\u0627\u0644\u064a\u0629",
  uncertaintyHandling: "\u0627\u0644\u062a\u0639\u0627\u0645\u0644 \u0645\u0639 \u0639\u062f\u0645 \u0627\u0644\u064a\u0642\u064a\u0646",
  verificationRequired: "\u062a\u062a\u0637\u0644\u0628 \u0645\u0631\u0627\u062c\u0639\u0629",
  citationPending: "\u0627\u0644\u0627\u0633\u062a\u0634\u0647\u0627\u062f \u0642\u064a\u062f \u0627\u0644\u0625\u0636\u0627\u0641\u0629",
  noDocumentsSelected: "\u0644\u0645 \u064a\u062a\u0645 \u0627\u062e\u062a\u064a\u0627\u0631 \u0623\u064a \u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0628\u0639\u062f.",
  uploadAnalyze: "\u0627\u0631\u0641\u0639 \u0648\u062d\u0644\u0651\u0644",
  agentStudio: "\u0627\u0633\u062a\u0648\u062f\u064a\u0648 \u0627\u0644\u0645\u0647\u0627\u0645",
  agentStudioTitle: "\u0623\u0646\u0634\u0626 \u0645\u0644\u0641\u064b\u0627 \u0645\u0646 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0639\u0645\u0644",
  whatCreate: "\u0645\u0627 \u0627\u0644\u0630\u064a \u062a\u0631\u064a\u062f \u0625\u0646\u0634\u0627\u0621\u0647\u061f",
  agentInstructionsPlaceholder: "\u0645\u062b\u0627\u0644: \u0623\u0639\u062f\u0651 \u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0645\u062a\u062b\u0627\u0644\u060c \u0623\u0648 \u0645\u0633\u0648\u062f\u0629 \u0645\u0646\u0642\u062d\u0629\u060c \u0623\u0648 \u0639\u0631\u0636 PowerPoint\u060c \u0623\u0648 \u0645\u0630\u0643\u0631\u0629 \u062f\u0627\u062e\u0644\u064a\u0629\u060c \u0623\u0648 \u0642\u0627\u0626\u0645\u0629 \u062a\u062d\u0642\u0642\u060c \u0623\u0648 \u0645\u0642\u0627\u0631\u0646\u0629 \u0633\u064a\u0627\u0633\u0627\u062a \u0645\u0646 \u0647\u0630\u0647 \u0627\u0644\u0645\u0633\u0627\u062d\u0629.",
  agentHelp: "\u0627\u062e\u062a\u0631 \u0627\u0642\u062a\u0631\u0627\u062d\u064b\u0627 \u0623\u0648 \u0627\u0643\u062a\u0628 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0630\u064a \u062a\u062d\u062a\u0627\u062c\u0647. \u0633\u064a\u062e\u062a\u0627\u0631 \u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629 \u0648\u064a\u062d\u0641\u0638 \u0627\u0644\u0645\u062e\u0631\u062c \u0647\u0646\u0627.",
  powerPointDeck: "\u0639\u0631\u0636 PowerPoint",
  complianceReview: "\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644",
  revisedDocument: "\u0645\u0633\u0648\u062f\u0629 \u0645\u0646\u0642\u062d\u0629",
  internalMemo: "\u0645\u0630\u0643\u0631\u0629 \u062f\u0627\u062e\u0644\u064a\u0629",
  serviceChecklist: "\u0642\u0627\u0626\u0645\u0629 \u062a\u062d\u0642\u0642",
  caseSummary: "\u0645\u0644\u062e\u0635 \u062d\u0627\u0644\u0629",
  policyComparison: "\u0645\u0642\u0627\u0631\u0646\u0629 \u0633\u064a\u0627\u0633\u0627\u062a",
  advancedOptions: "\u062e\u064a\u0627\u0631\u0627\u062a \u0645\u062a\u0642\u062f\u0645\u0629",
  taskTitle: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0647\u0645\u0629",
  taskTitlePlaceholder: "\u0645\u0630\u0643\u0631\u0629 \u062e\u062f\u0645\u0629 \u062f\u0627\u062e\u0644\u064a\u0629",
  outputFileName: "\u0627\u0633\u0645 \u0645\u0644\u0641 \u0627\u0644\u0645\u062e\u0631\u062c",
  outputFileNamePlaceholder: "service-request-summary",
  outputFormat: "\u0635\u064a\u063a\u0629 \u0627\u0644\u0645\u062e\u0631\u062c",
  agentProvider: "\u0645\u0632\u0648\u062f \u0627\u0644\u0645\u0647\u0645\u0629",
  agentModel: "\u0646\u0645\u0648\u0630\u062c \u0627\u0644\u0645\u0647\u0645\u0629",
  agentModelHelp: "\u0644\u0639\u0631\u0648\u0636 PowerPoint\u060c \u064a\u0648\u0635\u0649 \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 Claude \u0644\u0628\u0646\u064a\u0629 \u0627\u0644\u0634\u0631\u0627\u0626\u062d \u0648\u0627\u0644\u0635\u064a\u0627\u063a\u0629 \u0627\u0644\u0645\u062e\u062a\u0635\u0631\u0629.",
  createFile: "\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0644\u0641",
  openWorkspace: "\u0641\u062a\u062d",
  visualStudio: "\u0627\u0633\u062a\u0648\u062f\u064a\u0648 \u0627\u0644\u0645\u0631\u0626\u064a\u0627\u062a",
  visualStudioTitle: "\u0625\u0646\u0634\u0627\u0621 \u0645\u0631\u0626\u064a\u0627\u062a \u0644\u0644\u062a\u0648\u0627\u0635\u0644 \u0627\u0644\u062f\u0627\u062e\u0644\u064a",
  generationMode: "\u0646\u0645\u0637 \u0627\u0644\u0625\u0646\u0634\u0627\u0621",
  refineCurrentVisual: "\u062a\u062d\u0633\u064a\u0646 \u0627\u0644\u0645\u0631\u0626\u064a \u0627\u0644\u062d\u0627\u0644\u064a",
  generateNewVisual: "\u0625\u0646\u0634\u0627\u0621 \u0645\u0631\u0626\u064a \u062c\u062f\u064a\u062f",
  aspectRatio: "\u0646\u0633\u0628\u0629 \u0627\u0644\u0623\u0628\u0639\u0627\u062f",
  square: "\u0645\u0631\u0628\u0639",
  landscape: "\u0623\u0641\u0642\u064a",
  portrait: "\u0639\u0645\u0648\u062f\u064a",
  refinementBase: "\u0623\u0633\u0627\u0633 \u0627\u0644\u062a\u062d\u0633\u064a\u0646",
  refinementBaseHelp: "\u0625\u0630\u0627 \u0643\u0627\u0646 \u0644\u0647\u0630\u0647 \u0627\u0644\u0645\u0633\u0627\u062d\u0629 \u0645\u0631\u0626\u064a \u0633\u0627\u0628\u0642\u060c \u0641\u0633\u062a\u0642\u0648\u0645 \u0627\u0644\u0645\u0637\u0627\u0644\u0628\u0627\u062a \u0627\u0644\u062c\u062f\u064a\u062f\u0629 \u0628\u062a\u062d\u0633\u064a\u0646 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u062d\u062f\u062f\u0629.",
  visualPrompt: "\u0648\u0635\u0641 \u0627\u0644\u0645\u0631\u0626\u064a",
  visualPromptPlaceholder: "\u0645\u062b\u0627\u0644: \u0623\u0646\u0634\u0626 \u0625\u0646\u0641\u0648\u063a\u0631\u0627\u0641\u064a\u0643 \u0628\u0623\u0633\u0644\u0648\u0628 UAEICP \u064a\u0634\u0631\u062d \u0633\u064a\u0631 \u0627\u0644\u062e\u062f\u0645\u0629 \u0648\u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0648\u062e\u0637\u0648\u0627\u062a \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629.",
  visualCreditHelp: "\u064a\u0633\u062a\u062e\u062f\u0645 \u0647\u0630\u0627 \u0623\u0631\u0635\u062f\u0629 AI \u0625\u0636\u0627\u0641\u064a\u0629 \u0648\u0644\u0646 \u064a\u0639\u0645\u0644 \u0625\u0644\u0627 \u0639\u0646\u062f \u0627\u0644\u0636\u063a\u0637 \u0639\u0644\u0649 \u0627\u0644\u0632\u0631.",
  generateVisual: "\u0625\u0646\u0634\u0627\u0621 \u0623\u0648 \u062a\u062d\u0633\u064a\u0646 \u0627\u0644\u0645\u0631\u0626\u064a",
  workspaceTypeUnified: "\u062f\u0639\u0645 \u0645\u0648\u0638\u0641\u064a UAEICP",
  historyEyebrow: "\u0627\u0644\u0633\u062c\u0644",
  savedWorkspaces: "\u0645\u0633\u0627\u062d\u0627\u062a \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0645\u062d\u0641\u0648\u0638\u0629",
  profileEyebrow: "\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062e\u0635\u064a",
  updateAccount: "\u062d\u062f\u0651\u062b \u062d\u0633\u0627\u0628\u0643",
  nameLabel: "\u0627\u0644\u0627\u0633\u0645",
  newPasswordLabel: "\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062c\u062f\u064a\u062f\u0629",
  passwordHelp: "\u0627\u0633\u062a\u062e\u062f\u0645 8 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0625\u0630\u0627 \u0642\u0645\u062a \u0628\u062a\u063a\u064a\u064a\u0631\u0647\u0627.",
  passwordKeepHint: "\u0627\u062a\u0631\u0643 \u0647\u0630\u0627 \u0627\u0644\u062d\u0642\u0644 \u0641\u0627\u0631\u063a\u064b\u0627 \u0644\u0644\u062d\u0641\u0627\u0638 \u0639\u0644\u0649 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062d\u0627\u0644\u064a\u0629",
  saveProfile: "\u062d\u0641\u0638 \u0627\u0644\u0645\u0644\u0641",
  adminEyebrow: "\u0627\u0644\u0625\u062f\u0627\u0631\u0629",
  createUsers: "\u0625\u0646\u0634\u0627\u0621 \u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646",
  roleLabel: "\u0627\u0644\u062f\u0648\u0631",
  createUser: "\u0625\u0646\u0634\u0627\u0621 \u0645\u0633\u062a\u062e\u062f\u0645",
  usersLabel: "\u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u0648\u0646",
  currentWorkspace: "\u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u062d\u0627\u0644\u064a\u0629",
  selectOrCreateWorkspace: "\u0627\u062e\u062a\u0631 \u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644 \u0623\u0648 \u0623\u0646\u0634\u0626 \u0648\u0627\u062d\u062f\u0629",
  defaultWorkspaceSubtitle: "\u0630\u0643\u0627\u0621 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646 \u00b7 \u0648\u0636\u0639 \u0645\u0642\u064a\u0651\u062f \u00b7 \u0639\u0645\u0642 \u0633\u0631\u064a\u0639",
  exportReport: "\u062a\u0635\u062f\u064a\u0631 \u0627\u0644\u062a\u0642\u0631\u064a\u0631",
  archive: "\u0623\u0631\u0634\u0641\u0629",
  delete: "\u062d\u0630\u0641",
  rerunAnalysis: "\u0625\u0639\u0627\u062f\u0629 \u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u062a\u062d\u0644\u064a\u0644",
  howItWorks: "\u0643\u064a\u0641 \u064a\u0639\u0645\u0644",
  howItWorksCopy: "\u0623\u0646\u0634\u0626 \u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644\u060c \u0627\u0631\u0641\u0639 \u0645\u0644\u0641\u0627\u062a \u0623\u0648 \u0627\u0643\u062a\u0628 \u0648\u0635\u0641\u064b\u0627 \u0644\u0644\u0637\u0644\u0628\u060c \u0631\u0627\u062c\u0639 \u0627\u0644\u062a\u062d\u0644\u064a\u0644\u060c \u062b\u0645 \u0627\u0637\u0631\u062d \u0623\u0633\u0626\u0644\u0629 \u0645\u062a\u0627\u0628\u0639\u0629. \u062a\u062d\u062a\u0641\u0638 \u0643\u0644 \u0645\u0633\u0627\u062d\u0629 \u0628\u0627\u0644\u062f\u0631\u062f\u0634\u0629 \u0648\u0627\u0644\u0623\u062f\u0644\u0629 \u0648\u0627\u0644\u0645\u062e\u0631\u062c\u0627\u062a \u0648\u0633\u062c\u0644 \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629.",
  modeLabel: "\u0627\u0644\u0648\u0636\u0639",
  useCaseLabel: "\u062d\u0627\u0644\u0629 \u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645",
  languageLabelShort: "\u0627\u0644\u0648\u0627\u062c\u0647\u0629",
  providerLabelShort: "\u0627\u0644\u0645\u0632\u0648\u062f",
  modelLabelShort: "\u0627\u0644\u0646\u0645\u0648\u0630\u062c",
  depthLabel: "\u0627\u0644\u0639\u0645\u0642",
  filesLabelShort: "\u0627\u0644\u0645\u0644\u0641\u0627\u062a",
  confidenceLabel: "\u0627\u0644\u062b\u0642\u0629",
  statusLabel: "\u0627\u0644\u062d\u0627\u0644\u0629",
  chatEyebrow: "\u0627\u0644\u062f\u0631\u062f\u0634\u0629",
  askWorkspaceInstantly: "\u0627\u0633\u0623\u0644 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0639\u0645\u0644 \u0641\u0648\u0631\u064b\u0627",
  chatHelper: "\u0627\u0633\u0623\u0644 \u0639\u0646 \u0627\u0644\u0645\u062a\u0637\u0644\u0628\u0627\u062a\u060c \u0627\u0644\u0646\u0648\u0627\u0642\u0635\u060c \u062a\u0639\u0627\u0631\u0636 \u0627\u0644\u0633\u064a\u0627\u0633\u0627\u062a\u060c \u0627\u0644\u0623\u062f\u0644\u0629\u060c \u0627\u0644\u0645\u062e\u0627\u0637\u0631\u060c \u0627\u0644\u062e\u0637\u0648\u0627\u062a \u0627\u0644\u062a\u0627\u0644\u064a\u0629\u060c \u0623\u0648 \u0623\u064a \u0634\u064a\u0621 \u062f\u0627\u062e\u0644 \u0627\u0644\u0645\u0644\u0641\u0627\u062a.",
  questionPlaceholder: "\u0627\u0637\u0631\u062d \u0633\u0624\u0627\u0644\u064b\u0627 \u0639\u0646 \u0627\u0644\u0637\u0644\u0628 \u0623\u0648 \u0627\u0644\u0633\u064a\u0627\u0633\u0629 \u0623\u0648 \u0627\u0644\u062d\u0627\u0644\u0629 \u0623\u0648 \u0627\u0644\u0645\u0644\u0641\u0627\u062a...",
  overviewTab: "\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629",
  filesTab: "\u0627\u0644\u0645\u0644\u0641\u0627\u062a",
  studioTab: "\u0627\u0644\u0627\u0633\u062a\u0648\u062f\u064a\u0648",
  reviewTab: "\u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629",
  executiveBrief: "\u0627\u0644\u0645\u0644\u062e\u0635 \u0627\u0644\u062a\u0646\u0641\u064a\u0630\u064a",
  mainTakeaway: "\u0627\u0644\u062e\u0644\u0627\u0635\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
  workingAngle: "\u0632\u0627\u0648\u064a\u0629 \u0627\u0644\u062a\u062d\u0644\u064a\u0644",
  uncertainty: "\u0639\u062f\u0645 \u0627\u0644\u064a\u0642\u064a\u0646",
  findingsLabel: "\u0627\u0644\u0627\u0633\u062a\u0646\u062a\u0627\u062c\u0627\u062a",
  evidenceLabel: "\u0627\u0644\u0623\u062f\u0644\u0629",
  contradictionsLabel: "\u0627\u0644\u062a\u0646\u0627\u0642\u0636\u0627\u062a",
  openQuestionsLabel: "\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0645\u0641\u062a\u0648\u062d\u0629",
  evidenceBacked: "\u0645\u062f\u0639\u0648\u0645\u0629 \u0628\u0627\u0644\u0623\u062f\u0644\u0629",
  citedSources: "\u0645\u0635\u0627\u062f\u0631 \u0645\u0648\u062b\u0642\u0629",
  conflictsFound: "\u062a\u0639\u0627\u0631\u0636\u0627\u062a \u0645\u0643\u062a\u0634\u0641\u0629",
  requiresReview: "\u062a\u062d\u062a\u0627\u062c \u0645\u0631\u0627\u062c\u0639\u0629",
  readinessSnapshot: "\u0644\u0642\u0637\u0629 \u0627\u0644\u0637\u0644\u0628",
  scorecard: "\u0628\u0637\u0627\u0642\u0629 \u062a\u0642\u064a\u064a\u0645 \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629",
  development: "\u0627\u0644\u0625\u062c\u0631\u0627\u0621\u0627\u062a",
  buildNext: "\u0645\u0627 \u0627\u0644\u0630\u064a \u064a\u062c\u0628 \u0639\u0645\u0644\u0647 \u0628\u0639\u062f \u0630\u0644\u0643",
  strengthsTitle: "\u0646\u0642\u0627\u0637 \u0648\u0627\u0636\u062d\u0629",
  strengthsSubtitle: "\u0645\u0627 \u0647\u0648 \u0645\u062f\u0639\u0648\u0645 \u0628\u0634\u0643\u0644 \u062c\u064a\u062f",
  weaknessesTitle: "\u0627\u0644\u0646\u0648\u0627\u0642\u0635",
  weaknessesSubtitle: "\u0645\u0627 \u0647\u0648 \u0645\u0641\u0642\u0648\u062f \u0623\u0648 \u063a\u064a\u0631 \u0648\u0627\u0636\u062d",
  opportunitiesTitle: "\u0627\u0644\u062a\u062d\u0633\u064a\u0646\u0627\u062a",
  opportunitiesSubtitle: "\u0623\u064a\u0646 \u064a\u0645\u0643\u0646 \u062a\u062d\u0633\u064a\u0646 \u0627\u0644\u0639\u0645\u0644",
  risksTitle: "\u0627\u0644\u0645\u062e\u0627\u0637\u0631",
  risksSubtitle: "\u0623\u064a\u0646 \u064a\u062c\u0628 \u0627\u0644\u062d\u0630\u0631",
  grounding: "\u0627\u0644\u0627\u0633\u062a\u0646\u0627\u062f",
  suggestedPrompts: "\u0623\u0633\u0626\u0644\u0629 \u0645\u0642\u062a\u0631\u062d\u0629",
  ragStatus: "\u062d\u0627\u0644\u0629 RAG",
  ingestion: "\u0627\u0644\u0627\u0633\u062a\u064a\u0639\u0627\u0628",
  uploadReliability: "\u0645\u0648\u062b\u0648\u0642\u064a\u0629 \u0627\u0644\u0631\u0641\u0639",
  signals: "\u0627\u0644\u0625\u0634\u0627\u0631\u0627\u062a",
  keyFindings: "\u0623\u0647\u0645 \u0627\u0644\u0627\u0633\u062a\u0646\u062a\u0627\u062c\u0627\u062a",
  bestEvidence: "\u0623\u0642\u0648\u0649 \u0627\u0644\u0623\u062f\u0644\u0629",
  reviewEyebrow: "\u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629",
  flow: "\u0627\u0644\u062a\u0633\u0644\u0633\u0644",
  timelineTitle: "\u0627\u0644\u062c\u062f\u0648\u0644 \u0627\u0644\u0632\u0645\u0646\u064a",
  reference: "\u0645\u0631\u062c\u0639",
  entitiesTitle: "\u0627\u0644\u0623\u0634\u062e\u0627\u0635 \u0648\u0627\u0644\u062c\u0647\u0627\u062a \u0648\u0627\u0644\u0643\u064a\u0627\u0646\u0627\u062a",
  nextSteps: "\u0627\u0644\u062e\u0637\u0648\u0627\u062a \u0627\u0644\u062a\u0627\u0644\u064a\u0629",
  checkNext: "\u0645\u0627 \u0627\u0644\u0630\u064a \u064a\u062c\u0628 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646\u0647 \u0628\u0639\u062f \u0630\u0644\u0643",
  warnings: "\u062a\u062d\u0630\u064a\u0631\u0627\u062a",
  ambiguityWatchouts: "\u0646\u0642\u0627\u0637 \u0627\u0644\u063a\u0645\u0648\u0636 \u0648\u0627\u0644\u0627\u0646\u062a\u0628\u0627\u0647",
  sourceLibrary: "\u0645\u0643\u062a\u0628\u0629 \u0627\u0644\u0645\u0635\u0627\u062f\u0631",
  uploadedDocuments: "\u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0627\u0644\u0645\u0631\u0641\u0648\u0639\u0629",
  humanReview: "\u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0628\u0634\u0631\u064a\u0629",
  verificationWorkflow: "\u0645\u0633\u0627\u0631 \u0627\u0644\u062a\u062d\u0642\u0642",
  statusField: "\u0627\u0644\u062d\u0627\u0644\u0629",
  reviewed: "\u062a\u0645\u062a \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629",
  needsFollowup: "\u062a\u062d\u062a\u0627\u062c \u0645\u062a\u0627\u0628\u0639\u0629",
  verified: "\u0645\u0624\u0643\u062f",
  noteLabel: "\u0645\u0644\u0627\u062d\u0638\u0629",
  reviewPlaceholder: "\u0645\u0627 \u0627\u0644\u0630\u064a \u062a\u0645 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646\u0647 \u0623\u0648 \u0645\u0627 \u0627\u0644\u0630\u064a \u0645\u0627 \u0632\u0627\u0644 \u064a\u062d\u062a\u0627\u062c \u0645\u0631\u0627\u062c\u0639\u0629\u061f",
  saveReview: "\u062d\u0641\u0638 \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629",
  openQuestionsShort: "\u0623\u0633\u0626\u0644\u0629 \u0645\u0641\u062a\u0648\u062d\u0629",
  noScorecardYet: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u0637\u0627\u0642\u0629 \u062a\u0642\u064a\u064a\u0645 \u0628\u0639\u062f.",
  noSuggestedPromptsYet: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0623\u0633\u0626\u0644\u0629 \u0645\u0642\u062a\u0631\u062d\u0629 \u0628\u0639\u062f.",
  noUploadedFiles: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0644\u0641\u0627\u062a \u0645\u0631\u0641\u0648\u0639\u0629.",
  noItemsReturned: "\u0644\u0645 \u064a\u062a\u0645 \u0625\u0631\u062c\u0627\u0639 \u0623\u064a \u0639\u0646\u0627\u0635\u0631.",
  noEntitiesExtracted: "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0633\u062a\u062e\u0631\u0627\u062c \u0623\u064a \u0643\u064a\u0627\u0646\u0627\u062a.",
  noLocalPreview: "\u0644\u0627 \u064a\u0648\u062c\u062f \u0645\u0639\u0627\u064a\u0646\u0629 \u0645\u062d\u0644\u064a\u0629 \u0645\u062a\u0627\u062d\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0646\u0648\u0639 \u0645\u0646 \u0627\u0644\u0645\u0644\u0641\u0627\u062a \u062d\u062a\u0649 \u0627\u0644\u0622\u0646.",
  uploadedSource: "\u062a\u0645 \u0631\u0641\u0639\u0647",
  readyForAnalysis: "\u062c\u0627\u0647\u0632\u0629 \u0644\u0644\u062a\u062d\u0644\u064a\u0644",
  remove: "\u0625\u0632\u0627\u0644\u0629",
  filesCount: "\u0645\u0644\u0641\u0627\u062a",
  questionsCount: "\u0623\u0633\u0626\u0644\u0629",
  fileSingular: "\u0645\u0644\u0641",
  filePlural: "\u0645\u0644\u0641",
  questionSingular: "\u0633\u0624\u0627\u0644",
  questionPlural: "\u0633\u0624\u0627\u0644",
  ownerLabel: "\u0627\u0644\u0645\u0627\u0644\u0643",
  reviewOpenFirst: "\u0627\u0641\u062a\u062d \u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644 \u0623\u0648\u0644\u064b\u0627.",
  savingReview: "\u062c\u0627\u0631\u064d \u062d\u0641\u0638 \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629...",
  reviewSaved: "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629.",
  reviewSaveFailed: "\u0641\u0634\u0644 \u062d\u0641\u0638 \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629.",
  noHumanReviewNotesYet: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0645\u0631\u0627\u062c\u0639\u0629 \u0628\u0634\u0631\u064a\u0629 \u0628\u0639\u062f.",
  noNoteAdded: "\u0644\u0645 \u062a\u064f\u0636\u0641 \u0645\u0644\u0627\u062d\u0638\u0629.",
  humanVerificationRecommended: "\u0645\u0627 \u0632\u0627\u0644\u062a \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0628\u0634\u0631\u064a\u0629 \u0645\u0648\u0635\u0649 \u0628\u0647\u0627 \u0642\u0628\u0644 \u0627\u0644\u0627\u0639\u062a\u0645\u0627\u062f \u0639\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0627\u0633\u062a\u0646\u062a\u0627\u062c\u0627\u062a.",
  answerVerificationNote: "\u062a\u0648\u0635\u0649 \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0628\u0634\u0631\u064a\u0629 \u0644\u0623\u064a \u0642\u0631\u0627\u0631 \u064a\u0639\u062a\u0645\u062f \u0639\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0625\u062c\u0627\u0628\u0629.",
  documentGroundedRecommendation: "\u062a\u0648\u0635\u064a\u0629 \u0645\u0633\u062a\u0646\u062f\u0629 \u0625\u0644\u0649 \u0627\u0644\u0645\u0644\u0641\u0627\u062a",
  ragActiveTitle: "\u062a\u0641\u0639\u064a\u0644 \u062a\u062d\u0644\u064a\u0644 \u0645\u0633\u062a\u0646\u062f \u0625\u0644\u0649 RAG",
  ragActiveCopy: "\u062a\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0625\u062c\u0627\u0628\u0627\u062a \u0623\u062c\u0632\u0627\u0621 \u0645\u0633\u062a\u0631\u062c\u0639\u0629 \u0645\u0646 \u0627\u0644\u0645\u0644\u0641\u0627\u062a\u060c \u0648\u0627\u0642\u062a\u0628\u0627\u0633\u0627\u062a \u0645\u0648\u062b\u0642\u0629\u060c \u0648\u0645\u0639\u0627\u064a\u0631 \u062b\u0642\u0629 \u0642\u0628\u0644 \u0639\u0631\u0636 \u0627\u0644\u0627\u0633\u062a\u0646\u062a\u0627\u062c\u0627\u062a.",
  depthWorkflowTitleSuffix: "\u0644\u0622\u0644\u064a\u0629 \u0627\u0644\u0639\u0645\u0642",
  deepDepthCopy: "\u064a\u062a\u0645 \u062a\u0641\u0639\u064a\u0644 \u0627\u0633\u062a\u0631\u062c\u0627\u0639 \u0623\u0639\u0645\u0642 \u0648\u0627\u0633\u062a\u062f\u0644\u0627\u0644 \u0623\u0643\u062b\u0631 \u0644\u0645\u0647\u0627\u0645 \u0627\u0644\u0628\u062d\u062b \u0627\u0644\u0623\u062b\u0642\u0644.",
  quickDepthCopy: "\u064a\u062a\u0645 \u062a\u0641\u0639\u064a\u0644 \u0627\u0633\u062a\u0631\u062c\u0627\u0639 \u0623\u0633\u0631\u0639 \u0648\u0627\u0633\u062a\u062f\u0644\u0627\u0644 \u0623\u062e\u0641 \u0644\u0644\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0623\u0648\u0644\u064a\u0629.",
  supportedFilesIndexed: "\u0645\u0644\u0641\u0627\u062a \u0645\u062f\u0639\u0648\u0645\u0629 \u062a\u0645 \u0641\u0647\u0631\u0633\u062a\u0647\u0627",
  formatsLabel: "\u0627\u0644\u062a\u0646\u0633\u064a\u0642\u0627\u062a",
  unknown: "\u063a\u064a\u0631 \u0645\u0639\u0631\u0648\u0641",
  priority: "\u0623\u0648\u0644\u0648\u064a\u0629",
  severity: "\u0634\u062f\u0629",
  creatingUser: "\u062c\u0627\u0631\u064d \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645...",
  userCreated: "\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645.",
  userCreationFailed: "\u0641\u0634\u0644 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645.",
  noUsersYet: "\u0644\u0627 \u064a\u0648\u062c\u062f \u0645\u0633\u062a\u062e\u062f\u0645\u0648\u0646 \u0628\u0639\u062f.",
  savingProfile: "\u062c\u0627\u0631\u064d \u062d\u0641\u0638 \u0627\u0644\u0645\u0644\u0641...",
  profileUpdated: "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u0644\u0641.",
  profileUpdateFailed: "\u0641\u0634\u0644 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u0644\u0641.",
  archivingWorkspace: "\u062c\u0627\u0631\u064d \u0623\u0631\u0634\u0641\u0629 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0639\u0645\u0644...",
  workspaceArchived: "\u062a\u0645\u062a \u0623\u0631\u0634\u0641\u0629 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0639\u0645\u0644.",
  archiveFailed: "\u0641\u0634\u0644\u062a \u0627\u0644\u0623\u0631\u0634\u0641\u0629.",
  deletingWorkspace: "\u062c\u0627\u0631\u064d \u062d\u0630\u0641 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0639\u0645\u0644...",
  workspaceDeleted: "\u062a\u0645 \u062d\u0630\u0641 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0639\u0645\u0644.",
  deleteFailed: "\u0641\u0634\u0644 \u0627\u0644\u062d\u0630\u0641.",
  deleteConfirm: "\u0647\u0644 \u062a\u0631\u064a\u062f \u062d\u0630\u0641 \"{title}\" \u061f \u0644\u0627 \u064a\u0645\u0643\u0646 \u0627\u0644\u062a\u0631\u0627\u062c\u0639 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0625\u062c\u0631\u0627\u0621.",
  analyzing: "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0644\u064a\u0644...",
  reanalyzing: "\u062c\u0627\u0631\u064d \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u062d\u0644\u064a\u0644...",
  noSavedWorkspacesYet: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0633\u0627\u062d\u0627\u062a \u0639\u0645\u0644 \u0645\u062d\u0641\u0648\u0638\u0629 \u0628\u0639\u062f.",
  noDocuments: "0 \u0645\u0644\u0641\u0627\u062a"
});

function formatModeLabel(value) {
  const mode = String(value || "guarded").toLowerCase();
  if (mode === "guarded") return tr("guarded");
  if (mode === "unguarded") return tr("unguarded");
  return capitalize(mode);
}

function formatDepthLabel(value) {
  const depth = String(value || "quick").toLowerCase();
  if (depth === "quick") return tr("analysisDepthQuick");
  if (depth === "deep") return tr("analysisDepthDeep");
  return capitalize(depth);
}

function formatWorkspaceStatus(value) {
  const status = String(value || "ready").toLowerCase();
  const statusMap = {
    ready: state.uiLanguage === "ar" ? "\u062c\u0627\u0647\u0632" : "Ready",
    archived: state.uiLanguage === "ar" ? "\u0645\u0624\u0631\u0634\u0641" : "Archived",
    analyzing: state.uiLanguage === "ar" ? "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0644\u064a\u0644" : "Analyzing",
    processing: state.uiLanguage === "ar" ? "\u062c\u0627\u0631\u064d \u0627\u0644\u0645\u0639\u0627\u0644\u062c\u0629" : "Processing"
  };
  return statusMap[status] || status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatReviewStatus(value) {
  const status = String(value || "").toLowerCase();
  const reviewMap = {
    reviewed: tr("reviewed"),
    needs_followup: tr("needsFollowup"),
    verified: tr("verified")
  };
  return reviewMap[status] || status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatRoleLabel(role) {
  return String(role || "user").toLowerCase() === "admin"
    ? (state.uiLanguage === "ar" ? "\u0645\u0634\u0631\u0641" : "Admin")
    : (state.uiLanguage === "ar" ? "\u0645\u0633\u062a\u062e\u062f\u0645" : "User");
}

function formatConfidence(value) {
  const confidence = String(value || "").toLowerCase();
  const confidenceMap = {
    confirmed: state.uiLanguage === "ar" ? "\u0645\u0624\u0643\u062f" : "Confirmed",
    probable: state.uiLanguage === "ar" ? "\u0645\u0631\u062c\u062d" : "Probable",
    possible: state.uiLanguage === "ar" ? "\u0645\u062d\u062a\u0645\u0644" : "Possible",
    insufficient_evidence: state.uiLanguage === "ar" ? "\u0623\u062f\u0644\u0629 \u063a\u064a\u0631 \u0643\u0627\u0641\u064a\u0629" : "Insufficient Evidence"
  };
  return confidenceMap[confidence] || confidence.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatWorkspaceType() {
  return tr("workspaceTypeUnified");
}

function formatWorkspaceLanguage(value) {
  return value === "ar" ? "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" : "English";
}

function formatItemCount(value, singularKey, pluralKey) {
  const count = Number(value || 0);
  if (state.uiLanguage === "ar") {
    return `${count} ${tr(pluralKey)}`;
  }
  return `${count} ${count === 1 ? tr(singularKey) : tr(pluralKey)}`;
}

function setText(selector, key) {
  const node = document.querySelector(selector);
  if (node) {
    node.textContent = tr(key);
  }
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    node.textContent = tr(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.dataset.i18nPlaceholder;
    node.setAttribute("placeholder", tr(key));
  });
  document.querySelectorAll("option[data-i18n]").forEach((node) => {
    node.textContent = tr(node.dataset.i18n);
  });

  setText("#analysis-focus-label", "analysisFocus");
  setText("#analysis-focus-help", "analysisFocusHelp");
  setText("#documents-help", "documentsHelp");
  setText("#provider-label", "providerLabel");
  setText("#model-label", "modelLabel");

  setText("#auth-screen .auth-copy", "authCopy");
  setText(".sidebar section:nth-of-type(2) .eyebrow", "historyEyebrow");
  setText(".sidebar section:nth-of-type(2) h2", "savedWorkspaces");
  setText(".sidebar section:nth-of-type(3) .eyebrow", "profileEyebrow");
  setText(".sidebar section:nth-of-type(3) h2", "updateAccount");
  setText(".sidebar section:nth-of-type(4) .eyebrow", "adminEyebrow");
  setText(".sidebar section:nth-of-type(4) h2", "createUsers");
  setText(".user-list-wrap .list-title", "usersLabel");
  setText(".workspace-heading .eyebrow", "currentWorkspace");
  setText("#export-button", "exportReport");
  setText("#archive-button", "archive");
  setText("#delete-button", "delete");
  setText("#reanalyze-button", "rerunAnalysis");

  const profileLabels = document.querySelectorAll("#profile-form .field > span");
  if (profileLabels[0]) profileLabels[0].textContent = tr("nameLabel");
  if (profileLabels[1]) profileLabels[1].textContent = tr("newPasswordLabel");
  const profilePassword = document.querySelector("#profile-password");
  if (profilePassword) profilePassword.placeholder = tr("passwordKeepHint");
  const profileHelp = document.querySelector("#profile-form .field small");
  if (profileHelp) profileHelp.textContent = tr("passwordHelp");
  setText("#save-profile-button", "saveProfile");

  const userLabels = document.querySelectorAll("#user-form .field > span");
  if (userLabels[0]) userLabels[0].textContent = tr("nameLabel");
  if (userLabels[1]) userLabels[1].textContent = tr("emailLabel");
  if (userLabels[2]) userLabels[2].textContent = tr("passwordLabel");
  if (userLabels[3]) userLabels[3].textContent = tr("roleLabel");
  setText("#create-user-button", "createUser");
  const userRoleOption = document.querySelector('#user-role option[value="user"]');
  const adminRoleOption = document.querySelector('#user-role option[value="admin"]');
  if (userRoleOption) userRoleOption.textContent = state.uiLanguage === "ar" ? "\u0645\u0633\u062a\u062e\u062f\u0645" : "User";
  if (adminRoleOption) adminRoleOption.textContent = state.uiLanguage === "ar" ? "\u0645\u0634\u0631\u0641" : "Admin";

  const authArabicOption = document.querySelector('#auth-language-select option[value="ar"]');
  const appArabicOption = document.querySelector('#app-language-select option[value="ar"]');
  const workspaceArabicOption = document.querySelector('#workspace-language option[value="ar"]');
  if (authArabicOption) authArabicOption.textContent = "\u0627\u0644\u0639\u0631\u0628\u064a\u0629";
  if (appArabicOption) appArabicOption.textContent = "\u0627\u0644\u0639\u0631\u0628\u064a\u0629";
  if (workspaceArabicOption) workspaceArabicOption.textContent = "\u0627\u0644\u0639\u0631\u0628\u064a\u0629";

  const summaryEyebrows = document.querySelectorAll(".summary-banner .eyebrow");
  const summaryKeys = ["modeLabel", "useCaseLabel", "languageLabelShort", "providerLabelShort", "modelLabelShort", "depthLabel", "filesLabelShort", "confidenceLabel", "statusLabel"];
  summaryEyebrows.forEach((node, index) => {
    if (summaryKeys[index]) node.textContent = tr(summaryKeys[index]);
  });

  setText(".chat-block .eyebrow", "chatEyebrow");
  setText(".chat-block h3", "askWorkspaceInstantly");
  setText(".chat-helper", "chatHelper");
  if (questionInput) questionInput.placeholder = tr("questionPlaceholder");

  const navKeys = {
    overview: "overviewTab",
    files: "filesTab",
    studio: "studioTab",
    review: "reviewTab"
  };
  document.querySelectorAll(".workspace-tab").forEach((button) => {
    const key = navKeys[button.dataset.tab];
    if (key) button.textContent = tr(key);
  });

  const reviewStatusOption = document.querySelector('#review-status option[value="reviewed"]');
  const followupStatusOption = document.querySelector('#review-status option[value="needs_followup"]');
  const verifiedStatusOption = document.querySelector('#review-status option[value="verified"]');
  if (reviewStatusOption) reviewStatusOption.textContent = tr("reviewed");
  if (followupStatusOption) followupStatusOption.textContent = tr("needsFollowup");
  if (verifiedStatusOption) verifiedStatusOption.textContent = tr("verified");
  const reviewLabels = document.querySelectorAll("#review-form .field > span");
  if (reviewLabels[0]) reviewLabels[0].textContent = tr("statusField");
  if (reviewLabels[1]) reviewLabels[1].textContent = tr("noteLabel");
  const reviewNote = document.querySelector("#review-note");
  if (reviewNote) reviewNote.placeholder = tr("reviewPlaceholder");
  setText("#review-button", "saveReview");

  const overviewEyebrows = document.querySelectorAll('[data-section="overview"] .analysis-card .eyebrow, .analysis-hero .eyebrow, .metrics-row .metric-card span, .metrics-row .metric-card small');
  if (overviewEyebrows.length) {
    setText(".hero-summary .eyebrow", "executiveBrief");
    setText(".hero-summary h3", "mainTakeaway");
    setText(".hero-theory .eyebrow", "workingAngle");
    setText(".uncertainty-box span", "uncertainty");
  }

  const metricCards = document.querySelectorAll(".metrics-row .metric-card");
  const metricHeadings = ["findingsLabel", "evidenceLabel", "contradictionsLabel", "openQuestionsLabel"];
  const metricSubheads = ["evidenceBacked", "citedSources", "conflictsFound", "requiresReview"];
  metricCards.forEach((card, index) => {
    const top = card.querySelector("span");
    const sub = card.querySelector("small");
    if (top && metricHeadings[index]) top.textContent = tr(metricHeadings[index]);
    if (sub && metricSubheads[index]) sub.textContent = tr(metricSubheads[index]);
  });

  const sectionMap = [
    [".analysis-grid .analysis-card:nth-of-type(1) .eyebrow", "readinessSnapshot"],
    [".analysis-grid .analysis-card:nth-of-type(1) h3", "scorecard"],
    [".analysis-grid .analysis-card:nth-of-type(2) .eyebrow", "development"],
    [".analysis-grid .analysis-card:nth-of-type(2) h3", "buildNext"],
    ['[data-section="overview"] .split-grid .analysis-card:nth-of-type(1) .eyebrow', "strengthsTitle"],
    ['[data-section="overview"] .split-grid .analysis-card:nth-of-type(1) h3', "strengthsSubtitle"],
    ['[data-section="overview"] .split-grid .analysis-card:nth-of-type(2) .eyebrow', "weaknessesTitle"],
    ['[data-section="overview"] .split-grid .analysis-card:nth-of-type(2) h3', "weaknessesSubtitle"],
    ['[data-section="overview"] .split-grid .analysis-card:nth-of-type(3) .eyebrow', "opportunitiesTitle"],
    ['[data-section="overview"] .split-grid .analysis-card:nth-of-type(3) h3', "opportunitiesSubtitle"],
    ['[data-section="overview"] .split-grid .analysis-card:nth-of-type(4) .eyebrow', "risksTitle"],
    ['[data-section="overview"] .split-grid .analysis-card:nth-of-type(4) h3', "risksSubtitle"],
    ['[data-section="overview"] .analysis-grid.split-grid:nth-of-type(4) .analysis-card:nth-of-type(1) .eyebrow', "grounding"],
    ['[data-section="overview"] .analysis-grid.split-grid:nth-of-type(4) .analysis-card:nth-of-type(1) h3', "suggestedPrompts"],
    ['[data-section="overview"] .analysis-grid.split-grid:nth-of-type(4) .analysis-card:nth-of-type(2) .eyebrow', "grounding"],
    ['[data-section="overview"] .analysis-grid.split-grid:nth-of-type(4) .analysis-card:nth-of-type(2) h3', "ragStatus"],
    ['[data-section="overview"] .analysis-grid:last-of-type .analysis-card .eyebrow', "ingestion"],
    ['[data-section="overview"] .analysis-grid:last-of-type .analysis-card h3', "uploadReliability"],
    ['[data-section="evidence"] .analysis-card:nth-of-type(1) .eyebrow', "signals"],
    ['[data-section="evidence"] .analysis-card:nth-of-type(1) h3', "keyFindings"],
    ['[data-section="evidence"] .analysis-card:nth-of-type(2) .eyebrow', "grounding"],
    ['[data-section="evidence"] .analysis-card:nth-of-type(2) h3', "bestEvidence"],
    ['[data-section="evidence"] .full-span .eyebrow', "reviewEyebrow"],
    ['[data-section="evidence"] .full-span h3', "contradictionsLabel"],
    ['[data-section="timeline"] .analysis-card:nth-of-type(1) .eyebrow', "flow"],
    ['[data-section="timeline"] .analysis-card:nth-of-type(1) h3', "timelineTitle"],
    ['[data-section="timeline"] .analysis-card:nth-of-type(2) .eyebrow', "reference"],
    ['[data-section="timeline"] .analysis-card:nth-of-type(2) h3', "entitiesTitle"],
    ['[data-section="timeline"] .analysis-grid:nth-of-type(2) .analysis-card:nth-of-type(1) .eyebrow', "nextSteps"],
    ['[data-section="timeline"] .analysis-grid:nth-of-type(2) .analysis-card:nth-of-type(1) h3', "checkNext"],
    ['[data-section="timeline"] .analysis-grid:nth-of-type(2) .analysis-card:nth-of-type(2) .eyebrow', "warnings"],
    ['[data-section="timeline"] .analysis-grid:nth-of-type(2) .analysis-card:nth-of-type(2) h3', "ambiguityWatchouts"],
    ['[data-section="files"] .analysis-card .eyebrow', "sourceLibrary"],
    ['[data-section="files"] .analysis-card h3', "uploadedDocuments"],
    ['[data-section="review"] .analysis-card .eyebrow', "humanReview"],
    ['[data-section="review"] .analysis-card h3', "verificationWorkflow"]
  ];
  sectionMap.forEach(([selector, key]) => setText(selector, key));

  const timelineSubLabels = document.querySelectorAll('[data-section="timeline"] .sub-label');
  if (timelineSubLabels[0]) timelineSubLabels[0].textContent = tr("openQuestionsShort");
  if (timelineSubLabels[1]) timelineSubLabels[1].textContent = tr("suggestedPrompts");

  if (selectedFiles.classList.contains("empty")) {
    selectedFiles.textContent = tr(selectedFiles.dataset.emptyTextKey || "noDocumentsSelected");
  }
}

function formatFileSize(bytes) {
  const size = Number(bytes || 0);
  if (!size) {
    return "size unknown";
  }
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`;
  }
  return `${size} B`;
}

setTimeout(boot, 0);
