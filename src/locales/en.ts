export const en = {
  // App brand
  appName: "RadioVerse India",
  tagline: "India's Radio. One Universe.",
  live: "LIVE",

  // Navigation
  nav: {
    home: "Home",
    discover: "Discover",
    stations: "All Stations",
    categories: "Categories",
    languages: "Languages",
    states: "States",
    favorites: "Favorites",
    history: "Recently Played",
    settings: "Settings",
    admin: "Admin Console",
    installApp: "Install App",
  },

  // Actions
  actions: {
    play: "Play",
    pause: "Pause",
    stop: "Stop",
    retry: "Retry",
    favorite: "Add to Favorites",
    unfavorite: "Remove from Favorites",
    share: "Share Station",
    copyLink: "Copy Link",
    linkCopied: "Station link copied to clipboard!",
    openWebsite: "Broadcaster Website",
    close: "Close",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    search: "Search",
    clear: "Clear",
    filter: "Filter",
    refresh: "Refresh",
    setTimer: "Set Timer",
    turnOffTimer: "Turn Off Timer",
    install: "Install",
  },

  // Search & Filter
  search: {
    placeholder: "Search stations, languages, cities, genres...",
    noResults: "No stations found matching your search.",
    tryAnother: "Try checking your spelling or search for popular terms like 'Mirchi', 'Hindi', 'Tamil' or 'Devotional'.",
    stationsCount: "{count} stations available",
    filterByLanguage: "Language",
    filterByState: "State / Region",
    filterByCategory: "Category",
    sortBy: "Sort By",
    sortPopular: "Most Popular",
    sortName: "Station Name (A-Z)",
    sortRecent: "Recently Added",
    allLanguages: "All Languages",
    allStates: "All States",
    allCategories: "All Categories",
  },

  // Player controls
  player: {
    connecting: "Connecting to stream...",
    buffering: "Buffering audio...",
    playing: "Now Playing Live",
    paused: "Paused",
    reconnecting: "Reconnecting to stream...",
    error: "Unable to play stream",
    streamUnavailable: "This station stream is currently unavailable. Please try another station.",
    volume: "Volume",
    mute: "Mute",
    unmute: "Unmute",
    expand: "Expand Player",
    collapse: "Collapse Player",
    next: "Next Station",
    prev: "Previous Station",
    liveStream: "Live Broadcast",
    sleepTimerActive: "Sleep timer: {time} remaining",
    autoplayBlocked: "Audio autoplay was blocked by your browser. Click play to listen.",
  },

  // Sleep Timer
  sleepTimer: {
    title: "Sleep Timer",
    subtitle: "Playback will automatically stop after the selected duration.",
    presets: "Quick Presets",
    custom: "Custom Duration",
    minutes: "{min} mins",
    customPlaceholder: "Enter minutes (1-180)",
    start: "Start Timer",
    cancel: "Cancel Timer",
    activeCountdown: "Stopping audio in {time}",
    fadingOut: "Fading out audio...",
  },

  // Favorites & History
  favorites: {
    title: "Favorite Stations",
    emptyTitle: "No favorite stations yet",
    emptyDescription: "Click the heart icon on any station card to pin it here for quick one-click listening.",
    exploreStations: "Discover Stations",
    searchFavorites: "Search saved favorites...",
  },

  history: {
    title: "Recently Played",
    emptyTitle: "No listening history yet",
    emptyDescription: "Stations you listen to will automatically appear here so you can easily tune back in.",
    clearHistory: "Clear History",
    historyCleared: "Listening history cleared.",
  },

  // Categories
  categories: {
    title: "Browse by Genre & Mood",
    subtitle: "Curated collections from Bollywood blockbusters to classical ragas and regional folklore.",
    bollywood: "Bollywood",
    bhojpuri: "Bhojpuri",
    hindi: "Hindi Hits",
    english: "English & International",
    news: "News & Talk",
    devotional: "Devotional & Spiritual",
    retro: "Retro Classics",
    classical: "Classical & Carnatic",
    regional: "Regional Folk",
    punjabi: "Punjabi Beats",
    tamil: "Tamil Hits",
    telugu: "Telugu Hits",
  },

  // Languages
  languages: {
    title: "Indian & Global Languages",
    subtitle: "Tune in to broadcasts in the language of your heart.",
    hindi: "Hindi",
    tamil: "Tamil",
    telugu: "Telugu",
    bengali: "Bengali",
    marathi: "Marathi",
    punjabi: "Punjabi",
    bhojpuri: "Bhojpuri",
    malayalam: "Malayalam",
    kannada: "Kannada",
    gujarati: "Gujarati",
    odia: "Odia",
    urdu: "Urdu",
    english: "English",
  },

  // States
  states: {
    title: "Stations by Indian State",
    subtitle: "Local community radios and regional broadcasting stations across India.",
    delhi: "Delhi NCR",
    maharashtra: "Maharashtra",
    karnataka: "Karnataka",
    tamilNadu: "Tamil Nadu",
    westBengal: "West Bengal",
    punjab: "Punjab",
    uttarPradesh: "Uttar Pradesh",
    bihar: "Bihar",
    gujarat: "Gujarat",
    kerala: "Kerala",
    rajasthan: "Rajasthan",
    telangana: "Telangana",
  },

  // Settings
  settings: {
    title: "Application Settings",
    languageSection: "Display Language",
    languageDesc: "Choose your preferred interface language (English or Hindi).",
    themeSection: "Appearance Theme",
    themeDesc: "Switch between dark charcoal and light visual themes.",
    themeDark: "Dark Mode",
    themeLight: "Light Mode",
    themeSystem: "System Default",
    playbackSection: "Playback Preferences",
    autoResume: "Remember last played station",
    autoResumeDesc: "Automatically restore your last active radio station upon reopening the app.",
    storageSection: "Storage & Privacy",
    storageDesc: "Your listening history and favorites are stored safely on your device.",
    clearData: "Clear All Local Data",
    dataCleared: "All local favorites and history have been cleared.",
    aboutSection: "About RadioVerse India",
    version: "Version",
    disclaimer: "Legal Notice: RadioVerse India indexes publicly broadcasted audio feeds. All trademarks, channel logos, and streaming rights remain the exclusive property of their respective broadcasters.",
  },

  // Station Detail Page
  stationDetail: {
    verifiedBadge: "Verified Stream",
    unverifiedBadge: "Community Feed",
    officialLink: "Official Broadcaster Portal",
    shareMessage: "Listen to {station} live on RadioVerse India!",
    relatedStations: "You May Also Like",
    technicalInfo: "Stream Technical Details",
    codec: "Audio Codec",
    bitrate: "Bitrate",
    streamType: "Stream Protocol",
    status: "Playback Status",
  },

  // PWA & Offline
  pwa: {
    installPrompt: "Install RadioVerse India",
    installDesc: "Get quick desktop or home-screen access with seamless playback and full-screen controls.",
    offlineTitle: "You are currently offline",
    offlineDesc: "Live audio streaming requires an active internet connection. Your saved favorites and station directory will remain accessible once reconnected.",
    retryConnection: "Check Connection & Retry",
    iosInstructions: "To install on iOS: tap the Share button in Safari and select 'Add to Home Screen'.",
  },

  // Admin
  admin: {
    title: "RadioVerse Administrative Console",
    overview: "Dashboard Overview",
    stations: "Station Management",
    health: "Stream Health Monitor",
    audit: "Audit Logs",
    categories: "Categories",
    totalStations: "Total Stations",
    playableCount: "Verified Playable",
    degradedCount: "Degraded Streams",
    unavailableCount: "Offline / Inactive",
    recheckStream: "Recheck Stream Health",
    addStation: "Add New Station",
    editStation: "Edit Station",
    deleteConfirm: "Are you sure you want to delete this station?",
    lastChecked: "Last checked",
    statusHealthy: "Healthy",
    statusDegraded: "Degraded",
    statusUnavailable: "Unavailable",
    bulkImport: "Bulk Import",
    exportData: "Export Stations",
    loginTitle: "Administrative Sign In",
    loginSubtitle: "Restricted access. Only authorized personnel may sign in.",
    email: "Email Address",
    password: "Password",
    signIn: "Sign In to Console",
    signOut: "Sign Out",
  },
} as const;

type DeepString<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepString<T[K]> : string;
};

export type TranslationKey = DeepString<typeof en>;
